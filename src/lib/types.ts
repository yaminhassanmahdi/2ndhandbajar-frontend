
export type FeaturedImage = {
  id: string; // e.g., 'feat-img-1'
  imageUrl: string;
  imageHint: string;
  linkUrl?: string;
  title?: string;
};

export type Category = {
  id: string;
  name: string;
  imageUrl?: string;
  imageHint?: string;
  sortOrder?: number;
  featuredImages?: FeaturedImage[];
  categorySlides?: HeroBannerSlide[]; // Reusing HeroBannerSlide type
};

export type SubCategory = {
  id:string;
  name: string;
  parentCategoryId: string;
  imageUrl?: string;
  imageHint?: string;
};

export type CategoryAttributeType = {
  id: string;
  categoryId: string; // Links to parent Category.id
  name: string; // e.g., "Author", "Color", "Material"
};

export type CategoryAttributeValue = {
  id: string;
  attributeTypeId: string; // Links to CategoryAttributeType.id
  value: string; // e.g., "Mr. Rahim", "Red", "Cotton"
  imageUrl?: string;
  imageHint?: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint?: string;
  categoryId: string;
  subCategoryId?: string;
  selectedAttributes?: Array<{
    attributeTypeId: string;
    attributeValueId: string;
  }>;
  sellerId: string;
  sellerName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  createdAt: Date;
  stock: number;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  sellerId?: string;
  stock?: number;
};

export type Division = {
  id: string;
  name: string;
};

export type District = {
  id: string;
  name: string;
  divisionId: string;
};

export type Thana = { // Also used as Upazilla
  id: string;
  name: string;
  districtId: string;
};

export type ShippingAddress = {
  fullName: string;
  phoneNumber?: string; // Optional at address level, main phone is on User
  country: string;
  division: string;
  district: string;
  thana: string; // Upazilla name
  houseAddress: string;
  roadNumber?: string;
};

export type SortByType =
  | 'date_desc'
  | 'date_asc'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'accepted' | 'handed_over' | 'in_shipping';
export type PaymentStatus = 'paid' | 'unpaid';

export type ShippingMethod = {
  id: string;
  name: string;
};

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  deliveryChargeAmount?: number;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  platformCommission?: number;
  selectedShippingMethodId?: string;
  shippingMethodName?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WithdrawalMethodType = 'bkash' | 'bank';

export type BKashDetails = {
  accountNumber: string;
};

export type BankDetails = {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber?: string;
  branchName?: string;
};

export type WithdrawalMethod = {
  id: string;
  type: WithdrawalMethodType;
  details: BKashDetails | BankDetails;
  isDefault?: boolean;
  createdAt: Date;
};

export type User = {
  id: string;
  phoneNumber: string; // Now required
  email?: string; // Now optional
  name: string;
  isAdmin?: boolean;
  defaultShippingAddress?: ShippingAddress | null;
  withdrawalMethods?: WithdrawalMethod[];
  // Temp field for Google Sign-In flow
  isAwaitingPhoneNumber?: boolean; 
  googleEmail?: string; // Store email from Google if phone needed
};

export type AdminNavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: AdminNavItem[];
};

export type Currency = {
  code: string; 
  symbol: string; 
  name: string; 
};

export type BusinessSettings = {
  logoUrl?: string;
  primaryColor?: string; 
  secondaryColor?: string; 
  faviconUrl?: string;
  appName?: string;
  availableCurrencies: Currency[];
  defaultCurrencyCode: string; 
  googleClientId?: string;
  googleClientSecret?: string;
};

export type HeroBannerSlide = {
  id: string;
  imageUrl: string;
  imageHint: string; 
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  bgColor?: string; 
  textColor?: string; 
  isActive: boolean;
};

export type CustomPage = {
  id: string;
  slug: string;
  title: string;
  content: string; 
  createdAt: Date;
  updatedAt: Date;
};


export type WithdrawalRequestStatus = 'pending' | 'approved' | 'rejected';

export type WithdrawalRequest = {
  id: string;
  userId: string;
  userName: string; 
  amount: number;
  withdrawalMethodId: string;
  withdrawalMethodType: WithdrawalMethodType;
  withdrawalMethodDetails: string; 
  status: WithdrawalRequestStatus;
  requestedAt: Date;
  processedAt?: Date;
  adminNote?: string;
};


export type DeliveryChargeSettings = {
  intraThana: number;    
  intraDistrict: number; 
  interDistrict: number; 
};
