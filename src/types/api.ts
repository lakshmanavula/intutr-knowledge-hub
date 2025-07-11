// Core types for the Intutr Kmap application

export interface CourseCategory {
  id: string;
  categoryName: string;
  description: string;
  isActive: boolean;
  createdBy: string;
  createdByName: string;
  modifiedBy: string;
  modifiedByName: string;
  createdDate: string;
  modifiedDate: string;
  deleted: boolean;
}

export interface CreateCourseCategoryRequest {
  categoryName: string;
  description: string;
  isActive: boolean;
}

export interface UpdateCourseCategoryRequest {
  categoryName: string;
  description: string;
  isActive: boolean;
}

export interface CreateCourseRequest {
  name: string;
  courseLabel: string;
  description: string;
  fees: number;
  duration: number;
  thumbnail: string;
  status: 'CREATED' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  xlsxFilePath: string;
  categoryId: string;
  tags: string;
}

export interface UpdateCourseRequest {
  name: string;
  courseLabel: string;
  description: string;
  fees: number;
  duration: number;
  thumbnail: string;
  status: 'CREATED' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  xlsxFilePath: string;
  categoryId: string;
  tags: string;
}

export interface UpdateCourseCategoryRequest {
  categoryName: string;
  description: string;
  isActive: boolean;
}

export interface Course {
  id: string;
  name: string;
  courseLabel: string;
  description: string;
  rating: number;
  fees: number;
  duration: number; // in days
  thumbnail: string;
  status: 'CREATED' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  xlsxFilePath: string;
  categoryId: string;
  categoryName: string;
  tags: string;
  createdBy: string;
  createdByName: string;
  modifiedBy: string;
  modifiedByName: string;
  createdDate: string;
  modifiedDate: string;
  deleted: boolean;
}

export interface CourseTopic {
  id: string;
  topicName: string;
  description: string;
  courseId: string;
  courseName: string;
  orderIndex: number;
  duration: number; // in minutes
  isActive: boolean;
  createdBy: string;
  createdByName: string;
  modifiedBy: string;
  modifiedByName: string;
  createdDate: string;
  modifiedDate: string;
  deleted: boolean;
}

export interface CreateCourseTopicRequest {
  topicName: string;
  description: string;
  courseId: string;
  orderIndex: number;
  duration: number;
  isActive: boolean;
}

export interface UpdateCourseTopicRequest {
  topicName: string;
  description: string;
  courseId: string;
  orderIndex: number;
  duration: number;
  isActive: boolean;
}

export interface LobData {
  id: string;
  topicId: string;
  topicName: string;
  lobName: string;
  lobDescription: string;
  lobType: 'CONTENT' | 'EXERCISE' | 'ASSESSMENT' | 'VIDEO' | 'DOCUMENT';
  orderIndex: number;
  duration: number; // in minutes
  resourceUrl: string;
  isActive: boolean;
  createdBy: string;
  createdByName: string;
  modifiedBy: string;
  modifiedByName: string;
  createdDate: string;
  modifiedDate: string;
  deleted: boolean;
}

export interface CreateLobDataRequest {
  topicId: string;
  lobName: string;
  lobDescription: string;
  lobType: 'CONTENT' | 'EXERCISE' | 'ASSESSMENT' | 'VIDEO' | 'DOCUMENT';
  orderIndex: number;
  duration: number;
  resourceUrl: string;
  isActive: boolean;
}

export interface UpdateLobDataRequest {
  topicId: string;
  lobName: string;
  lobDescription: string;
  lobType: 'CONTENT' | 'EXERCISE' | 'ASSESSMENT' | 'VIDEO' | 'DOCUMENT';
  orderIndex: number;
  duration: number;
  resourceUrl: string;
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  profilePicture: string;
  isActive: boolean;
  createdBy: string;
  createdByName: string;
  modifiedBy: string;
  modifiedByName: string;
  createdDate: string;
  modifiedDate: string;
  deleted: boolean;
}

// API Response types
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}