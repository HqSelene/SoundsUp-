import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConcertInfo } from '../../types';

interface ConcertState {
  info: ConcertInfo | null;
  isConfigured: boolean;
}

const initialState: ConcertState = {
  info: null,
  isConfigured: false,
};

const concertSlice = createSlice({
  name: 'concert',
  initialState,
  reducers: {
    setConcertInfo: (state, action: PayloadAction<ConcertInfo>) => {
      state.info = action.payload;
      state.isConfigured = !!action.payload.artist; // 只有艺术家信息存在才算配置完成
    },
    clearConcertInfo: (state) => {
      state.info = null;
      state.isConfigured = false;
    },
    updateConcertField: (state, action: PayloadAction<{ field: keyof ConcertInfo; value: string }>) => {
      if (state.info) {
        state.info[action.payload.field] = action.payload.value;
        state.isConfigured = !!state.info.artist;
      }
    },
  },
});

export const { setConcertInfo, clearConcertInfo, updateConcertField } = concertSlice.actions;
export default concertSlice.reducer;