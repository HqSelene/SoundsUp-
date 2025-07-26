import { Audio } from 'expo-av';
import { AudioRecording } from '../../types';
import { generateId } from '../../utils';
import { RECORDING_CONFIG } from '../../constants/theme';

export class AudioService {
  private recording: Audio.Recording | null = null;
  private isRecording: boolean = false;

  async initialize(): Promise<void> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio permission not granted');
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
    } catch (error) {
      console.error('Failed to initialize audio service:', error);
      throw error;
    }
  }

  async startRecording(): Promise<AudioRecording> {
    try {
      if (this.isRecording) {
        throw new Error('Recording already in progress');
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      this.recording = recording;
      this.isRecording = true;
      
      const audioRecording: AudioRecording = {
        id: generateId(),
        filename: `recording_${Date.now()}.m4a`,
        duration: 0,
        timestamp: Date.now(),
        filePath: '',
        status: 'recording',
      };
      
      return audioRecording;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<string> {
    try {
      if (!this.recording || !this.isRecording) {
        throw new Error('No recording in progress');
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      this.recording = null;
      this.isRecording = false;
      
      return uri || '';
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  async getRecordingStatus(): Promise<Audio.RecordingStatus> {
    if (!this.recording) {
      throw new Error('No recording in progress');
    }
    
    return await this.recording.getStatusAsync();
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  async pauseRecording(): Promise<void> {
    if (!this.recording) {
      throw new Error('No recording in progress');
    }
    
    await this.recording.pauseAsync();
  }

  async resumeRecording(): Promise<void> {
    if (!this.recording) {
      throw new Error('No recording in progress');
    }
    
    await this.recording.startAsync();
  }
}