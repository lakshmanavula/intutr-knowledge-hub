import axios from 'axios';
import type { 
  CourseCategory, 
  CreateCourseCategoryRequest, 
  UpdateCourseCategoryRequest,
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseTopic,
  CreateCourseTopicRequest,
  UpdateCourseTopicRequest,
  LobData,
  LobFountMaster,
  CreateLobDataRequest,
  UpdateLobDataRequest,
  UserProfile,
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  Coupon,
  CreateCouponRequest,
  UpdateCouponRequest,
  Review,
  CreateReviewRequest,
  UpdateReviewRequest,
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  Subscription,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  PaginatedResponse,
  ApiResponse,
  LoginRequest,
  LoginResponse,
  AuthUser
} from '@/types/api';
import { getConfig } from '@/config/environments';

// Create axios instance with environment-based config (lazy initialization)
const createApiClient = () => {
  const config = getConfig();
  return axios.create({
    baseURL: config.apiBaseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: config.timeout,
  });
};

let apiClient: ReturnType<typeof createApiClient> | null = null;

const getApiClient = () => {
  if (!apiClient) {
    apiClient = createApiClient();
    
    // Add response interceptor to handle new API response format
    apiClient.interceptors.response.use(
      (response) => {
        // Handle the new API response format
        const data = response.data;
        
        // If it's the new format with success field (boolean)
        if (data && typeof data.success === 'boolean') {
          if (!data.success) {
            // API returned success: false, treat as error
            const error = new Error(data.message || 'Operation failed') as any;
            error.response = response;
            throw error;
          }
          // Return the actual data for successful responses
          response.data = data.data;
        }
        // If it's the new format with status field (string)
        else if (data && data.status === 'SUCCESS' && data.data) {
          // Return the actual data for successful responses
          response.data = data.data;
        }
        // If it's the new format with status field but error
        else if (data && data.status && data.status !== 'SUCCESS') {
          const error = new Error(data.message || 'Operation failed') as any;
          error.response = response;
          throw error;
        }
        
        return response;
      },
      (error) => {
        // Handle HTTP error responses
        if (error.response) {
          // Server responded with error status
          const responseData = error.response.data;
          let message = 'An error occurred';
          
          // Check if it's the new API format
          if (responseData && typeof responseData.success === 'boolean') {
            message = responseData.message || message;
          } else {
            // Fallback to old format
            message = responseData?.message || 
                     responseData?.errorMessage || 
                     'Operation failed';
          }
          
          error.message = message;
        } else if (error.request) {
          // Network error
          error.message = 'Network error. Please check your connection.';
        }
        return Promise.reject(error);
      }
    );

    // Request interceptor for adding auth tokens if needed
    apiClient.interceptors.request.use(
      (config) => {
        // Add auth token here if available
        try {
          if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken');
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          }
        } catch (error) {
          console.error('Error accessing localStorage for auth token:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }
  
  return apiClient;
};

// Authentication API
export const authApi = {
  // Login user
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const config = getConfig();
    console.log('🔐 Attempting login to:', `${config.apiBaseUrl}/auth/login`);
    
    const response = await getApiClient().post<any>('/auth/login', credentials);
    
    console.log('✅ Login successful:', response.data);
    
    // Map the actual API response to our expected LoginResponse format
    const mappedResponse: LoginResponse = {
      token: response.data.token,
      expiresIn: response.data.expiresIn,
      user: {
        id: response.data.userId,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        profilePicture: '',
        isActive: true,
        lastLoggedIn: response.data.loginTime || new Date().toISOString(),
        createdBy: 'system',
        createdByName: 'System',
        modifiedBy: 'system',
        modifiedByName: 'System',
        createdDate: response.data.loginTime,
        modifiedDate: response.data.loginTime,
        deleted: false
      }
    };
    
    // Store token and user data in localStorage
    localStorage.setItem('authToken', mappedResponse.token);
    localStorage.setItem('authUser', JSON.stringify(mappedResponse.user));
    
    return mappedResponse;
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await getApiClient().post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
  },

  // Get current user
  getCurrentUser: (): AuthUser | null => {
    try {
      if (typeof window === 'undefined') return null;
      
      const userStr = localStorage.getItem('authUser');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('authUser');
        }
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      return !!localStorage.getItem('authToken');
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return false;
    }
  },

  // Refresh token (if your API supports it)
  refreshToken: async (): Promise<LoginResponse> => {
    const response = await getApiClient().post<LoginResponse>('/auth/refresh');
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('authUser', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }
};

export const courseCategoryApi = {
  // Get all categories
  getAll: async (): Promise<CourseCategory[]> => {
    try {
      console.log('🔗 Making API call to get categories...');
      const response = await getApiClient().get<CourseCategory[]>('/course-categories');
      console.log('📡 Raw API response:', response);
      console.log('📋 Response data:', response.data);
      console.log('🔍 Data type:', typeof response.data, 'Is array:', Array.isArray(response.data));
      return response.data || [];
    } catch (error: any) {
      console.error('❌ API Error:', error);
      if (error.code === 'ECONNABORTED') {
        throw new Error('Network timeout. Please check your connection and try again.');
      }
      throw new Error(error.message || 'Failed to fetch categories');
    }
  },

  // Get paginated categories
  getPaginated: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<CourseCategory>> => {
    try {
      console.log('🔍 Fetching paginated categories:', { page, size });
      
      const apiClient = getApiClient();
      const response = await apiClient.get(`/course-categories/paged?page=${page}&size=${size}`);
      
      console.log('📡 Categories pagination raw response:', response.data);
      
      // The API is returning a direct array, which suggests it's not properly implementing pagination
      // Let's try to get the total count from a separate endpoint or handle this properly
      const rawData = response.data;
      
      if (Array.isArray(rawData)) {
        // If the API returns a direct array, it's not properly paginated
        // In this case, we need to get all data and implement client-side pagination
        // OR the API might be returning only the current page but without metadata
        
        // Let's try to get the total count from all categories
        const allCategoriesResponse = await apiClient.get('/course-categories');
        const allCategories = allCategoriesResponse.data || [];
        const totalElements = allCategories.length;
        const totalPages = Math.ceil(totalElements / size);
        
        console.log('📊 Total categories from all endpoint:', totalElements);
        
        const result = {
          content: rawData,
          totalElements: totalElements,
          totalPages: totalPages,
          size: size,
          number: page,
          first: page === 0,
          last: page >= totalPages - 1,
        };
        
        console.log('✅ Categories pagination result:', result);
        return result;
      } else {
        // If it's an object, handle as before
        let categoryData = [];
        let metadata: any = {};
        
        if (rawData.status === 'SUCCESS' || rawData.success === true) {
          categoryData = rawData.data || [];
          metadata = rawData.metadata || {};
        } else if (rawData.data) {
          categoryData = rawData.data;
          metadata = rawData.metadata || {};
        }
        
        const result = {
          content: categoryData,
          totalElements: metadata.totalElements || categoryData.length,
          totalPages: metadata.totalPages || Math.ceil((metadata.totalElements || categoryData.length) / size),
          size: metadata.size || size,
          number: metadata.page || page,
          first: metadata.first !== undefined ? metadata.first : page === 0,
          last: metadata.last !== undefined ? metadata.last : false,
        };
        
        console.log('✅ Categories pagination result:', result);
        return result;
      }
    } catch (error: any) {
      console.error('❌ Categories pagination API Error:', error);
      throw new Error(error.message || 'Failed to fetch paginated categories');
    }
  },

  // Get category by ID
  getById: async (id: string): Promise<CourseCategory> => {
    const response = await getApiClient().get<CourseCategory>(`/course-categories/${id}`);
    return response.data;
  },

  // Create new category
  create: async (category: CreateCourseCategoryRequest): Promise<CourseCategory> => {
    const response = await getApiClient().post<CourseCategory>('/course-categories', category);
    return response.data;
  },

  // Update existing category
  update: async (id: string, category: UpdateCourseCategoryRequest): Promise<CourseCategory> => {
    const response = await getApiClient().put<CourseCategory>(`/course-categories/${id}`, category);
    return response.data;
  },

  // Delete category
  delete: async (id: string): Promise<void> => {
    await getApiClient().delete(`/course-categories/${id}`);
  },

  // Search categories
  search: async (criteria: { 
    categoryName?: string; 
    isActive?: boolean; 
    page?: number; 
    size?: number; 
  }): Promise<PaginatedResponse<CourseCategory>> => {
    const response = await getApiClient().post<PaginatedResponse<CourseCategory>>(
      '/course-categories/search', 
      criteria
    );
    return response.data;
  },

  // Bulk delete categories
  bulkDelete: async (ids: string[]): Promise<void> => {
    await getApiClient().post('/course-categories/bulk-delete', { ids });
  },

  // Toggle active status
  toggleActive: async (id: string): Promise<CourseCategory> => {
    const response = await getApiClient().patch<CourseCategory>(`/course-categories/${id}/toggle-active`);
    return response.data;
  },
};

export const courseApi = {
  // Get all courses
  getAll: async (): Promise<Course[]> => {
    try {
      const response = await getApiClient().get('/course/paged', {
        transformResponse: [(data) => data],
      });
      const rawData = JSON.parse(response.data);
      return rawData.data?.content || [];
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Network timeout. Please check your connection and try again.');
      }
      throw new Error(error.message || 'Failed to fetch courses');
    }
  },

  // Get paginated courses
  getPaginated: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<Course>> => {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get(`/course/paged?page=${page}&size=${size}`, {
        transformResponse: [(data) => data],
      });
      
      const rawData = JSON.parse(response.data);
      const courseData = rawData.data || {};
      
      return {
        content: courseData.content || [],
        totalElements: courseData.totalElements || 0,
        totalPages: courseData.totalPages || 0,
        size: courseData.size || size,
        number: courseData.number || page,
        first: courseData.first !== undefined ? courseData.first : page === 0,
        last: courseData.last !== undefined ? courseData.last : false,
      };
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Network timeout. Please check your connection and try again.');
      }
      throw new Error(error.message || 'Failed to fetch courses');
    }
  },

  // Get course by ID
  getById: async (id: string): Promise<Course> => {
    const response = await getApiClient().get<Course>(`/course/paged/${id}`);
    return response.data;
  },

  // Create new course
  create: async (course: CreateCourseRequest): Promise<Course> => {
    const response = await getApiClient().post<Course>('/api/v1/course', course);
    return response.data;
  },

  // Update existing course
  update: async (id: string, course: UpdateCourseRequest): Promise<Course> => {
    const response = await getApiClient().put<Course>(`/course/paged/${id}`, course);
    return response.data;
  },

  // Delete course
  delete: async (id: string): Promise<void> => {
    await getApiClient().delete(`/course/paged/${id}`);
  },

  // Search courses
  search: async (criteria: { 
    name?: string;
    categoryId?: string;
    status?: string;
    minFees?: number;
    maxFees?: number;
    minRating?: number;
    maxRating?: number;
    tags?: string;
    page?: number; 
    size?: number; 
  }): Promise<PaginatedResponse<Course>> => {
    const response = await getApiClient().post<PaginatedResponse<Course>>(
      '/course/paged/search', 
      criteria
    );
    return response.data;
  },

  // Bulk delete courses
  bulkDelete: async (ids: string[]): Promise<void> => {
    await getApiClient().post('/course/paged/bulk-delete', { ids });
  },

  // Update course status
  updateStatus: async (id: string, status: Course['status']): Promise<Course> => {
    const response = await getApiClient().put<Course>(`/course/paged/${id}/status/${status}`);
    return response.data;
  },

  // Get courses by category
  getByCategory: async (categoryId: string): Promise<Course[]> => {
    const response = await getApiClient().get<Course[]>(`/course/paged/category/${categoryId}`);
    return response.data;
  },

  // Upload thumbnail for course
  uploadThumbnail: async (courseId: string, file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await getApiClient().post<{ url: string }>(
      `/api/v1/course/${courseId}/upload-thumbnail`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Upload kmap excel for course
  uploadKmapExcel: async (courseId: string, file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await getApiClient().post<{ url: string }>(
      `/api/v1/course/${courseId}/upload-kmap-excel`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Download KMap data as Excel
  downloadKmapExcel: async (courseId: string): Promise<Blob> => {
    const response = await getApiClient().get(
      `/lob-fount-kmap-course-topics/download-excel/${courseId}`,
      {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      }
    );
    return response.data;
  },

  // Get all KMap topics for a course
  getKmapTopics: async (courseId: string): Promise<any[]> => {
    const response = await getApiClient().get(`/lob-fount-kmap-course-topics/${courseId}`);
    return response.data;
  },

  // Get track names and numbers for a course
  getTrackNames: async (courseId: string): Promise<any[]> => {
    const response = await getApiClient().get(`/lob-fount-kmap-course-topics/track-name-and-number/${courseId}`);
    return response.data;
  },

  // Get topics by course and track
  getTopicsByTrack: async (courseId: string, trackNum: string): Promise<any[]> => {
    const response = await getApiClient().get(`/lob-fount-kmap-course-topics/by-course/${courseId}/${trackNum}`);
    return response.data;
  },
};

export const courseTopicApi = {
  // Get all topics
  getAll: async (): Promise<CourseTopic[]> => {
    const response = await getApiClient().get<CourseTopic[]>('/course-topics');
    return response.data;
  },

  // Get paginated topics
  getPaginated: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<CourseTopic>> => {
    const response = await getApiClient().get<PaginatedResponse<CourseTopic>>(
      `/course-topics/paginated?page=${page}&size=${size}`
    );
    return response.data;
  },

  // Get topic by ID
  getById: async (id: string): Promise<CourseTopic> => {
    const response = await getApiClient().get<CourseTopic>(`/course-topics/${id}`);
    return response.data;
  },

  // Get topics by course
  getByCourse: async (courseId: string): Promise<CourseTopic[]> => {
    const response = await getApiClient().get<CourseTopic[]>(`/course-topics/course/${courseId}`);
    return response.data;
  },

  // Create new topic
  create: async (topic: CreateCourseTopicRequest): Promise<CourseTopic> => {
    const response = await getApiClient().post<CourseTopic>('/course-topics', topic);
    return response.data;
  },

  // Update existing topic
  update: async (id: string, topic: UpdateCourseTopicRequest): Promise<CourseTopic> => {
    const response = await getApiClient().put<CourseTopic>(`/course-topics/${id}`, topic);
    return response.data;
  },

  // Delete topic
  delete: async (id: string): Promise<void> => {
    await getApiClient().delete(`/course-topics/${id}`);
  },

  // Search topics
  search: async (criteria: { 
    topicName?: string;
    courseId?: string;
    isActive?: boolean;
    page?: number; 
    size?: number; 
  }): Promise<PaginatedResponse<CourseTopic>> => {
    const response = await getApiClient().post<PaginatedResponse<CourseTopic>>(
      '/course-topics/search', 
      criteria
    );
    return response.data;
  },

  // Bulk delete topics
  bulkDelete: async (ids: string[]): Promise<void> => {
    await getApiClient().post('/course-topics/bulk-delete', { ids });
  },

  // Toggle active status
  toggleActive: async (id: string): Promise<CourseTopic> => {
    const response = await getApiClient().patch<CourseTopic>(`/course-topics/${id}/toggle-active`);
    return response.data;
  },

  // Reorder topics
  reorder: async (courseId: string, topicIds: string[]): Promise<void> => {
    await getApiClient().patch(`/course-topics/course/${courseId}/reorder`, { topicIds });
  },
};

export const lobDataApi = {
  // Get all lob data
  getAll: async (): Promise<LobData[]> => {
    const response = await getApiClient().get<LobData[]>('/lob-data');
    return response.data;
  },

  // Get paginated lob data
  getPaginated: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<LobData>> => {
    const response = await getApiClient().get<PaginatedResponse<LobData>>(
      `/lob-data/paginated?page=${page}&size=${size}`
    );
    return response.data;
  },

  // Get lob data by ID
  getById: async (id: string): Promise<LobData> => {
    const response = await getApiClient().get<LobData>(`/lob-data/${id}`);
    return response.data;
  },

  // Get lob data by topic
  getByTopic: async (topicId: string): Promise<LobData[]> => {
    const response = await getApiClient().get<LobData[]>(`/lob-data/topic/${topicId}`);
    return response.data;
  },

  // Create new lob data
  create: async (lobData: CreateLobDataRequest): Promise<LobData> => {
    const response = await getApiClient().post<LobData>('/lob-data', lobData);
    return response.data;
  },

  // Update existing lob data
  update: async (id: string, lobData: UpdateLobDataRequest): Promise<LobData> => {
    const response = await getApiClient().put<LobData>(`/lob-data/${id}`, lobData);
    return response.data;
  },

  // Delete lob data
  delete: async (id: string): Promise<void> => {
    await getApiClient().delete(`/lob-data/${id}`);
  },

  // Search lob data
  search: async (criteria: { 
    lobName?: string;
    topicId?: string;
    lobType?: string;
    isActive?: boolean;
    page?: number; 
    size?: number; 
  }): Promise<PaginatedResponse<LobData>> => {
    const response = await getApiClient().post<PaginatedResponse<LobData>>(
      '/lob-data/search', 
      criteria
    );
    return response.data;
  },

  // Bulk delete lob data
  bulkDelete: async (ids: string[]): Promise<void> => {
    await getApiClient().post('/lob-data/bulk-delete', { ids });
  },

  // Toggle active status
  toggleActive: async (id: string): Promise<LobData> => {
    const response = await getApiClient().patch<LobData>(`/lob-data/${id}/toggle-active`);
    return response.data;
  },

  // Reorder lob data within topic
  reorder: async (topicId: string, lobDataIds: string[]): Promise<void> => {
    await getApiClient().patch(`/lob-data/topic/${topicId}/reorder`, { lobDataIds });
  },
};

export const userProfileApi = {
  // Get all users
  getAll: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<UserProfile>> => {
    const response = await getApiClient().get<PaginatedResponse<UserProfile>>(
      `/user-profiles/paged?page=${page}&size=${size}`
    );
    return response.data;
  },

  // Get paginated users
  getPaginated: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<UserProfile>> => {
    // Bypass the interceptor to get raw response with metadata
    const apiClient = getApiClient();
    const response = await apiClient.get(`/user-profiles/paged?page=${page}&size=${size}`, {
      transformResponse: [(data) => data], // Keep raw response
    });
    
    // Parse the raw response
    const rawData = JSON.parse(response.data);
    console.log('🔍 Raw user API response:', rawData);
    
    // Extract data and metadata
    const usersData = rawData.data || [];
    const metadata = rawData.metadata || {};
    
    console.log('👥 Users data:', usersData);
    console.log('🏢 Sample user location fields:', usersData[0] ? {
      city: usersData[0].city,
      state: usersData[0].state, 
      country: usersData[0].country,
      location: usersData[0].location,
      address: usersData[0].address
    } : 'No users');
    console.log('📊 Metadata:', metadata);
    
    // Map API response to UserProfile structure
    const mappedUsers = usersData.map((user: any): UserProfile => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || '',
      address: user.address || '',
      city: user.location || '', // Using location field
      state: '', // Not available as separate field
      country: '', // Not available as separate field
      postalCode: user.postalCode || '',
      profilePicture: user.profilePicture || '',
      isActive: user.isActive,
      lastLoggedIn: user.lastLoggedIn || user.modifiedDate || '',
      createdBy: user.createdBy,
      createdByName: user.createdByName,
      modifiedBy: user.modifiedBy,
      modifiedByName: user.modifiedByName,
      createdDate: user.createdDate,
      modifiedDate: user.modifiedDate,
      deleted: user.deleted
    }));

    console.log('✅ Mapped users:', mappedUsers);

    return {
      content: mappedUsers,
      totalElements: metadata.totalElements || mappedUsers.length,
      totalPages: metadata.totalPages || Math.ceil((metadata.totalElements || mappedUsers.length) / size),
      size: metadata.size || size,
      number: metadata.page || page,
      first: metadata.first !== undefined ? metadata.first : page === 0,
      last: metadata.last !== undefined ? metadata.last : false,
    };
  },

  // Get user by ID
  getById: async (id: string): Promise<UserProfile> => {
    const response = await getApiClient().get<UserProfile>(`/user-profiles/${id}`);
    return response.data;
  },

  // Create new user
  create: async (user: CreateUserProfileRequest): Promise<UserProfile> => {
    const response = await getApiClient().post<UserProfile>('/user-profiles', user);
    return response.data;
  },

  // Update existing user
  update: async (id: string, user: UpdateUserProfileRequest): Promise<UserProfile> => {
    const response = await getApiClient().put<UserProfile>(`/user-profiles/${id}`, user);
    return response.data;
  },

  // Delete user
  delete: async (id: string): Promise<void> => {
    await getApiClient().delete(`/user-profiles/${id}`);
  },

  // Search users
  search: async (criteria: { 
    firstName?: string;
    lastName?: string;
    email?: string;
    isActive?: boolean;
    city?: string;
    state?: string;
    country?: string;
    page?: number; 
    size?: number; 
  }): Promise<PaginatedResponse<UserProfile>> => {
    const response = await getApiClient().post<PaginatedResponse<UserProfile>>(
      '/user-profiles/search', 
      criteria
    );
    return response.data;
  },

  // Bulk delete users
  bulkDelete: async (ids: string[]): Promise<void> => {
    await getApiClient().post('/user-profiles/bulk-delete', { ids });
  },

  // Toggle active status
  toggleActive: async (id: string): Promise<UserProfile> => {
    const response = await getApiClient().patch<UserProfile>(`/user-profiles/${id}/toggle-active`);
    return response.data;
  },
};

export const couponApi = {
  // Get all coupons
  getAll: async (): Promise<Coupon[]> => {
    const response = await getApiClient().get<Coupon[]>('/coupons');
    return response.data;
  },

  // Get paginated coupons
  getPaginated: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<Coupon>> => {
    try {
      console.log(`🔍 Making API call to: /coupons/paged?page=${page}&size=${size}`);
      
      // Bypass the interceptor to get raw response with metadata
      const apiClient = getApiClient();
      const response = await apiClient.get(`/coupons/paged?page=${page}&size=${size}`, {
        transformResponse: [(data) => data], // Keep raw response
      });
      
      // Parse the raw response
      const rawData = JSON.parse(response.data);
      console.log("🔍 Raw coupon API response:", rawData);
      
      // Extract data and metadata
      const couponsArray = rawData.data || [];
      const metadata = rawData.metadata || {};
      
      console.log("📊 Coupons from API:", couponsArray);
      console.log("📊 Metadata from API:", metadata);
      
      // Map API response fields to Coupon interface  
      const mappedContent = couponsArray.map((coupon: any): Coupon => ({
        id: coupon.id,
        code: coupon.code,
        description: coupon.description || '',
        discountType: coupon.discountType === 'Percentage' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
        discountValue: coupon.discountValue,
        minimumAmount: coupon.minPurchaseAmount,
        maximumDiscount: coupon.maxDiscountAmount,
        usageLimit: coupon.usageLimitPerCoupon,
        usedCount: coupon.currentUsageCount,
        validFrom: coupon.startDate,
        validTo: coupon.endDate,
        isActive: coupon.isActive,
        applicableToAllCourses: true,
        applicableCourseIds: [],
        createdBy: coupon.createdBy,
        createdByName: coupon.createdByName,
        modifiedBy: coupon.modifiedBy,
        modifiedByName: coupon.modifiedByName,
        createdDate: coupon.createdDate,
        modifiedDate: coupon.modifiedDate,
        deleted: coupon.deleted
      }));

      console.log("✅ Mapped coupons:", mappedContent);

      return {
        content: mappedContent,
        totalElements: metadata.totalElements,
        totalPages: metadata.totalPages,
        size: metadata.size,
        number: metadata.page,
        first: metadata.first,
        last: metadata.last
      };
    } catch (error: any) {
      console.error("❌ Coupon API Error:", error);
      throw new Error(error.message || 'Failed to fetch coupons');
    }
  },

  // Get coupon by ID
  getById: async (id: string): Promise<Coupon> => {
    const response = await getApiClient().get<Coupon>(`/coupons/${id}`);
    return response.data;
  },

  // Create new coupon
  create: async (coupon: CreateCouponRequest): Promise<Coupon> => {
    const response = await getApiClient().post<Coupon>('/coupons', coupon);
    return response.data;
  },

  // Update existing coupon
  update: async (id: string, coupon: UpdateCouponRequest): Promise<Coupon> => {
    const response = await getApiClient().put<Coupon>(`/coupons/${id}`, coupon);
    return response.data;
  },

  // Delete coupon
  delete: async (id: string): Promise<void> => {
    await getApiClient().delete(`/coupons/${id}`);
  },

  // Search coupons
  search: async (criteria: { 
    code?: string;
    discountType?: string;
    isActive?: boolean;
    validFrom?: string;
    validTo?: string;
    page?: number; 
    size?: number; 
  }): Promise<PaginatedResponse<Coupon>> => {
    const response = await getApiClient().post<PaginatedResponse<Coupon>>(
      '/coupons/search', 
      criteria
    );
    return response.data;
  },

  // Bulk delete coupons
  bulkDelete: async (ids: string[]): Promise<void> => {
    await getApiClient().post('/coupons/bulk-delete', { ids });
  },

  // Toggle active status
  toggleActive: async (id: string): Promise<Coupon> => {
    const response = await getApiClient().patch<Coupon>(`/coupons/${id}/toggle-active`);
    return response.data;
  },

  // Check coupon validity
  validate: async (code: string, courseId?: string): Promise<{ valid: boolean; coupon?: Coupon; message?: string }> => {
    const response = await getApiClient().post<{ valid: boolean; coupon?: Coupon; message?: string }>('/coupons/validate', { 
      code, 
      courseId 
    });
    return response.data;
  },
};

export const reviewApi = {
  // Get all reviews
  getAll: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<Review>> => {
    const response = await getApiClient().get<PaginatedResponse<Review>>(
      `/reviews/paginated?page=${page}&size=${size}`
    );
    return response.data;
  },

  // Get review by ID
  getById: async (id: string): Promise<Review> => {
    const response = await getApiClient().get<Review>(`/reviews/${id}`);
    return response.data;
  },

  // Get reviews by course
  getByCourse: async (courseId: string, page: number = 0, size: number = 10): Promise<PaginatedResponse<Review>> => {
    const response = await getApiClient().get<PaginatedResponse<Review>>(
      `/reviews/course/${courseId}?page=${page}&size=${size}`
    );
    return response.data;
  },

  // Create new review
  create: async (review: CreateReviewRequest): Promise<Review> => {
    const response = await getApiClient().post<Review>('/reviews', review);
    return response.data;
  },

  // Update existing review
  update: async (id: string, review: UpdateReviewRequest): Promise<Review> => {
    const response = await getApiClient().put<Review>(`/reviews/${id}`, review);
    return response.data;
  },

  // Delete review
  delete: async (id: string): Promise<void> => {
    await getApiClient().delete(`/reviews/${id}`);
  },

  // Search reviews
  search: async (query: string, page: number = 0, size: number = 10): Promise<PaginatedResponse<Review>> => {
    const response = await getApiClient().get<PaginatedResponse<Review>>(
      `/reviews/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`
    );
    return response.data;
  },

  // Bulk delete reviews
  bulkDelete: async (ids: string[]): Promise<void> => {
    await getApiClient().post('/reviews/bulk-delete', { ids });
  },

  // Approve review
  approve: async (id: string): Promise<Review> => {
    const response = await getApiClient().patch<Review>(`/reviews/${id}/approve`);
    return response.data;
  },

  // Toggle public status
  togglePublic: async (id: string): Promise<Review> => {
    const response = await getApiClient().patch<Review>(`/reviews/${id}/toggle-public`);
    return response.data;
  },

  // Mark review as helpful
  markHelpful: async (id: string): Promise<Review> => {
    const response = await getApiClient().post<Review>(`/reviews/${id}/helpful`);
    return response.data;
  },
};

// Course Ratings API
export const courseRatingApi = {
  // Get paginated course ratings
  getPaginated: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<Review>> => {
    // Bypass the interceptor to get raw response with nested metadata
    const apiClient = getApiClient();
    const response = await apiClient.get(`/course-ratings/paged?page=${page}&size=${size}`, {
      transformResponse: [(data) => data], // Keep raw response
    });
    
    // Parse the raw response
    const rawData = JSON.parse(response.data);
    console.log('🔍 Raw course ratings API response:', rawData);
    
    // Extract data from nested structure
    const ratingsData = rawData.data?.content || [];
    const metadata = rawData.data || {};
    
    console.log('⭐ Ratings data:', ratingsData);
    console.log('📊 Ratings metadata:', metadata);
    
    // Map API response to Review structure (assuming rating maps to review)
    const mappedRatings = ratingsData.map((rating: any): Review => ({
      id: rating.id,
      courseId: rating.courseId,
      courseName: rating.courseName || '',
      userId: rating.userId,
      userName: rating.userName || '',
      userEmail: rating.userEmail || '',
      rating: rating.rating,
      title: rating.title || '',
      comment: rating.comment || '',
      isApproved: rating.isApproved ?? true,
      isPublic: rating.isPublic ?? true,
      helpfulCount: rating.helpfulCount || 0,
      createdBy: rating.createdBy,
      createdByName: rating.createdByName,
      modifiedBy: rating.modifiedBy,
      modifiedByName: rating.modifiedByName,
      createdDate: rating.createdDate,
      modifiedDate: rating.modifiedDate,
      deleted: rating.deleted || false
    }));

    console.log('✅ Mapped ratings:', mappedRatings);

    return {
      content: mappedRatings,
      totalElements: metadata.totalElements || mappedRatings.length,
      totalPages: metadata.totalPages || Math.ceil((metadata.totalElements || mappedRatings.length) / size),
      size: metadata.size || size,
      number: metadata.number || page,
      first: metadata.first !== undefined ? metadata.first : page === 0,
      last: metadata.last !== undefined ? metadata.last : false,
    };
  },

  // Get course rating by ID
  getById: async (id: string): Promise<Review> => {
    const response = await getApiClient().get(`/course-ratings/${id}`);
    return response.data;
  },

  // Create new course rating
  create: async (rating: { courseId: string; userId: string; rating: number; comment?: string }): Promise<Review> => {
    const response = await getApiClient().post('/course-ratings', rating);
    return response.data;
  },

  // Update existing course rating
  update: async (id: string, rating: { rating: number; comment?: string }): Promise<Review> => {
    const response = await getApiClient().put(`/course-ratings/${id}`, rating);
    return response.data;
  },

  // Delete course rating
  delete: async (id: string): Promise<void> => {
    await getApiClient().delete(`/course-ratings/${id}`);
  },

  // Get ratings by course
  getByCourse: async (courseId: string, page: number = 0, size: number = 10): Promise<PaginatedResponse<Review>> => {
    const apiClient = getApiClient();
    const response = await apiClient.get(`/course-ratings/course/${courseId}?page=${page}&size=${size}`, {
      transformResponse: [(data) => data],
    });
    
    const rawData = JSON.parse(response.data);
    const ratingsData = rawData.data?.content || [];
    const metadata = rawData.data || {};
    
    const mappedRatings = ratingsData.map((rating: any): Review => ({
      id: rating.id,
      courseId: rating.courseId,
      courseName: rating.courseName || '',
      userId: rating.userId,
      userName: rating.userName || '',
      userEmail: rating.userEmail || '',
      rating: rating.rating,
      title: rating.title || '',
      comment: rating.comment || '',
      isApproved: rating.isApproved ?? true,
      isPublic: rating.isPublic ?? true,
      helpfulCount: rating.helpfulCount || 0,
      createdBy: rating.createdBy,
      createdByName: rating.createdByName,
      modifiedBy: rating.modifiedBy,
      modifiedByName: rating.modifiedByName,
      createdDate: rating.createdDate,
      modifiedDate: rating.modifiedDate,
      deleted: rating.deleted || false
    }));

    return {
      content: mappedRatings,
      totalElements: metadata.totalElements || mappedRatings.length,
      totalPages: metadata.totalPages || Math.ceil((metadata.totalElements || mappedRatings.length) / size),
      size: metadata.size || size,
      number: metadata.number || page,
      first: metadata.first !== undefined ? metadata.first : page === 0,
      last: metadata.last !== undefined ? metadata.last : false,
    };
  },

  // Bulk delete course ratings
  bulkDelete: async (ids: string[]): Promise<void> => {
    await getApiClient().post('/course-ratings/bulk-delete', { ids });
  },
};

// LOB Fount Master API
export const lobFountMasterApi = {
  // Get paginated LOBs
  getPaginated: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<LobFountMaster>> => {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get(`/lob-fount-master/paged?page=${page}&size=${size}`, {
        transformResponse: [(data) => data],
      });
      
      const rawData = JSON.parse(response.data);
      console.log('LOB API raw response:', rawData);
      
      const lobsData = rawData.data || [];
      const metadata = rawData.metadata || {};
      
      return {
        content: lobsData,
        totalElements: metadata.totalElements || lobsData.length,
        totalPages: metadata.totalPages || Math.ceil((metadata.totalElements || lobsData.length) / size),
        size: metadata.size || size,
        number: metadata.page || page,
        first: metadata.first !== undefined ? metadata.first : page === 0,
        last: metadata.last !== undefined ? metadata.last : false,
      };
    } catch (error: any) {
      console.error('Error fetching LOBs:', error);
      throw new Error(error.message || 'Failed to fetch LOBs');
    }
  },

  // Get LOBs by topic ID
  getByTopicId: async (topicId: string, page: number = 0, size: number = 10): Promise<PaginatedResponse<LobFountMaster>> => {
    try {
      const response = await getApiClient().get(`/lob-fount-master/topic/${topicId}?page=${page}&size=${size}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch LOBs for topic');
    }
  },

  // Get LOB by ID
  getById: async (id: string): Promise<LobFountMaster> => {
    try {
      const response = await getApiClient().get(`/lob-fount-master/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch LOB');
    }
  },

  // Get LOBs by course and track
  getByCourseAndTrack: async (courseId: string, trackNumber: string): Promise<LobFountMaster[]> => {
    try {
      const response = await getApiClient().get(`/lob-fount-master/by-course/${courseId}/track/${trackNumber}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch LOBs for course and track');
    }
  },

  // Download LOBs as file
  downloadLobs: async (topicId?: string): Promise<Blob> => {
    try {
      const url = topicId ? `/lob-fount-master/download?topicId=${topicId}` : '/lob-fount-master/download';
      const response = await getApiClient().get(url, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to download LOBs');
    }
  },

  // Download LOBs for specific course as Excel
  downloadCourseExcel: async (courseId: string): Promise<Blob> => {
    try {
      const response = await getApiClient().get(`/lob-fount-master/download-excel/${courseId}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to download course LOB data');
    }
  },
};

// Product API
export const productApi = {
  search: async (searchParams: any = {}, page = 0, size = 10): Promise<PaginatedResponse<Product>> => {
    try {
      console.log('🔍 Fetching products with params:', { page, size, searchParams });
      
      // Bypass the interceptor to get raw response with metadata
      const apiClient = getApiClient();
      const response = await apiClient.get('/products/paged', {
        params: {
          page,
          size,
          ...searchParams,
        },
        transformResponse: [(data) => data], // Keep raw response
      });
      
      // Parse the raw response
      const rawData = JSON.parse(response.data);
      console.log('📡 Products API raw response:', rawData);
      
      // Extract data and metadata
      const productData = rawData.data || [];
      const metadata = rawData.metadata || {};
      
      const result = {
        content: productData,
        totalElements: metadata.totalElements || productData.length,
        totalPages: metadata.totalPages || Math.ceil((metadata.totalElements || productData.length) / size),
        first: metadata.first !== undefined ? metadata.first : true,
        last: metadata.last !== undefined ? metadata.last : true,
        size: metadata.size || size,
        number: metadata.page !== undefined ? metadata.page : page,
      };
      
      console.log('✅ Transformed products result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true,
        size: size,
        number: page,
      };
    }
  },

  getById: async (id: string): Promise<Product> => {
    const response = await getApiClient().get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  create: async (data: CreateProductRequest): Promise<Product> => {
    const response = await getApiClient().post<ApiResponse<Product>>('/products', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateProductRequest): Promise<Product> => {
    const response = await getApiClient().put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await getApiClient().delete(`/products/${id}`);
  },
};

// Subscription API
export const subscriptionApi = {
  search: async (searchParams: any = {}, page = 0, size = 10): Promise<PaginatedResponse<Subscription>> => {
    try {
      console.log('🔍 Fetching subscriptions with params:', { page, size, searchParams });
      
      // Bypass the interceptor to get raw response with metadata
      const apiClient = getApiClient();
      const response = await apiClient.get('/subscriptions/paged', {
        params: {
          page,
          size,
          ...searchParams,
        },
        transformResponse: [(data) => data], // Keep raw response
      });
      
      // Parse the raw response
      const rawData = JSON.parse(response.data);
      console.log('📡 Subscriptions API raw response:', rawData);
      
      // Extract data and metadata
      const subscriptionData = rawData.data || [];
      const metadata = rawData.metadata || {};
      
      const result = {
        content: subscriptionData,
        totalElements: metadata.totalElements || subscriptionData.length,
        totalPages: metadata.totalPages || Math.ceil((metadata.totalElements || subscriptionData.length) / size),
        first: metadata.first !== undefined ? metadata.first : true,
        last: metadata.last !== undefined ? metadata.last : true,
        size: metadata.size || size,
        number: metadata.page !== undefined ? metadata.page : page,
      };
      
      console.log('✅ Transformed subscriptions result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching subscriptions:', error);
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true,
        size: size,
        number: page,
      };
    }

  },

  getById: async (id: string): Promise<Subscription> => {
    const response = await getApiClient().get(`/subscriptions/${id}`);
    return response.data;
  },

  create: async (data: CreateSubscriptionRequest): Promise<Subscription> => {
    const response = await getApiClient().post('/subscriptions', data);
    return response.data;
  },

  update: async (id: string, data: UpdateSubscriptionRequest): Promise<Subscription> => {
    const response = await getApiClient().put(`/subscriptions/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await getApiClient().delete(`/subscriptions/${id}`);
  },

  cancel: async (id: string): Promise<Subscription> => {
    const response = await getApiClient().patch(`/subscriptions/${id}/cancel`);
    return response.data;
  },

  renew: async (id: string): Promise<Subscription> => {
    const response = await getApiClient().patch(`/subscriptions/${id}/renew`);
    return response.data;
  },
};

// Transaction API
export const transactionApi = {
  search: async (searchParams: { page?: number; size?: number; [key: string]: any } = {}): Promise<PaginatedResponse<Transaction>> => {
    // Bypass the interceptor to get raw response with metadata
    const apiClient = getApiClient();
    const response = await apiClient.get('/transactions/paged', {
      params: {
        page: 0,
        size: 10,
        ...searchParams,
      },
      transformResponse: [(data) => data], // Keep raw response
    });
    
    // Parse the raw response
    const rawData = JSON.parse(response.data);
    console.log('📡 Transactions API raw response:', rawData);
    
    // Extract data and metadata
    const transactionData = rawData.data || [];
    const metadata = rawData.metadata || {};
    
    return {
      content: transactionData,
      totalElements: metadata.totalElements || transactionData.length,
      totalPages: metadata.totalPages || Math.ceil((metadata.totalElements || transactionData.length) / (searchParams.size || 10)),
      first: metadata.first !== undefined ? metadata.first : true,
      last: metadata.last !== undefined ? metadata.last : true,
      size: metadata.size || searchParams.size || 10,
      number: metadata.page !== undefined ? metadata.page : searchParams.page || 0,
    };
  },

  getById: async (id: string): Promise<Transaction> => {
    const response = await getApiClient().get(`/transactions/${id}`);
    return response.data;
  },

  create: async (data: CreateTransactionRequest): Promise<Transaction> => {
    const response = await getApiClient().post('/transactions', data);
    return response.data;
  },

  update: async (id: string, data: UpdateTransactionRequest): Promise<Transaction> => {
    const response = await getApiClient().put(`/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await getApiClient().delete(`/transactions/${id}`);
  },
};

// Export userApi alias for consistency
export const userApi = userProfileApi;