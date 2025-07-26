// Core application types for SoundsUp

export interface AudioRecording {
  id: string;
  filename: string;
  duration: number;
  timestamp: number;
  filePath: string;
  status: 'recording' | 'completed' | 'uploading' | 'analyzed';
}

export interface EmotionAnalysis {
  id: string;
  recordingId: string;
  emotions: {
    Energy: number;
    Sadness: number; 
    Joy: number;   
    Excitement: number;   
    Nostalgia: number;   
    Romance: number;   
    Tension: number;   
    Calm: number;   
  };
  dominantEmotion: 'Energy' | 'Sadness' | 'Joy' | 'Excitement' | 'Nostalgia' | 'Romance' | 'Tension' | 'Calm';
  waveformData: number[];
  timestamp: number;
}

export interface Ticket {
  id: string;
  recordingId: string;
  analysisId: string;
  title: string;
  description: string;
  emotions: EmotionAnalysis['emotions'];
  dominantEmotion: EmotionAnalysis['dominantEmotion'];
  waveformData: number[];
  cosmicTheme: {
    primaryColor: string;
    secondaryColor: string;
    gradientColors: string[];
  };
  timestamp: number;
  isFavorite: boolean;
  concertInfo: ConcertInfo;  // 演唱会信息
  image?: string;            // 生成的ticket图片URI
  text?: string;             // AI分析文本
  createdAt: string;         // 创建时间
  status: 'completed';       // 状态（Collection只显示已完成的）
  audioUri?: string;         // 音频文件URI
}

export interface ConcertInfo {
  time?: string;
  location?: string;
  artist: string; // 必填字段
  concertName?: string;
  description?: string;
}

export interface UploadResult {
  id: string;
  image?: string;
  text?: string;
  uploadTime: string;
  concertInfo: ConcertInfo;
}

export interface AppState {
  recording: {
    isRecording: boolean;
    currentRecording: AudioRecording | null;
    recordings: AudioRecording[];
    status: 'offline' | 'recording' | 'uploading' | 'completed';
  };
  concert: {
    info: ConcertInfo | null;
    isConfigured: boolean;
  };
  tickets: {
    items: Ticket[];
    loading: boolean;
    error: string | null;
  };
  user: {
    preferences: {
      notifications: boolean;
      backgroundRecording: boolean;
      audioQuality: 'low' | 'medium' | 'high';
    };
  };
}

export interface CosmicTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    accent: string;
    text: string;
    textSecondary: string;
    // Emotion colors
    calm: string;
    energetic: string;
    dreamy: string;
    // Gradient colors
    spaceGradient: string[];
    planetGradient: string[];
    starGradient: string[];
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: {
      fontSize: number;
      fontWeight: 'bold' | 'normal' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    };
    h2: {
      fontSize: number;
      fontWeight: 'bold' | 'normal' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    };
    body: {
      fontSize: number;
      fontWeight: 'bold' | 'normal' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    };
    caption: {
      fontSize: number;
      fontWeight: 'bold' | 'normal' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    };
  };
}

export interface PendingTicket {
  id: string;
  concertInfo: ConcertInfo;
  audioUri: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  uploadProgress?: number;
}
