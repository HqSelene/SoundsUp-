import { ConcertInfo } from '../../types';

export interface UploadResponse {
  success: boolean;
  data?: {
    id?: string;
    image?: string;
    text?: string;
    analysis_id?: string;
    emotion_distribution?: Record<string, number>;
    dominant_emotion?: string;
    waveform_data?: number[];
  };
  error?: string;
}

export class UploadService {
  private baseUrl: string;

  // 这里是自己设置远端服务器API，主要实现了从音频到情绪分析、最后到图生成的过程
  constructor(baseUrl: string = 'https://70aaec12129a6ec9-5000.us-ca-3.gpu-instance.ppinfra.com') {
    this.baseUrl = baseUrl;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl);
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async uploadRecording(
    audioUri: string,
    concertInfo: ConcertInfo
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      
      // 正确的React Native文件上传格式
      const filename = `recording_${Date.now()}.m4a`;
      
      // 关键修改：使用正确的文件对象格式
      const fileObj = {
        uri: audioUri,
        type: 'audio/m4a',
        name: filename,
      };
      
      // 在React Native中，需要这样添加文件
      formData.append('audio_file', fileObj as any);
      
      // 添加演唱会信息
      formData.append('concert_time', concertInfo.time || '');
      formData.append('concert_location', concertInfo.location || '');
      formData.append('artist', concertInfo.artist || '');
      formData.append('description', concertInfo.description || '');
      
      console.log('Uploading file:', filename);
      console.log('File URI:', audioUri);
      console.log('File object:', fileObj);
      
      const response = await fetch(`${this.baseUrl}/analyze_concert`, {
        method: 'POST',
        // 重要：不要手动设置Content-Type，让系统自动处理
        body: formData,
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Upload success:', result);
      
      // 关键修改：将服务器响应包装在data对象中
      return {
        success: result.success,
        data: {
          id: result.analysis_id,
          image: result.generated_image ? `data:image/jpeg;base64,${result.generated_image}` : undefined,
          text: result.text_summary,
          analysis_id: result.analysis_id,
          emotion_distribution: result.emotion_distribution,
        },
      };
    } catch (error) {
      console.error('Upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }
}