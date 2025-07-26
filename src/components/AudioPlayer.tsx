import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { COSMIC_THEME } from '../constants/theme';
import { getAudioUri } from '../constants/audioAssets';

interface AudioPlayerProps {
  audioUri?: string;
  onPlaybackStatusUpdate?: (status: any) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioUri, 
  onPlaybackStatusUpdate 
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    if (audioUri) {
      loadAudio();
    }
  }, [audioUri]);

  const loadAudio = async () => {
    if (!audioUri) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // 卸载之前的音频
      if (sound) {
        await sound.unloadAsync();
      }

      // 设置音频模式
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // 获取音频 URI
      let finalAudioUri: string;
      
      // 检查是否是音频键名
      const mappedUri = await getAudioUri(audioUri);
      if (mappedUri) {
        finalAudioUri = mappedUri;
      } else {
        // 如果不是键名，直接使用原始 URI
        finalAudioUri = audioUri;
      }

      // 加载新音频
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: finalAudioUri },
        { shouldPlay: false },
        handlePlaybackStatusUpdate
      );
      
      setSound(newSound);
      
      // 获取音频时长
      const status = await newSound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
      }
    } catch (error) {
      console.error('Failed to load audio:', error);
      setError('Unable to load audio file');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
    
    if (onPlaybackStatusUpdate) {
      onPlaybackStatusUpdate(status);
    }
  };

  const togglePlayback = async () => {
    if (!sound) return;
    
    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
      }
    } catch (error) {
      console.error('Failed to toggle playback:', error);
      setError('播放失败');
    }
  };

  const seekTo = async (positionMillis: number) => {
    if (!sound) return;
    
    try {
      await sound.setPositionAsync(positionMillis);
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!audioUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.noAudioText}>没有音频文件</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadAudio} style={styles.retryButton}>
          <Text style={styles.retryText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="musical-notes" size={20} color="#4ECDC4" />
        <Text style={styles.title}>录音回放</Text>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity 
          onPress={togglePlayback} 
          style={styles.playButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <Ionicons name="hourglass" size={24} color="#4ECDC4" />
          ) : (
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={24} 
              color="#4ECDC4" 
            />
          )}
        </TouchableOpacity>
        
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeSeparator}>/</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>
      
      {/* 进度条 */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${duration > 0 ? (position / duration) * 100 : 0}%` }
            ]} 
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: COSMIC_THEME.colors.text,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  timeSeparator: {
    color: COSMIC_THEME.colors.textSecondary,
    fontSize: 14,
    marginHorizontal: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
  },
  noAudioText: {
    color: COSMIC_THEME.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  retryText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
  },
});