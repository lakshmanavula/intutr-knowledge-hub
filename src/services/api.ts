import axios from 'axios';
import type { 
  CourseCategory, 
  CreateCourseCategoryRequest, 
  UpdateCourseCategoryRequest,
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

export default apiClient;