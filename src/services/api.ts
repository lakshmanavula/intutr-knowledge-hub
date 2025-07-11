import axios from 'axios';
import type { 
  CourseCategory, 
  CreateCourseCategoryRequest, 
  UpdateCourseCategoryRequest,
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
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