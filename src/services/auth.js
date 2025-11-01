import { jwtDecode } from 'jwt-decode';
import api from './api';
import axios from 'axios'
import { navigationRef, resetToAuth } from '../navigation/RootNavigation';
import { store } from '../redux/store';
import { setAuthData, setStudentProfile, clearAuthData, setLoading, setError, clearStudentProfile, clearGlobalCourseId, setGlobalCourseId, setSettings } from '../redux/slices/authSlice';
import { API_BASE_URL } from '@env'
import { storage, Storage } from '../utils/storage'; // Import MMKV storage
import { resetTheme } from '../redux/slices/themeSlice';

// import { API_BASE_URL } from 'react-native-config'

// Configure Axios defaults (headers, auth tokens, etc.)
const AUTH_TOKEN_KEY = '@auth:token';
axios.defaults.baseURL = API_BASE_URL;
export const storeAuthToken = (token) => {
  Storage.setItem(AUTH_TOKEN_KEY, token);
};

export const getAuthToken = () => {
  return Storage.getItem(AUTH_TOKEN_KEY);
};

export const removeAuthToken = () => {
  Storage.removeItem(AUTH_TOKEN_KEY);
};

// Helper: Save tokens securely
const storeTokens = async (token) => {
  try {
    storeAuthToken(token);
  } catch (error) {
    console.error('Failed to store tokens:', error);
    throw new Error('Failed to save authentication data.');
  }
};

// 1. SIGNUP
export const Signup = async (username, email, ph_no, user_type, password) => {
  try {
    const response = await api.post('/api/signup', {
      username,
      email,
      ph_no,
      user_type,
      password,
      is_active: false,
      is_email_verified: false,
      is_phone_verified: false
    });

    const { token } = response.data;

    if (!token) {
      throw new Error('No token received from server.');
    }

    storeAuthToken(token);
    const decodedUser = jwtDecode(token); // Fixed decode usage
    // Dispatch to Redux
    store.dispatch(setAuthData({ token, user: decodedUser }));
    // If user is a student, fetch and store profile
    if (user_type === 'student' && decodedUser.id) {
      const profile = await getStudentProfile(decodedUser.id);
      store.dispatch(setStudentProfile(profile));
    }
    return {
      token,
      user: decodedUser,
      ...response.data // Include other response data if needed
    };
  } catch (error) {
    console.error('Signup error:', error);
    store.dispatch(setError(error.response?.data || error.message));
    throw error.response?.data || error.message || 'Signup failed';
  }
};

// 2. LOGIN
export const login = async (username, password) => {
  console.log("username, password", username, password)
  try {
    store.dispatch(setLoading(true)); 
    console.log("1")
    const response = await axios.post(`${API_BASE_URL}/api/login`, { username, password });
    console.log('response', response)
    if (!response.data.token) {
      return response.data; // Return server message if no token
    }
    const { token } = response.data;
    storeAuthToken(token);
    const decodedUser = jwtDecode(token);
    // Dispatch to Redux
    store.dispatch(setAuthData({ token, user: decodedUser }));
    if (decodedUser.user_type === 'student' && decodedUser.student_id) {
      const profile = await getStudentProfile(decodedUser.student_id);
      store.dispatch(setStudentProfile(profile));
      store.dispatch(setGlobalCourseId(null));
    }
    return {
      success: true,
      token,
      user: decodedUser,
      ...response.data
    };
  } catch (error) {
    // store.dispatch(setError("login error", error.response?.data || error.message));
    console.log('Login error:', error.message);
    throw error.response?.data || error.message || 'Login failed';
  } finally {
    store.dispatch(setLoading(false)); // Reset loading state
  }
};

export const addTrainersToChat = async (trainer_id, student_id) => {
  try {
    const response = await api.post('/api/chat/allama', {
      trainer_id,
      student_id
    });
    return response.data
  } catch (error) {
    store.dispatch(setError(error.response?.data || error.message));

    console.error('Login error:', error);
    throw error.response?.data || error.message || 'Login failed';
  } finally {
    store.dispatch(setLoading(false)); // Reset loading state
  }
};

export const MarkAsRead = async (itemId, user) => {
  try {
    const response = await api.post(`${API_BASE_URL}/api/chat/gcjkhby/${itemId}/ywvdajhb`, {
      reader_type: user.user_type,
      reader_id: user.student_id
    })
    return response.data
  } catch (error) {
    throw error.response?.data || error.message || 'Login failed';
  } finally {
    setLoading(false)
  }
};

export const DeleteComment = async (userId, commentId) => {
  try {
    const response = await api.patch(`${API_BASE_URL}/api/submissions/${userId}/${commentId}/archive`)
    return response.data
  } catch (error) {
    throw error.response?.data || error.message || 'Login failed';
  } finally {
    setLoading(false)
  }
};

// 3. TOKEN MANAGEMENT
export const getCurrentUser = async () => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      await logout();
      return null;
    }
    return decoded;
  } catch (error) {
    await logout();
    return null;
  }
};

// 2. CHECK AUTH STATUS (e.g., on app startup)
export const checkAuth = async () => {
  try {
    const token = getAuthToken();
    if (!token) return null;

    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();

    if (isExpired) {
      return await logout();
    }

    // Dispatch to Redux
    store.dispatch(setAuthData({ token, user: decoded }));

    // If user is a student, fetch and store profile
    if (decoded.user_type === 'student' && decoded.id) {
      const profile = await getStudentProfile(decoded.id);
      store.dispatch(setStudentProfile(profile));
    }

    return { token, user: decoded };
  } catch (error) {
    console.error('Auth check error:', error);
    await logout(); // Force logout if token is invalid
    return null;
  }
};

// 5. LOGOUT - Updated with navigation
export const logout = async () => {
  try {
    resetToAuth(); // Navigate to auth screen
    removeAuthToken();
    store.dispatch(clearAuthData()); // Clear Redux state
    store.dispatch(clearStudentProfile()); // Clear student profile
    store.dispatch(clearGlobalCourseId()); // Clear student profile
    store.dispatch(resetTheme());
  } catch (error) {
    store.dispatch(setError(error.message));
    throw error;
  }
};

// In your api.js or mock API handler
export const getClassDetails = (classId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: dummyData.classDetails });
    }, 500);
  });
};

export const getCoursesForClass = (classId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: dummyData.relatedCourses });
    }, 500);
  });
};

export const attendanceService = {
  async getAttendanceRecords(userId) {
    const response = await fetch(`${API_BASE_URL}/api/attendance?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch records');
    return await response.json();
  },

  async checkIn(userId, courseName) {
    const response = await fetch(`${API_BASE_URL}/api/attendance/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, courseName })
    });
    if (!response.ok) throw new Error('Failed to check in');
    return await response.json();
  },
};

//  Student Profile
export const getStudentProfile = async (studentId) => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/student_profile/${studentId}`);
    const profileData = response.data;
    store.dispatch(setStudentProfile(profileData));
    return profileData;
  } catch (error) {
    console.log('Error fetching student profile:', error.response);
    throw error;
  }
};

//  Update profile
export const UpdateProfilePic = async (studentId, image) => {
  try {
    const fileName = image.split('/').pop();
    const ext = fileName.split('.').pop();
    const mimeType = ext === 'png' ? 'image/png' :
      ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
        'image/*';
    const formData = new FormData();
    console.log("image", image)
    formData.append('profile_pic', {
      uri: image,
      name: fileName,
      type: mimeType
    });
    const response = await api.patch(`${API_BASE_URL}/api/student_profile/${studentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching student profile:', error.response);
    throw error;
  }
};

export const getDashboard = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/dashboard`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard profile:', error);
    throw error;
  }
};

export const getCourses = async (id) => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/student_profile/${id}/courses`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Courses:', error);
    throw error;
  }
};

export const getNotifications = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/notifications`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error.response);
    throw error;
  }
};

export const getAssignment = async (id) => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/courses/${id}/assignments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard profile:', error);
    throw error;
  }
};

export const getTopics = async (course_id, user) => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/courses/${course_id}/topic/${user}/status`)
    return response.data;
  } catch (error) {
    console.error('Error fetching getTopics profile:', error);
    throw error;
  }
};

export const getSyllabus = async (course_id, user) => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/courses/${course_id}`)
    return response.data;
  } catch (error) {
    console.error('Error fetching getTopics profile:', error);
    throw error;
  }
};

export const getSingleAssignment = async (id) => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/assignments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard profile:', error);
    throw error;
  }
};

export const getAssessment = async (id) => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/test/course/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard profile:', error);
    throw error;
  }
};

export const getResults = async (testId, studentId) => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/test/${testId}/student/${studentId}/result`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard profile:', error);
    throw error;
  }
};

export const getRecordings = async (id) => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/recordings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard profile:', error);
    throw error;
  }
};

export const getSettings = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/settings`);
    const settings = response.data;
    store.dispatch(setSettings(settings));
    return settings;
  } catch (error) {
    console.log('Error fetching student profile:', error.response);
    throw error;
  }
};

export const getTrainers = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/chat/allama`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard profile:', error);
    throw error;
  }
};

export const fetchMessages = async (userId) => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/chat/rooms/${userId}/euybfvh`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard profile:', error);
    throw error;
  }
};

// 7. Refresh student profile data
export const refreshStudentProfile = async () => {
  try {
    const token = getAuthToken();
    if (!token) return null;
    const decoded = jwtDecode(token);
    if (decoded.user_type === 'student' && decoded.student_id) {
      const profile = await getStudentProfile(decoded.student_id);
      return profile;
    } else {
      return null;
    }

  } catch (error) {
    console.error('Error refreshing student profile:', error);
    throw error;
  }
};
