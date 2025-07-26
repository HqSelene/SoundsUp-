import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, Share, Alert, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { COSMIC_THEME } from '../../constants/theme';
import { RootState } from '../../store';
import { Ticket } from '../../types';
import { SmartImage } from '../../components/SmartImage';
import { ShareImageGenerator, ShareImageGeneratorRef } from '../../components/ShareImageGenerator';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 两列布局，考虑padding和间距

const CollectionScreen: React.FC = () => {
  const { items: tickets } = useSelector((state: RootState) => state.tickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const shareImageRef = useRef<ShareImageGeneratorRef>(null);
  
  // 只显示已完成且有图片的票据
  const completedTickets = tickets.filter(ticket => 
    ticket.status === 'completed' && ticket.image
  );

  const handleTicketPress = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
  };

  const handleShare = async () => {
    if (!selectedTicket) return;
    
    try {
      console.log('点击分享按钮');
      // 生成分享图片
      if (shareImageRef.current) {
        console.log('调用generateShareImage');
        await shareImageRef.current.generateShareImage();
      } else {
        console.error('shareImageRef.current is null');
        Alert.alert('分享失败', 'ShareImageGenerator 未初始化');
      }
    } catch (error) {
      console.error('分享失败:', error);
      Alert.alert('分享失败', '无法生成分享图片');
    }
  };

  const onShareImageGenerated = async (imageUri: string) => {
    try {
      const shareContent = {
        message: `🎵 ${selectedTicket?.concertInfo.artist} - ${selectedTicket?.concertInfo.concertName || 'Concert'}\n\n✨ AI情绪分析结果 by SoundsUp`,
        url: imageUri,
      };
      
      await Share.share(shareContent);
    } catch (error) {
      Alert.alert('分享失败', '无法分享此内容');
    }
  };

  const renderTicketCard = ({ item }: { item: Ticket }) => (
    <TouchableOpacity 
      style={styles.ticketCard}
      onPress={() => handleTicketPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardImageContainer}>
        <SmartImage 
          source={item.image}
          style={styles.cardImage}
          resizeMode="cover"
          placeholderStyle={styles.placeholderImage}
        />
        
        {/* 卡片上的小标签 */}
        <View style={styles.cardBadge}>
          <Ionicons name="musical-notes" size={12} color="white" />
        </View>
      </View>
      
      <View style={styles.cardInfo}>
        <Text style={styles.cardArtist} numberOfLines={1}>
          {item.concertInfo.artist}
        </Text>
        <Text style={styles.cardDate} numberOfLines={1}>
          {item.concertInfo.time ? new Date(item.concertInfo.time).toLocaleDateString() : 'Date TBD'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderDetailModal = () => (
    <Modal
      visible={showDetailModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowDetailModal(false)}
    >
      <View style={styles.modalContainer}>
        {/* 模态框头部 */}
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            onPress={() => setShowDetailModal(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={COSMIC_THEME.colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleShare}
            style={styles.shareButton}
          >
            <Ionicons name="share-outline" size={24} color={COSMIC_THEME.colors.accent} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* 大图显示 */}
          {selectedTicket?.image && (
            <View style={styles.modalImageContainer}>
              <SmartImage
                source={selectedTicket.image} 
                style={styles.modalImage}
                resizeMode="contain"
              />
            </View>
          )}

          {/* 演唱会信息 */}
          <View style={styles.concertInfoSection}>
            <Text style={styles.modalTitle}>{selectedTicket?.concertInfo.artist}</Text>
            
            {selectedTicket?.concertInfo.concertName && (
              <Text style={styles.modalSubtitle}>{selectedTicket.concertInfo.concertName}</Text>
            )}
            
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color={COSMIC_THEME.colors.accent} />
              <Text style={styles.infoText}>
                {selectedTicket?.concertInfo.time || 'Date TBD'}
              </Text>
            </View>
            
            {selectedTicket?.concertInfo.location && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color={COSMIC_THEME.colors.accent} />
                <Text style={styles.infoText}>{selectedTicket.concertInfo.location}</Text>
              </View>
            )}
            
            {selectedTicket?.concertInfo.description && (
              <View style={styles.descriptionSection}>
                <Text style={styles.descriptionTitle}>Description</Text>
                <Text style={styles.descriptionText}>{selectedTicket.concertInfo.description}</Text>
              </View>
            )}
            
            {selectedTicket?.text && (
              <View style={styles.analysisSection}>
                <Text style={styles.analysisTitle}>AI Analysis</Text>
                <Text style={styles.analysisText}>{selectedTicket.text}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Collection</Text>
      <Text style={styles.subtitle}>Your cosmic ticket collection</Text>
      
      {completedTickets.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="albums-outline" size={80} color={COSMIC_THEME.colors.textSecondary} />
          <Text style={styles.emptyText}>No tickets in collection</Text>
          <Text style={styles.emptySubtext}>Create and generate tickets to build your cosmic collection</Text>
        </View>
      ) : (
        <FlatList
          data={completedTickets}
          keyExtractor={(item) => item.id}
          renderItem={renderTicketCard}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {renderDetailModal()}
      
      {/* 分享图片生成器 */}
      {selectedTicket && (
        <ShareImageGenerator 
          ref={shareImageRef}
          ticket={selectedTicket}
          onShare={onShareImageGenerated}
        />
      )}
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
  row: {
    justifyContent: 'space-between',
  },
  ticketCard: {
    width: cardWidth,
    backgroundColor: 'rgba(30, 30, 58, 0.8)',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(123, 104, 238, 0.3)',
    shadowColor: COSMIC_THEME.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardImageContainer: {
    position: 'relative',
    height: cardWidth * 0.75,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(123, 104, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(123, 104, 238, 0.8)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    padding: 12,
  },
  cardArtist: {
    color: COSMIC_THEME.colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDate: {
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
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COSMIC_THEME.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: COSMIC_THEME.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60, // 为状态栏留空间
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(123, 104, 238, 0.2)',
  },
  closeButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
  },
  modalImageContainer: {
    height: 300,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(30, 30, 58, 0.5)',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  concertInfoSection: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COSMIC_THEME.colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 18,
    color: COSMIC_THEME.colors.textSecondary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    color: COSMIC_THEME.colors.text,
    fontSize: 16,
    marginLeft: 8,
  },
  descriptionSection: {
    marginTop: 20,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COSMIC_THEME.colors.accent,
    marginBottom: 8,
  },
  descriptionText: {
    color: COSMIC_THEME.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  analysisSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(123, 104, 238, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(123, 104, 238, 0.3)',
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COSMIC_THEME.colors.accent,
    marginBottom: 8,
  },
  analysisText: {
    color: COSMIC_THEME.colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

export default CollectionScreen;