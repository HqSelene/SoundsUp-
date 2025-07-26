import { CosmicTheme } from '../types';

export const COSMIC_THEME: CosmicTheme = {
  colors: {
    primary: '#1a1a2e',      // Deep space blue
    secondary: '#16213e',     // Darker space blue
    background: '#0a0a1a',    // Almost black space
    surface: '#1e1e3a',      // Surface elements
    accent: '#7b68ee',       // Cosmic purple
    text: '#e6e6fa',         // Light lavender
    textSecondary: '#9d9db3', // Muted lavender
    
    // Emotion colors
    calm: '#4a90e2',         // Serene blue
    energetic: '#e74c3c',    // Vibrant red
    dreamy: '#9b59b6',       // Mystical purple
    
    // Gradient colors
    spaceGradient: ['#0a0a1a', '#1a1a2e', '#16213e'],
    planetGradient: ['#7b68ee', '#9b59b6', '#4a90e2'],
    starGradient: ['#ffd700', '#fff8dc', '#e6e6fa'],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: 'bold' as const,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal' as const,
    },
    caption: {
      fontSize: 12,
      fontWeight: '500' as const,
    },
  },
};

export const ANIMATION_DURATION = {
  short: 200,
  medium: 400,
  long: 600,
};

export const RECORDING_CONFIG = {
  format: 'mp4',
  quality: 'high',
  channels: 2,
  sampleRate: 44100,
  bitRate: 128000,
} as const;

export const EMOTION_THRESHOLDS = {
  calm: { min: 0, max: 40 },
  energetic: { min: 60, max: 100 },
  dreamy: { min: 40, max: 80 },
} as const;