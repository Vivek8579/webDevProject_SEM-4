import { createSlice } from '@reduxjs/toolkit';
import { login, signup, fetchCurrentUser, forgotPassword, resetPassword, getUsersList } from './authThunk';

// Initial state
// const initialState = {
//   user: null,
//   token: localStorage.getItem('token') || null,
//   isAuthenticated: !!localStorage.getItem('token'),
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null, // ✅ FIX
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  forgotPasswordSuccess: false,
  resetPasswordSuccess: false,
  // Users list for admin
  usersList: [],
  usersListLoading: false,
  usersListError: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      // Clear both token keys for consistency
      localStorage.removeItem('token');
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    resetPasswordFlags: (state) => {
      state.forgotPasswordSuccess = false;
      state.resetPasswordSuccess = false;
      state.error = null;
    },
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // .addCase(login.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.isAuthenticated = true;
      //   state.token = action.payload.token;
      //   state.user = action.payload.user;
      // })
      //=======above code is below====================
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;

        state.user = null; // ❗ important

        localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Signup
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // .addCase(signup.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.isAuthenticated = true;
      //   state.token = action.payload.token;
      //   state.user = action.payload.user;
      // })
      //=====================same as above=============
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;

        // ✅ FIX
        const userData = action.payload.user || action.payload;
        state.user = userData;

        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(userData));
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      // .addCase(fetchCurrentUser.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.user = action.payload;
      //   state.isAuthenticated = true;
      // })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;

        const userData = action.payload.data || action.payload;

        state.user = userData;
        state.isAuthenticated = true;

        localStorage.setItem("user", JSON.stringify(userData)); // 🔥 IMPORTANT
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // If fetching current user fails, clear auth state (invalid/expired token)
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.forgotPasswordSuccess = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.forgotPasswordSuccess = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.forgotPasswordSuccess = false;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.resetPasswordSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.resetPasswordSuccess = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.resetPasswordSuccess = false;
      })
      // Get Users List (Admin)
      .addCase(getUsersList.pending, (state) => {
        state.usersListLoading = true;
        state.usersListError = null;
      })
      .addCase(getUsersList.fulfilled, (state, action) => {
        state.usersListLoading = false;
        state.usersList = action.payload;
      })
      .addCase(getUsersList.rejected, (state, action) => {
        state.usersListLoading = false;
        state.usersListError = action.payload;
      });
  },
});

export const { logout, clearError, resetPasswordFlags, setCredentials } = authSlice.actions;
export default authSlice.reducer;
