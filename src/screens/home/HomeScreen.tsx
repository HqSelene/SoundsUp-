import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, ScrollView, Modal, Platform } from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setStatus, startRecording, stopRecording } from '../../store/slices/recordingSlice';
import { setConcertInfo } from '../../store/slices/concertSlice';
import { uploadSuccess, uploadFailure, startUpload, clearUploadError, clearLastUpload } from '../../store/slices/uploadSlice';
import { addPendingTicket, updatePendingTicket, completePendingTicket } from '../../store/slices/ticketSlice';
import { AudioService } from '../../services/audio/AudioService';
import { UploadService } from '../../services/api/UploadService';
import { ConcertInfo, UploadResult } from '../../types';
import { styles } from './HomeScreen.styles';
import { clearConcertInfo } from '../../store/slices/concertSlice';

const HomeScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { isRecording, status } = useSelector((state: RootState) => state.recording);
  const { info: concertInfo, isConfigured } = useSelector((state: RootState) => state.concert);
  const [audioService] = useState(() => new AudioService());
  const [recordingTime, setRecordingTime] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [showConcertModal, setShowConcertModal] = useState(false);
  const [tempConcertInfo, setTempConcertInfo] = useState<ConcertInfo>({
    time: '',
    location: '',
    artist: '',
    concertName: '',
    description: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Video reference for expo-av
  const videoRef = useRef<Video>(null);
  
  // Recording timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const formatDateTime = (date: Date, time: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const formattedDateTime = formatDateTime(selectedDate, selectedTime);
      setTempConcertInfo(prev => ({ ...prev, time: formattedDateTime }));
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setSelectedTime(selectedTime);
      const formattedDateTime = formatDateTime(selectedDate, selectedTime);
      setTempConcertInfo(prev => ({ ...prev, time: formattedDateTime }));
    }
  };

  useEffect(() => {
    initializeAudio();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (concertInfo) {
      setTempConcertInfo(concertInfo);
    }
  }, [concertInfo]);

  useEffect(() => {
    if (isRecording) {
      startTimer();
      if (videoRef.current) {
        videoRef.current.playAsync();
      }
    } else {
      stopTimer();
      if (videoRef.current) {
        videoRef.current.pauseAsync();
        videoRef.current.setPositionAsync(0);
      }
    }
  }, [isRecording]);

  const initializeAudio = async () => {
    try {
      await audioService.initialize();
      setIsInitialized(true);
      dispatch(setStatus('offline'));
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  };

  const startTimer = () => {
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordingTime(0);
  };

  const { isUploading, lastUpload, error: uploadError } = useSelector((state: RootState) => state.upload);
  const [uploadService] = useState(() => new UploadService());

  const handleRecordingToggle = async () => {
    if (!isInitialized) {
      console.warn('Audio service not initialized');
      return;
    }

    if (!isConfigured) {
      setShowConcertModal(true);
      return;
    }

    try {
      if (isRecording) {
        const uri = await audioService.stopRecording();
        dispatch(stopRecording({ filePath: uri }));
        dispatch(setStatus('completed'));
        setHasRecorded(true);
        
        // 自动上传录音
        await handleUploadRecording(uri);
      } else {
        const recording = await audioService.startRecording();
        dispatch(startRecording(recording));
        dispatch(setStatus('recording'));
      }
    } catch (error) {
      console.error('Recording error:', error);
      dispatch(setStatus('offline'));
    }
  };

  const handleUploadRecording = async (audioUri: string) => {
    if (!concertInfo) return;
    const pendingTicketId = `pending_${Date.now()}`;
    try {
      
      
      dispatch(addPendingTicket({
        id: pendingTicketId,
        concertInfo,
        audioUri,
        createdAt: new Date().toISOString(),
        status: 'pending'
      }));
      
      dispatch(startUpload());
      dispatch(updatePendingTicket({ id: pendingTicketId, status: 'processing' }));
      
      const result = await uploadService.uploadRecording(audioUri, concertInfo);
      
      if (result && result.data) {
        dispatch(completePendingTicket({
          pendingId: pendingTicketId,
          ticket: {
            id: result.data.id || `ticket_${Date.now()}`,
            recordingId: `recording_${Date.now()}`,
            analysisId: result.data.analysis_id || result.data.id || '',
            title: `${concertInfo.artist} - ${concertInfo.concertName || 'Concert'}`,
            description: concertInfo.description || '',
            emotions: result.data.emotion_distribution || {},
            dominantEmotion: Object.keys(result.data.emotion_distribution || {})[0] || 'Energy',
            waveformData: [], // 需要从音频文件生成或从服务器获取
            cosmicTheme: {
              primaryColor: '#4ECDC4',
              secondaryColor: '#45B7D1',
              gradientColors: ['#4ECDC4', '#45B7D1', '#96CEB4']
            },
            timestamp: Date.now(),
            isFavorite: false,
            concertInfo,
            image: result.data.image,
            text: result.data.text,
            createdAt: new Date().toISOString(),
            status: 'completed' as const,
            audioUri
        }
        }));
        
        dispatch(uploadSuccess(result));
        
        // 显示成功提示弹窗
        setShowSuccessModal(true);
        
        // 3秒后自动关闭弹窗并重置状态
        setTimeout(() => {
          setShowSuccessModal(false);
          dispatch(setStatus('offline'));
          setHasRecorded(false);
          dispatch(clearConcertInfo()); 
          dispatch(clearLastUpload());
        }, 3000);
        
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      dispatch(updatePendingTicket({ id: pendingTicketId, status: 'failed' }));
      dispatch(uploadFailure(error instanceof Error ? error.message : 'Upload failed'));
      dispatch(setStatus('offline'));
    }
  };

  const showUploadResult = (result: UploadResult) => {
    // 可以显示一个模态框或导航到结果页面
    console.log('Upload result:', result);
    // 这里可以添加显示图片和文字的逻辑
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch (status) {
      case 'recording':
        return 'RECORDING';
      case 'completed':
        return 'COMPLETED';
      case 'uploading':
        return 'UPLOADING';
      default:
        return 'OFFLINE';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'recording':
        return '#FF6B6B';
      case 'completed':
        return '#4ECDC4';
      case 'uploading':
        return '#45B7D1';
      default:
        return '#95A5A6';
    }
  };

  // Render background content based on state
  const renderBackground = () => {
    if (isRecording) {
      return (
        <Video
          ref={videoRef}
          source={require('../../../assets/recording2.mp4')}
          style={styles.backgroundMedia}
          shouldPlay={isRecording}
          isLooping
          isMuted
          resizeMode="cover" as any
        />
      );
    } else
      return (
        <Image
          source={require('../../../assets/back.png')}
          style={styles.backgroundMedia}
          resizeMode="cover"
        />
      );
  };

  const handleSaveConcertInfo = () => {
    if (tempConcertInfo.artist.trim()) {
      dispatch(setConcertInfo(tempConcertInfo));
      setShowConcertModal(false);
    }
  };

  const renderConcertModal = () => (
    <Modal
      visible={showConcertModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowConcertModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Concert Info Setting</Text>
            <TouchableOpacity
              onPress={() => setShowConcertModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Artist *</Text>
              <TextInput
                style={styles.textInput}
                value={tempConcertInfo.artist}
                onChangeText={(text) => setTempConcertInfo(prev => ({ ...prev, artist: text }))}
                placeholder="Please input artist information:"
                placeholderTextColor="#666"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Concert Name</Text>
              <TextInput
                style={styles.textInput}
                value={tempConcertInfo.concertName}
                onChangeText={(text) => setTempConcertInfo(prev => ({ ...prev, concertName: text }))}
                placeholder="Please input concert name"
                placeholderTextColor="#666"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time</Text>
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateTimeText}>
                    {selectedDate.toLocaleDateString('zh-CN')}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#4ECDC4" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.dateTimeText}>
                    {selectedTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Ionicons name="time" size={20} color="#4ECDC4" />
                </TouchableOpacity>
              </View>
              
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                />
              )}
              
              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onTimeChange}
                />
              )}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.textInput}
                value={tempConcertInfo.location}
                onChangeText={(text) => setTempConcertInfo(prev => ({ ...prev, location: text }))}
                placeholder="Such as Beijing"
                placeholderTextColor="#666"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={tempConcertInfo.description}
                onChangeText={(text) => setTempConcertInfo(prev => ({ ...prev, description: text }))}
                placeholder="This is my favorite artist"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                !tempConcertInfo.artist.trim() && styles.saveButtonDisabled
              ]}
              onPress={handleSaveConcertInfo}
              disabled={!tempConcertInfo.artist.trim()}
            >
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderConcertInfo = () => {
    if (!isConfigured) {
      return null;
    }

  return (
    <TouchableOpacity
      style={styles.concertInfoContainer}
      onPress={() => setShowConcertModal(true)}
    >
      <View style={styles.concertInfoHeader}>
        <Ionicons name="musical-notes" size={20} color="#4ECDC4" />
        <Text style={styles.concertInfoTitle}>{concertInfo?.concertName || 'Concert'}</Text>
      </View>
      <Text style={styles.concertInfoArtist}>{concertInfo?.artist}</Text>
      {concertInfo?.time && (
        <Text style={styles.concertInfoDetail}>{concertInfo.time}</Text>
      )}
      {concertInfo?.location && (
        <Text style={styles.concertInfoDetail}>{concertInfo.location}</Text>
      )}
    </TouchableOpacity>
  )};

  const renderSuccessModal = () => (
    <Modal
      visible={showSuccessModal}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.successModalOverlay}>
        <View style={styles.successModalContainer}>
          <Ionicons name="checkmark-circle" size={60} color="#4ECDC4" />
          <Text style={styles.successModalTitle}>Upload Sucess</Text>
          <Text style={styles.successModalText}>Wait to process...</Text>
        </View>
      </View>
    </Modal>
  );

    return (
    <View style={styles.container}>
      {/* Background gradient overlay */}
      <View style={styles.gradientOverlay} />
      
      {/* Main card container */}
      <View style={styles.cardContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SoundsUp</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>

        {/* Concert Info Section */}
        {renderConcertInfo()}

        {/* Main content area */}
        <View style={styles.contentArea}>
          {renderBackground()}
          
          {/* Recording timer overlay */}
          {isRecording && (
            <View style={styles.timerOverlay}>
              <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
            </View>
          )}
        </View>

        {/* Recording button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording ? styles.recordButtonActive : styles.recordButtonInactive,
            ]}
            onPress={handleRecordingToggle}
            disabled={!isInitialized}
          >
            <Text style={styles.buttonText}>
              {!isConfigured ? 'Set Concert Info' : (isRecording ? 'Stop Recording' : 'Start Recording')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {renderConcertModal()}
      {renderSuccessModal()}
      
      {/* 显示上传状态 */}
      {isUploading && (
        <View style={styles.uploadingOverlay}>
          <Text style={styles.uploadingText}>Uploading...</Text>
        </View>
      )}
      
      {/* 显示上传错误 */}
      {uploadError && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>Failed to upload{uploadError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(clearUploadError())}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default HomeScreen;