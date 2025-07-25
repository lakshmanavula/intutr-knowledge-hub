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

export interface LobFountMaster {
  id: string;
  createdBy: string;
  modifiedBy: string;
  createdByName: string;
  modifiedByName: string;
  createdDate: string;
  modifiedDate: string;
  deleted: boolean;
  courseId: string;
  topicId: string;
  topicTitle: string;
  lobType: string;
  trackNum: string;
  topicSeqNum: string;
  topicLevel: number;
  quizSeqNum: string;
  lobChunkIdx: number;
  lobData: {
    content: string;
  };
  isActive: boolean;
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
  lastLoggedIn: string;
  createdBy: string;
  createdByName: string;
  modifiedBy: string;
  modifiedByName: string;
  createdDate: string;
  modifiedDate: string;
  deleted: boolean;
}

export interface CreateUserProfileRequest {
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
}

export interface UpdateUserProfileRequest {
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
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minimumAmount: number;
  maximumDiscount: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  applicableToAllCourses: boolean;
  applicableCourseIds: string[];
  createdBy: string;
  createdByName: string;
  modifiedBy: string;
  modifiedByName: string;
  createdDate: string;
  modifiedDate: string;
  deleted: boolean;
}

export interface CreateCouponRequest {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minimumAmount: number;
  maximumDiscount: number;
  usageLimit: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  applicableToAllCourses: boolean;
  applicableCourseIds: string[];
}

export interface UpdateCouponRequest {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minimumAmount: number;
  maximumDiscount: number;
  usageLimit: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  applicableToAllCourses: boolean;
  applicableCourseIds: string[];
}

export interface Review {
  id: string;
  courseId: string;
  courseName: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  isApproved: boolean;
  isPublic: boolean;
  helpfulCount: number;
  createdBy: string;
  createdByName: string;
  modifiedBy: string;
  modifiedByName: string;
  createdDate: string;
  modifiedDate: string;
  deleted: boolean;
}

export interface CreateReviewRequest {
  courseId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  isApproved: boolean;
  isPublic: boolean;
}

export interface UpdateReviewRequest {
  courseId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  isApproved: boolean;
  isPublic: boolean;
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

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}

// Product types
export enum ProductType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  ONE_TIME = 'ONE_TIME'
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface Product {
  id: string;
  createdBy: string;
  modifiedBy: string;
  createdByName: string;
  modifiedByName: string;
  createdDate: string;
  modifiedDate: string;
  deleted: boolean;
  name: string;
  description: string;
  type: ProductType;
  price: number;
  currency: string;
  durationDays?: number;
  associatedCourseIds: string[];
  platformProductIdGoogle?: string;
  platformProductIdApple?: string;
  stripePriceId?: string;
  razorpayPlanId?: string;
  razorpayProductId?: string;
  status: ProductStatus;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  type: ProductType;
  price: number;
  currency: string;
  durationDays?: number;
  associatedCourseIds: string[];
  platformProductIdGoogle?: string;
  platformProductIdApple?: string;
  stripePriceId?: string;
  razorpayPlanId?: string;
  razorpayProductId?: string;
  status: ProductStatus;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  type?: ProductType;
  price?: number;
  currency?: string;
  durationDays?: number;
  associatedCourseIds?: string[];
  platformProductIdGoogle?: string;
  platformProductIdApple?: string;
  stripePriceId?: string;
  razorpayPlanId?: string;
  razorpayProductId?: string;
  status?: ProductStatus;
}