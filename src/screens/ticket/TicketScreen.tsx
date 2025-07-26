import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { COSMIC_THEME } from '../../constants/theme';
import { RootState } from '../../store';
import { PendingTicket, Ticket } from '../../types';
import { removePendingTicket } from '../../store/slices/ticketSlice';
import { AudioPlayer } from '../../components/AudioPlayer';
import EmotionPieChart from '../../components/EmotionPieChart';
import { SmartImage } from '../../components/SmartImage';

const TicketScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { items: tickets, pendingItems } = useSelector((state: RootState) => state.tickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const renderPendingItem = ({ item }: { item: PendingTicket }) => (
    <View style={styles.pendingCard}>
      <View style={styles.cardHeader}>
        <Ionicons name="hourglass" size={20} color="#FFA500" />
        <Text style={styles.pendingTitle}>生成中...</Text>
        {item.status === 'failed' && (
          <TouchableOpacity
            onPress={() => dispatch(removePendingTicket(item.id))}
            style={styles.removeButton}
          >
            <Ionicons name="close" size={16} color="#FF6B6B" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.artistName}>{item.concertInfo.artist}</Text>
      <Text style={styles.concertName}>{item.concertInfo.concertName}</Text>
      <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleString()}</Text>
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
        <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
      </View>
    </View>
  );

  const renderTicketItem = ({ item }: { item: Ticket }) => (
    <TouchableOpacity 
      style={styles.ticketCard}
      onPress={() => {
        setSelectedTicket(item);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.cardHeader}>
        <Ionicons name="musical-notes" size={20} color="#4ECDC4" />
        <Text style={styles.ticketTitle}>Finished</Text>
        <Ionicons name="chevron-forward" size={16} color="#4ECDC4" style={styles.chevronIcon} />
      </View>
      
      {/* 添加图片显示 */}
      {item.image && (
        <View style={styles.ticketImageContainer}>
          <SmartImage
            source={item.image}
            style={styles.ticketImage}
            resizeMode="cover"
          />
        </View>
      )}
      
      <Text style={styles.artistName}>{item.concertInfo.artist}</Text>
      <Text style={styles.concertName}>{item.concertInfo.concertName || 'Concert'}</Text>
      <Text style={styles.description}>{item.concertInfo.description}</Text>
      <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  // 详情弹窗组件
  const renderDetailModal = () => {
    if (!selectedTicket) return null;

    // 模拟情绪分析数据（基于服务器返回的文本分析）
    const emotionData = {
      calm: 34,
      joyful: 27,
      anticipation: 22,
      excitement: 17
    };

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.detailModalOverlay}>
          <View style={styles.detailModalContainer}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Ticket Information</Text>
              <TouchableOpacity
                onPress={() => setShowDetailModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.detailContent}>
              {/* 基本信息 */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Concert</Text>
                <Text style={styles.artistName}>{selectedTicket.concertInfo.artist}</Text>
                <Text style={styles.concertName}>{selectedTicket.concertInfo.concertName || '演唱会'}</Text>
                <Text style={styles.description}>{selectedTicket.concertInfo.description}</Text>
                {selectedTicket.concertInfo.time && (
                  <Text style={styles.detailText}>Time: {selectedTicket.concertInfo.time}</Text>
                )}
                {selectedTicket.concertInfo.location && (
                  <Text style={styles.detailText}>Location: {selectedTicket.concertInfo.location}</Text>
                )}
              </View>

              {/* 情绪分析 */}
              <View style={styles.emotionSection}>
                <Text style={styles.sectionTitle}>Emotion Analysis</Text>
                <EmotionPieChart 
                  emotionData={selectedTicket.emotions || {
                    'Energy': 25,
                    'Sadness': 20,
                    'Joy': 15,
                    'Excitement': 12,
                    'Nostalgia': 10,
                    'Romance': 8,
                    'Tension': 5,
                    'Calm': 5
                  }}
                  size={220}
                />
              </View>

              {/* 参考图片 */}
              {selectedTicket.image && (
                <View style={styles.imageSection}>
                  <Text style={styles.sectionTitle}>Digital Ticket</Text>
                  <SmartImage 
                    source={selectedTicket.image}
                    style={styles.referenceImage}
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* 分析文本 */}
              {selectedTicket.text && (
                <View style={styles.textSection}>
                  <Text style={styles.sectionTitle}>Analysis Result</Text>
                  <Text style={styles.analysisText}>{selectedTicket.text}</Text>
                </View>
              )}
              
              {/* 音频播放器 - 添加到最底部 */}
              <AudioPlayer audioUri={selectedTicket.audioUri} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'processing': return '#4ECDC4';
      case 'failed': return '#FF6B6B';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '等待处理';
      case 'processing': return '处理中';
      case 'failed': return '处理失败';
      default: return '未知状态';
    }
  };

  const allItems = [...pendingItems, ...tickets].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cosmic Tickets</Text>
      <Text style={styles.subtitle}>Your emotion analysis results</Text>
      
      {allItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No tickets yet</Text>
          <Text style={styles.emptySubtext}>Start recording to create your first cosmic ticket</Text>
        </View>
      ) : (
        <FlatList
          data={allItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            if ('status' in item && item.status !== 'completed') {
              return renderPendingItem({ item: item as PendingTicket });
            }
            return renderTicketItem({ item: item as Ticket });
          }}
          contentContainerStyle={styles.listContainer}
        />
      )}
      
      {renderDetailModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COSMIC_THEME.colors.background,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COSMIC_THEME.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COSMIC_THEME.colors.textSecondary,
    marginBottom: 24,
  },
  listContainer: {
    paddingBottom: 20,
  },
  pendingCard: {
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.3)',
  },
  ticketCard: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pendingTitle: {
    color: '#FFA500',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  ticketTitle: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  removeButton: {
    padding: 4,
  },
  artistName: {
    color: COSMIC_THEME.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  concertName: {
    color: COSMIC_THEME.colors.textSecondary,
    fontSize: 16,
    marginBottom: 8,
  },
  analysisText: {
    color: COSMIC_THEME.colors.text,
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  timestamp: {
    color: COSMIC_THEME.colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: COSMIC_THEME.colors.textSecondary,
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: COSMIC_THEME.colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COSMIC_THEME.colors.textSecondary,
    textAlign: 'center',
  },
  chevronIcon: {
    marginLeft: 'auto',
  },
  description: {
    color: COSMIC_THEME.colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  detailModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModalContainer: {
    backgroundColor: COSMIC_THEME.colors.background,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(78, 205, 196, 0.3)',
  },
  detailTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  detailContent: {
    padding: 20,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#4ECDC4',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailText: {
    color: COSMIC_THEME.colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  emotionSection: {
    marginBottom: 24,
  },
  emotionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emotionWaveform: {
    marginRight: 20,
  },
  waveformCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ECDC4',
  },
  emotionList: {
    flex: 1,
  },
  emotionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  emotionLabel: {
    color: COSMIC_THEME.colors.text,
    fontSize: 14,
  },
  emotionPercentage: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: 'bold',
  },
  imageSection: {
    marginBottom: 24,
  },
  referenceImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  textSection: {
    marginBottom: 24,
  },
  // 在 styles 对象中添加
  ticketImageContainer: {
    marginVertical: 12,
    alignItems: 'center',
  },
  ticketImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
});
export default TicketScreen;