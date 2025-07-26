import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AudioRecording } from '../../types';

interface RecordingState {
  isRecording: boolean;
  currentRecording: AudioRecording | null;
  recordings: AudioRecording[];
  status: 'offline' | 'recording' | 'uploading' | 'completed';
}

const initialState: RecordingState = {
  isRecording: false,
  currentRecording: null,
  recordings: [],
  status: 'offline',
};

const recordingSlice = createSlice({
  name: 'recording',
  initialState,
  reducers: {
    startRecording: (state, action: PayloadAction<AudioRecording>) => {
      state.isRecording = true;
      state.currentRecording = action.payload;
      state.status = 'recording';
    },
    stopRecording: (state, action: PayloadAction<{ filePath: string }>) => {
      state.isRecording = false;
      if (state.currentRecording) {
        state.currentRecording.status = 'completed';
        state.currentRecording.filePath = action.payload.filePath;
        state.recordings.push(state.currentRecording);
        state.currentRecording = null;
      }
      state.status = 'completed';
    },
    updateRecordingStatus: (state, action: PayloadAction<{ id: string; status: AudioRecording['status'] }>) => {
      const recording = state.recordings.find(r => r.id === action.payload.id);
      if (recording) {
        recording.status = action.payload.status;
      }
      if (action.payload.status === 'uploading') {
        state.status = 'uploading';
      }
    },
    setStatus: (state, action: PayloadAction<RecordingState['status']>) => {
      state.status = action.payload;
    },
    addRecording: (state, action: PayloadAction<AudioRecording>) => {
      state.recordings.push(action.payload);
    },
    removeRecording: (state, action: PayloadAction<string>) => {
      state.recordings = state.recordings.filter(r => r.id !== action.payload);
    },
    clearRecordings: (state) => {
      state.recordings = [];
      state.currentRecording = null;
      state.isRecording = false;
      state.status = 'offline';
    },
  },
});

export const {
  startRecording,
  stopRecording,
  updateRecordingStatus,
  setStatus,
  addRecording,
  removeRecording,
  clearRecordings,
} = recordingSlice.actions;

export default recordingSlice.reducer;