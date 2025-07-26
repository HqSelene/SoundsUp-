import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import recordingReducer from './slices/recordingSlice';
import ticketReducer from './slices/ticketSlice';
import userReducer from './slices/userSlice';
import concertReducer from './slices/concertSlice';
import uploadReducer from './slices/uploadSlice';

export const store = configureStore({
  reducer: {
    recording: recordingReducer,
    tickets: ticketReducer,
    user: userReducer,
    concert: concertReducer,
    upload: uploadReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// 4. 更新Store配置