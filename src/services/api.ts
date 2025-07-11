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
  PaginatedResponse 
} from '@/types/api';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for adding auth tokens if needed
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token here if available
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

export const courseCategoryApi = {
  // Get all categories
  getAll: async (): Promise<CourseCategory[]> => {
    const response = await apiClient.get<CourseCategory[]>('/course-categories');
    return response.data;
  },

  // Get paginated categories
  getPaginated: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<CourseCategory>> => {
    const response = await apiClient.get<PaginatedResponse<CourseCategory>>(
      `/course-categories/paged?page=${page}&size=${size}`
    );
    return response.data;
  },

  // Get category by ID
  getById: async (id: string): Promise<CourseCategory> => {
    const response = await apiClient.get<CourseCategory>(`/course-categories/${id}`);
    return response.data;
  },

  // Create new category
  create: async (category: CreateCourseCategoryRequest): Promise<CourseCategory> => {
    const response = await apiClient.post<CourseCategory>('/course-categories', category);
    return response.data;
  },

  // Update existing category
  update: async (id: string, category: UpdateCourseCategoryRequest): Promise<CourseCategory> => {
    const response = await apiClient.put<CourseCategory>(`/course-categories/${id}`, category);
    return response.data;
  },

  // Delete category
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/course-categories/${id}`);
  },

  // Search categories
  search: async (criteria: { 
    categoryName?: string; 
    isActive?: boolean; 
    page?: number; 
    size?: number; 
  }): Promise<PaginatedResponse<CourseCategory>> => {
    const response = await apiClient.post<PaginatedResponse<CourseCategory>>(
      '/course-categories/search', 
      criteria
    );
    return response.data;
  },

  // Bulk delete categories
  bulkDelete: async (ids: string[]): Promise<void> => {
    await apiClient.post('/course-categories/bulk-delete', { ids });
  },

  // Toggle active status
  toggleActive: async (id: string): Promise<CourseCategory> => {
    const response = await apiClient.patch<CourseCategory>(`/course-categories/${id}/toggle-active`);
    return response.data;
  },
};

export const courseApi = {
  // Get all courses
  getAll: async (): Promise<Course[]> => {
    const response = await apiClient.get<Course[]>('/lob-fount-courses');
    return response.data;
  },

  // Get paginated courses
  getPaginated: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<Course>> => {
    const response = await apiClient.get<PaginatedResponse<Course>>(
      `/lob-fount-courses/paginated?page=${page}&size=${size}`
    );
    return response.data;
  },

  // Get course by ID
  getById: async (id: string): Promise<Course> => {
    const response = await apiClient.get<Course>(`/lob-fount-courses/${id}`);
    return response.data;
  },

  // Create new course
  create: async (course: CreateCourseRequest): Promise<Course> => {
    const response = await apiClient.post<Course>('/lob-fount-courses', course);
    return response.data;
  },

  // Update existing course
  update: async (id: string, course: UpdateCourseRequest): Promise<Course> => {
    const response = await apiClient.put<Course>(`/lob-fount-courses/${id}`, course);
    return response.data;
  },

  // Delete course
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/lob-fount-courses/${id}`);
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
    const response = await apiClient.post<PaginatedResponse<Course>>(
      '/lob-fount-courses/search', 
      criteria
    );
    return response.data;
  },

  // Bulk delete courses
  bulkDelete: async (ids: string[]): Promise<void> => {
    await apiClient.post('/lob-fount-courses/bulk-delete', { ids });
  },

  // Update course status
  updateStatus: async (id: string, status: Course['status']): Promise<Course> => {
    const response = await apiClient.patch<Course>(`/lob-fount-courses/${id}/status`, { status });
    return response.data;
  },

  // Get courses by category
  getByCategory: async (categoryId: string): Promise<Course[]> => {
    const response = await apiClient.get<Course[]>(`/lob-fount-courses/category/${categoryId}`);
    return response.data;
  },
};

export const courseTopicApi = {
  // Get all topics
  getAll: async (): Promise<CourseTopic[]> => {
    const response = await apiClient.get<CourseTopic[]>('/course-topics');
    return response.data;
  },

  // Get paginated topics
  getPaginated: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<CourseTopic>> => {
    const response = await apiClient.get<PaginatedResponse<CourseTopic>>(
      `/course-topics/paginated?page=${page}&size=${size}`
    );
    return response.data;
  },

  // Get topic by ID
  getById: async (id: string): Promise<CourseTopic> => {
    const response = await apiClient.get<CourseTopic>(`/course-topics/${id}`);
    return response.data;
  },

  // Get topics by course
  getByCourse: async (courseId: string): Promise<CourseTopic[]> => {
    const response = await apiClient.get<CourseTopic[]>(`/course-topics/course/${courseId}`);
    return response.data;
  },

  // Create new topic
  create: async (topic: CreateCourseTopicRequest): Promise<CourseTopic> => {
    const response = await apiClient.post<CourseTopic>('/course-topics', topic);
    return response.data;
  },

  // Update existing topic
  update: async (id: string, topic: UpdateCourseTopicRequest): Promise<CourseTopic> => {
    const response = await apiClient.put<CourseTopic>(`/course-topics/${id}`, topic);
    return response.data;
  },

  // Delete topic
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/course-topics/${id}`);
  },

  // Search topics
  search: async (criteria: { 
    topicName?: string;
    courseId?: string;
    isActive?: boolean;
    page?: number; 
    size?: number; 
  }): Promise<PaginatedResponse<CourseTopic>> => {
    const response = await apiClient.post<PaginatedResponse<CourseTopic>>(
      '/course-topics/search', 
      criteria
    );
    return response.data;
  },

  // Bulk delete topics
  bulkDelete: async (ids: string[]): Promise<void> => {
    await apiClient.post('/course-topics/bulk-delete', { ids });
  },

  // Toggle active status
  toggleActive: async (id: string): Promise<CourseTopic> => {
    const response = await apiClient.patch<CourseTopic>(`/course-topics/${id}/toggle-active`);
    return response.data;
  },

  // Reorder topics
  reorder: async (courseId: string, topicIds: string[]): Promise<void> => {
    await apiClient.patch(`/course-topics/course/${courseId}/reorder`, { topicIds });
  },
};

export const lobDataApi = {
  // Get all lob data
  getAll: async (): Promise<LobData[]> => {
    const response = await apiClient.get<LobData[]>('/lob-data');
    return response.data;
  },

  // Get paginated lob data
  getPaginated: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<LobData>> => {
    const response = await apiClient.get<PaginatedResponse<LobData>>(
      `/lob-data/paginated?page=${page}&size=${size}`
    );
    return response.data;
  },

  // Get lob data by ID
  getById: async (id: string): Promise<LobData> => {
    const response = await apiClient.get<LobData>(`/lob-data/${id}`);
    return response.data;
  },

  // Get lob data by topic
  getByTopic: async (topicId: string): Promise<LobData[]> => {
    const response = await apiClient.get<LobData[]>(`/lob-data/topic/${topicId}`);
    return response.data;
  },

  // Create new lob data
  create: async (lobData: CreateLobDataRequest): Promise<LobData> => {
    const response = await apiClient.post<LobData>('/lob-data', lobData);
    return response.data;
  },

  // Update existing lob data
  update: async (id: string, lobData: UpdateLobDataRequest): Promise<LobData> => {
    const response = await apiClient.put<LobData>(`/lob-data/${id}`, lobData);
    return response.data;
  },

  // Delete lob data
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/lob-data/${id}`);
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
    const response = await apiClient.post<PaginatedResponse<LobData>>(
      '/lob-data/search', 
      criteria
    );
    return response.data;
  },

  // Bulk delete lob data
  bulkDelete: async (ids: string[]): Promise<void> => {
    await apiClient.post('/lob-data/bulk-delete', { ids });
  },

  // Toggle active status
  toggleActive: async (id: string): Promise<LobData> => {
    const response = await apiClient.patch<LobData>(`/lob-data/${id}/toggle-active`);
    return response.data;
  },

  // Reorder lob data within topic
  reorder: async (topicId: string, lobDataIds: string[]): Promise<void> => {
    await apiClient.patch(`/lob-data/topic/${topicId}/reorder`, { lobDataIds });
  },
};

export const userProfileApi = {
  // Get all users
  getAll: async (): Promise<UserProfile[]> => {
    const response = await apiClient.get<UserProfile[]>('/user-profiles');
    return response.data;
  },

  // Get paginated users
  getPaginated: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<UserProfile>> => {
    const response = await apiClient.get<PaginatedResponse<UserProfile>>(
      `/user-profiles/paginated?page=${page}&size=${size}`
    );
    return response.data;
  },

  // Get user by ID
  getById: async (id: string): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>(`/user-profiles/${id}`);
    return response.data;
  },

  // Create new user
  create: async (user: CreateUserProfileRequest): Promise<UserProfile> => {
    const response = await apiClient.post<UserProfile>('/user-profiles', user);
    return response.data;
  },

  // Update existing user
  update: async (id: string, user: UpdateUserProfileRequest): Promise<UserProfile> => {
    const response = await apiClient.put<UserProfile>(`/user-profiles/${id}`, user);
    return response.data;
  },

  // Delete user
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/user-profiles/${id}`);
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
    const response = await apiClient.post<PaginatedResponse<UserProfile>>(
      '/user-profiles/search', 
      criteria
    );
    return response.data;
  },

  // Bulk delete users
  bulkDelete: async (ids: string[]): Promise<void> => {
    await apiClient.post('/user-profiles/bulk-delete', { ids });
  },

  // Toggle active status
  toggleActive: async (id: string): Promise<UserProfile> => {
    const response = await apiClient.patch<UserProfile>(`/user-profiles/${id}/toggle-active`);
    return response.data;
  },
};