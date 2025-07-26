import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UploadResult } from '../../types';

interface UploadState {
  isUploading: boolean;
  lastUpload?: UploadResult;
  error?: string;
}

const initialState: UploadState = {
  isUploading: false,
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    startUpload: (state) => {
      state.isUploading = true;
      state.error = undefined;
    },
    uploadSuccess: (state, action: PayloadAction<UploadResult>) => {
      state.isUploading = false;
      state.lastUpload = action.payload;
      state.error = undefined;
    },
    uploadFailure: (state, action: PayloadAction<string>) => {
      state.isUploading = false;
      state.error = action.payload;
    },
    clearUploadError: (state) => {
      state.error = undefined;
    },
    clearLastUpload: (state) => {
      state.lastUpload = undefined;
    },
  },
});

export const {
  startUpload,
  uploadSuccess,
  uploadFailure,
  clearUploadError,
  clearLastUpload,
} = uploadSlice.actions;

export default uploadSlice.reducer;