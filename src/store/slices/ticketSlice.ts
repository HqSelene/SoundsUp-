import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Ticket, PendingTicket } from '../../types';
import { IMAGE_ASSETS } from '../../constants/imageAssets';

// 示例数据
const sampleTickets: Ticket[] = [
  {
    id: 'jhope_1',
    recordingId: 'recording_jhope_1',
    analysisId: 'analysis_jhope_1',
    title: 'J-Hope in the Box',
    description: 'Lollapalooza headline performance',
    emotions: {
      Energy: 45,
      Excitement: 30,
      Joy: 15,
      Confidence: 10
    },
    dominantEmotion: 'Energy',
    waveformData: [0.9, 0.8, 0.95, 0.85, 0.7, 0.9, 0.8, 0.75],
    cosmicTheme: {
      primaryColor: '#FFD700',
      secondaryColor: '#FF4500',
      gradientColors: ['#FFD700', '#FF4500', '#FF6347']
    },
    timestamp: Date.now() - 86400000,
    isFavorite: true,
    concertInfo: {
      artist: 'J-Hope (BTS)',
      concertName: 'Lollapalooza 2022',
      time: '2022-07-31 21:30',
      location: 'Grant Park, Chicago',
      description: 'Historic solo performance by BTS rapper'
    },
    image: 'jhope_pic',
    text: 'An explosive performance full of dynamic energy and infectious positivity.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'completed',
    audioUri: 'jhope'
  },
  {
    id: 'adele_1',
    recordingId: 'recording_adele_1',
    analysisId: 'analysis_adele_1',
    title: 'Weekends with Adele',
    description: 'Emotional night at Caesars Palace',
    emotions: {
      Nostalgia: 40,
      Sadness: 35,
      Warmth: 15,
      Joy: 10
    },
    dominantEmotion: 'Nostalgia',
    waveformData: [0.3, 0.5, 0.4, 0.6, 0.2, 0.7, 0.3, 0.5],
    cosmicTheme: {
      primaryColor: '#4ECDC4',
      secondaryColor: '#45B7D1',
      gradientColors: ['#4ECDC4', '#45B7D1', '#96CEB4']
    },
    timestamp: Date.now() - 172800000,
    isFavorite: true,
    concertInfo: {
      artist: 'Adele',
      concertName: 'Weekends with Adele',
      time: '2023-11-18 20:00',
      location: 'The Colosseum at Caesars Palace',
      description: 'Intimate night of soulful ballads'
    },
    image: 'adele_pic',
    text: 'Powerful vocals that evoke deep nostalgia and heartfelt emotions.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    status: 'completed',
    audioUri: '' // 暂时设为 null，因为文件不存在
  },
  {
    id: 'mayday_1',
    recordingId: 'recording_mayday_1',
    analysisId: 'analysis_mayday_1',
    title: 'Mayday Life Tour',
    description: 'Energetic stadium performance',
    emotions: {
      Energy: 50,
      Excitement: 25,
      Community: 15,
      Nostalgia: 10
    },
    dominantEmotion: 'Energy',
    waveformData: [0.8, 0.7, 0.9, 0.6, 0.8, 0.5, 0.7, 0.9],
    cosmicTheme: {
      primaryColor: '#FF6B6B',
      secondaryColor: '#4ECDC4',
      gradientColors: ['#FF6B6B', '#4ECDC4', '#45B7D1']
    },
    timestamp: Date.now() - 259200000,
    isFavorite: false,
    concertInfo: {
      artist: 'Mayday',
      concertName: 'Life Tour',
      time: '2023-08-12 19:30',
      location: 'National Stadium, Taipei',
      description: '25th anniversary celebration concert'
    },
    image: 'mayday_pic',
    text: 'High-octane performance that had the entire stadium singing along.',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    status: 'completed',
    audioUri: '' // 暂时设为 null，因为文件不存在
  },
  {
    id: 'jyh_1',
    recordingId: 'recording_jyh_1',
    analysisId: 'analysis_jyh_1',
    title: 'Jung Yong Hwa Solo',
    description: 'Acoustic evening with CNBLUE leader',
    emotions: {
      Warmth: 40,
      Joy: 30,
      Intimacy: 20,
      Nostalgia: 10
    },
    dominantEmotion: 'Warmth',
    waveformData: [0.4, 0.5, 0.3, 0.6, 0.4, 0.7, 0.5, 0.4],
    cosmicTheme: {
      primaryColor: '#9B59B6',
      secondaryColor: '#3498DB',
      gradientColors: ['#9B59B6', '#3498DB', '#1ABC9C']
    },
    timestamp: Date.now() - 345600000,
    isFavorite: true,
    concertInfo: {
      artist: 'Jung Yong Hwa',
      concertName: 'Summer Acoustics',
      time: '2023-06-25 19:00',
      location: 'Blue Square, Seoul',
      description: 'Unplugged versions of CNBLUE hits'
    },
    image: 'ronghe_pic',
    text: 'Intimate performance filled with warm vocals and genuine audience connection.',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    status: 'completed',
    audioUri: '' // 暂时设为 null，因为文件不存在
  }
];

interface TicketState {
  items: Ticket[];
  pendingItems: PendingTicket[];
  loading: boolean;
  error: string | null;
}

const initialState: TicketState = {
  items: sampleTickets, // 使用示例数据
  pendingItems: [],
  loading: false,
  error: null,
};

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    addTicket: (state, action: PayloadAction<Ticket>) => {
      state.items.unshift(action.payload);
    },
    addPendingTicket: (state, action: PayloadAction<PendingTicket>) => {
      state.pendingItems.unshift(action.payload);
    },
    updatePendingTicket: (state, action: PayloadAction<{ id: string; updates: Partial<PendingTicket> }>) => {
      const index = state.pendingItems.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.pendingItems[index] = { ...state.pendingItems[index], ...action.payload.updates };
      }
    },
    completePendingTicket: (state, action: PayloadAction<{ pendingId: string; ticket: Ticket }>) => {
      // 移除待生成项目
      state.pendingItems = state.pendingItems.filter(item => item.id !== action.payload.pendingId);
      // 添加到完成的票据
      state.items.unshift(action.payload.ticket);
    },
    removePendingTicket: (state, action: PayloadAction<string>) => {
      state.pendingItems = state.pendingItems.filter(item => item.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addTicket,
  addPendingTicket,
  updatePendingTicket,
  completePendingTicket,
  removePendingTicket,
  setLoading,
  setError,
} = ticketSlice.actions;

export default ticketSlice.reducer;