// Utility functions for SoundsUp

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

export const getEmotionColor = (emotion: 'calm' | 'energetic' | 'dreamy'): string => {
  const colors = {
    calm: '#4a90e2',
    energetic: '#e74c3c',
    dreamy: '#9b59b6',
  };
  return colors[emotion];
};

export const calculateDominantEmotion = (emotions: { calm: number; energetic: number; dreamy: number }): 'calm' | 'energetic' | 'dreamy' => {
  const { calm, energetic, dreamy } = emotions;
  if (calm >= energetic && calm >= dreamy) return 'calm';
  if (energetic >= dreamy) return 'energetic';
  return 'dreamy';
};

export const validateAudioFile = (filename: string): boolean => {
  const validExtensions = ['.mp3', '.wav', '.m4a', '.aac'];
  return validExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

export const generateWaveformData = (length: number = 50): number[] => {
  return Array.from({ length }, () => Math.random() * 100);
};