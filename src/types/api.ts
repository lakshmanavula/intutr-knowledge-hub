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

export interface Course {
  id: string;
  name: string;
  courseLabel: string;
  description: string;
  fees: number;
  duration: number;
  thumbnail: string;
  status: 'CREATED' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  xlsxFilePath: string;
  categoryId: string;
  categoryName: string;
  tags: string;
  totalTopics: number;
  totalLOBs: number;
  averageRating: number;
  totalReviews: number;
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
  orderIndex: number;
  courseId: string;
  courseName: string;
  isActive: boolean;
  totalLOBs: number;
  completedLOBs: number;
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
  orderIndex: number;
  courseId: string;
  isActive: boolean;
}

export interface UpdateCourseTopicRequest {
  topicName: string;
  description: string;
  orderIndex: number;
  isActive: boolean;
}

export interface LobData {
  id: string;
  lobName: string;
  lobType: 'QUESTION' | 'EXPLANATION' | 'EXAMPLE' | 'EXERCISE';
  content: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  estimatedTimeMinutes: number;
  orderIndex: number;
  topicId: string;
  topicName: string;
  isActive: boolean;
  tags: string[];
  metadata: Record<string, any>;
  createdBy: string;
  createdByName: string;
  modifiedBy: string;
  modifiedByName: string;
  createdDate: string;
  modifiedDate: string;
  deleted: boolean;
}

export interface CreateLobDataRequest {
  lobName: string;
  lobType: 'QUESTION' | 'EXPLANATION' | 'EXAMPLE' | 'EXERCISE';
  content: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  estimatedTimeMinutes: number;
  orderIndex: number;
  topicId: string;
  isActive: boolean;
  tags: string[];
  metadata: Record<string, any>;
}

export interface UpdateLobDataRequest {
  lobName: string;
  lobType: 'QUESTION' | 'EXPLANATION' | 'EXAMPLE' | 'EXERCISE';
  content: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  estimatedTimeMinutes: number;
  orderIndex: number;
  isActive: boolean;
  tags: string[];
  metadata: Record<string, any>;
}

export interface LobFountMaster {
  id: string;
  courseId: string;
  courseName: string;
  topicId: string;
  topicName: string;
  trackNumber: string;
  lobName: string;
  lobType: string;
  content: string;
  difficulty: string;
  estimatedTimeMinutes: number;
  orderIndex: number;
  isActive: boolean;
  tags: string;
  createdBy: string;
  createdByName: string;
  modifiedBy: string;
  modifiedByName: string;
  createdDate: string;
  modifiedDate: string;
  deleted: boolean;
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
  isPublic: boolean;
}

export interface UpdateReviewRequest {
  rating: number;
  title: string;
  comment: string;
  isPublic: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  price: number;
  currency: string;
  durationDays?: number;
  associatedCourseIds?: string[];
  platformProductIdGoogle?: string;
  platformProductIdApple?: string;
  stripePriceId?: string;
  razorpayPlanId?: string;
  razorpayProductId?: string;
  status: ProductStatus;
  createdBy: string;
  modifiedBy: string;
  createdByName: string;
  modifiedByName: string;
  createdDate: string;
  modifiedDate: string;
  deleted: boolean;
}

export enum ProductType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  ONE_TIME = 'ONE_TIME'
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface CreateProductRequest {
  name: string;
  description: string;
  type: ProductType;
  price: number;
  currency: string;
  durationDays?: number;
  associatedCourseIds?: string[];
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

// Subscription types
export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  userEmail: string;
  userName: string;
  productName: string;
  productType: ProductType;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  paymentMethod: PaymentMethod;
  amount: number;
  currency: string;
  autoRenewal: boolean;
  platformSubscriptionId?: string;
  stripeSubscriptionId?: string;
  razorpaySubscriptionId?: string;
  createdBy: string;
  modifiedBy: string;
  createdByName: string;
  modifiedByName: string;
  createdDate: string;
  modifiedDate: string;
  deleted: boolean;
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED'
}

export enum PaymentMethod {
  STRIPE = 'STRIPE',
  RAZORPAY = 'RAZORPAY',
  GOOGLE_PAY = 'GOOGLE_PAY',
  APPLE_PAY = 'APPLE_PAY',
  MANUAL = 'MANUAL'
}

export interface CreateSubscriptionRequest {
  userId: string;
  productId: string;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  paymentMethod: PaymentMethod;
  amount: number;
  currency: string;
  autoRenewal: boolean;
  platformSubscriptionId?: string;
  stripeSubscriptionId?: string;
  razorpaySubscriptionId?: string;
}

export interface UpdateSubscriptionRequest {
  startDate?: string;
  endDate?: string;
  status?: SubscriptionStatus;
  paymentMethod?: PaymentMethod;
  amount?: number;
  currency?: string;
  autoRenewal?: boolean;
  platformSubscriptionId?: string;
  stripeSubscriptionId?: string;
  razorpaySubscriptionId?: string;
}

// ============= TRANSACTION INTERFACES =============
export enum TransactionType {
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  SUBSCRIPTION = 'SUBSCRIPTION',
  PURCHASE = 'PURCHASE'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export interface Transaction {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  subscriptionId?: string;
  productId?: string;
  productName?: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  stripeTransactionId?: string;
  razorpayTransactionId?: string;
  description?: string;
  failureReason?: string;
  createdBy: string;
  createdByName: string;
  modifiedBy: string;
  modifiedByName: string;
  createdDate: string;
  modifiedDate: string;
  deleted: boolean;
}

export interface CreateTransactionRequest {
  userId: string;
  subscriptionId?: string;
  productId?: string;
  type: TransactionType;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  stripeTransactionId?: string;
  razorpayTransactionId?: string;
  description?: string;
}

export interface UpdateTransactionRequest {
  status?: TransactionStatus;
  transactionReference?: string;
  stripeTransactionId?: string;
  razorpayTransactionId?: string;
  description?: string;
  failureReason?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  number: number;
  numberOfElements?: number;
  pageable?: {
    offset: number;
    sort: any[];
    unpaged: boolean;
    paged: boolean;
    pageNumber: number;
    pageSize: number;
  };
  sort?: any[];
  empty?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
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

export interface LoginResponse {
  token: string;
  expiresIn: number;
  user: AuthUser;
}