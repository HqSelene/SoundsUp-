import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  preferences: {
    notifications: boolean;
    backgroundRecording: boolean;
    audioQuality: 'low' | 'medium' | 'high';
  };
}

const initialState: UserState = {
  preferences: {
    notifications: true,
    backgroundRecording: true,
    audioQuality: 'high',
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updatePreferences: (state, action: PayloadAction<Partial<UserState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setNotifications: (state, action: PayloadAction<boolean>) => {
      state.preferences.notifications = action.payload;
    },
    setBackgroundRecording: (state, action: PayloadAction<boolean>) => {
      state.preferences.backgroundRecording = action.payload;
    },
    setAudioQuality: (state, action: PayloadAction<'low' | 'medium' | 'high'>) => {
      state.preferences.audioQuality = action.payload;
    },
  },
});

export const {
  updatePreferences,
  setNotifications,
  setBackgroundRecording,
  setAudioQuality,
} = userSlice.actions;

export default userSlice.reducer;