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
  PaginatedResponse,
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
        
        // If it's the new format with success field
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
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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
    console.log('🔐 Attempting login to:', `${config.apiBaseUrl}/api/auth/login`);
    
    const response = await getApiClient().post<any>('/api/auth/login', credentials);
    
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
      await getApiClient().post('/api/auth/logout');
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
    const userStr = localStorage.getItem('authUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('authUser');
      }
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },

  // Refresh token (if your API supports it)
  refreshToken: async (): Promise<LoginResponse> => {
    const response = await getApiClient().post<LoginResponse>('/api/auth/refresh');
    
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
    const response = await getApiClient().get<CourseCategory[]>('/api/course-categories');
    return response.data;
  },

  // Get paginated categories
  getPaginated: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<CourseCategory>> => {
    const response = await getApiClient().get<{
      status: string;
      data: CourseCategory[];
      metadata: {
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
        first: boolean;
        last: boolean;
      };
    }>(`/api/course-categories/paged?page=${page}&size=${size}`);
    
    // Transform API response to match PaginatedResponse interface
    return {
      content: response.data.data,
      totalElements: response.data.metadata.totalElements,
      totalPages: response.data.metadata.totalPages,
      size: response.data.metadata.size,
      number: response.data.metadata.page,
      first: response.data.metadata.first,
      last: response.data.metadata.last,
    };
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
  getAll: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<Course>> => {
    const response = await getApiClient().get<PaginatedResponse<Course>>(
      `/lob-fount-courses/paginated?page=${page}&size=${size}`
    );
    return response.data;
  },

  // Get paginated courses
  getPaginated: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<Course>> => {
    const response = await getApiClient().get<{
      status: string;
      data: Course[];
      metadata: {
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
        first: boolean;
        last: boolean;
      };
    }>(`/lob-fount-courses/paginated?page=${page}&size=${size}`);
    
    // Transform API response to match PaginatedResponse interface
    return {
      content: response.data.data,
      totalElements: response.data.metadata.totalElements,
      totalPages: response.data.metadata.totalPages,
      size: response.data.metadata.size,
      number: response.data.metadata.page,
      first: response.data.metadata.first,
      last: response.data.metadata.last,
    };
  },

  // Get course by ID
  getById: async (id: string): Promise<Course> => {
    const response = await getApiClient().get<Course>(`/lob-fount-courses/${id}`);
    return response.data;
  },

  // Create new course
  create: async (course: CreateCourseRequest): Promise<Course> => {
    const response = await getApiClient().post<Course>('/lob-fount-courses', course);
    return response.data;
  },

  // Update existing course
  update: async (id: string, course: UpdateCourseRequest): Promise<Course> => {
    const response = await getApiClient().put<Course>(`/lob-fount-courses/${id}`, course);
    return response.data;
  },

  // Delete course
  delete: async (id: string): Promise<void> => {
    await getApiClient().delete(`/lob-fount-courses/${id}`);
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
      '/lob-fount-courses/search', 
      criteria
    );
    return response.data;
  },

  // Bulk delete courses
  bulkDelete: async (ids: string[]): Promise<void> => {
    await getApiClient().post('/lob-fount-courses/bulk-delete', { ids });
  },

  // Update course status
  updateStatus: async (id: string, status: Course['status']): Promise<Course> => {
    const response = await getApiClient().patch<Course>(`/lob-fount-courses/${id}/status`, { status });
    return response.data;
  },

  // Get courses by category
  getByCategory: async (categoryId: string): Promise<Course[]> => {
    const response = await getApiClient().get<Course[]>(`/lob-fount-courses/category/${categoryId}`);
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
      `/user-profiles/paginated?page=${page}&size=${size}`
    );
    return response.data;
  },

  // Get paginated users
  getPaginated: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<UserProfile>> => {
    const response = await getApiClient().get<PaginatedResponse<UserProfile>>(
      `/user-profiles/paginated?page=${page}&size=${size}`
    );
    return response.data;
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
    const response = await getApiClient().get<PaginatedResponse<Coupon>>(
      `/coupons/paginated?page=${page}&size=${size}`
    );
    return response.data;
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

// Export userApi alias for consistency
export const userApi = userProfileApi;