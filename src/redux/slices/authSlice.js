import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  user: null,
  isLoading: false,
  error: null,
  studentProfile: null,
  globalCourseId: null,
  settings: {
    data: {
      attendance_options: '' // Default empty value
    }
  }
};
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;
    },
    setSettings: (state, action) => {
      state.settings = action.payload;
    },
    clearSettings: (state) => {
      state.settings = null;
    },
    setStudentProfile: (state, action) => {
      state.studentProfile = action.payload;
    },
    setGlobalCourseId: (state, action) => {
      state.globalCourseId = action.payload;
    },
    clearStudentProfile: (state) => {
      state.studentProfile = null;
    },
    clearAuthData: (state) => {
      state.token = null;
      state.user = null;
      state.globalCourseId = null;
      state.studentProfile = null; // Also clear student profile on logout
    },
    clearGlobalCourseId: (state, action) => {
      state.globalCourseId = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setAuthData,
  setStudentProfile,
  setGlobalCourseId,
  clearStudentProfile,
  clearAuthData,
  clearGlobalCourseId,
  setLoading,
  setError,
  setSettings,
  clearSettings,
} = authSlice.actions;

export default authSlice.reducer;