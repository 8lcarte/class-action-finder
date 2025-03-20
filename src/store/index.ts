import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import reducers
// We'll add these as we develop features
// import userReducer from './slices/userSlice';
// import lawsuitReducer from './slices/lawsuitSlice';
// import claimReducer from './slices/claimSlice';

export const store = configureStore({
  reducer: {
    // Add reducers here as we develop features
    // user: userReducer,
    // lawsuits: lawsuitReducer,
    // claims: claimReducer,
  },
  // Add middleware here if needed
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [],
        // Ignore these field paths in all actions
        ignoredActionPaths: [],
        // Ignore these paths in the state
        ignoredPaths: [],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
