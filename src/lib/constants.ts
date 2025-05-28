
import type { OrderStatus, Division, District, Thana as Upazilla, Category, CommissionSetting, AdminNavItem, BusinessSettings, HeroBannerSlide, CustomPage, ShippingMethod, Currency, SubCategory, CategoryAttributeType, CategoryAttributeValue, FeaturedImage } from './types';
import {
  Smartphone, Laptop, Shirt, Armchair, BookOpen, Tag,
  Package as PackageIcon,
  PackageCheck, PackageX, Truck, CheckCircle2, Hourglass,
  Handshake as HandshakeIcon,
  LayoutDashboard, CheckSquare, ShoppingCart, Users,
  ListChecks, FolderTree, Tags as TagsIcon, Settings2 as SettingsIcon,
  Globe, Library, MapPin, Home, DollarSign, Briefcase, Edit, Trash2, CreditCard, PieChart, FileText, TrendingUp, Percent, ImageIcon, FileType, Ship, Landmark, ListFilter, Banknote, LogIn
} from 'lucide-react';

export let APP_NAME = '2ndhandbajar.com';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'electronics', name: 'Electronics', imageUrl: 'https://placehold.co/80x80/007bff/ffffff.png?text=E', imageHint: 'electronics gadget', sortOrder: 1, featuredImages: [], categorySlides: [] },
  { id: 'fashion', name: 'Fashion', imageUrl: 'https://placehold.co/80x80/ff69b4/ffffff.png?text=F', imageHint: 'fashion clothing', sortOrder: 2, featuredImages: [], categorySlides: [] },
  { id: 'home-garden', name: 'Home & Garden', imageUrl: 'https://placehold.co/80x80/28a745/ffffff.png?text=H', imageHint: 'home decor', sortOrder: 3, featuredImages: [], categorySlides: [] },
  { id: 'books', name: 'Books', imageUrl: 'https://placehold.co/80x80/fd7e14/ffffff.png?text=B', imageHint: 'books literature', sortOrder: 4, featuredImages: [], categorySlides: [] },
  { id: 'others', name: 'Others', imageUrl: 'https://placehold.co/80x80/6c757d/ffffff.png?text=O', imageHint: 'various items', sortOrder: 5, featuredImages: [], categorySlides: [] },
];

export const INITIAL_SUB_CATEGORIES: SubCategory[] = [
  { id: 'sc_smartphones', name: 'Smartphones', parentCategoryId: 'electronics', imageUrl: 'https://placehold.co/80x80/007bff/ffffff.png?text=S', imageHint: 'smartphones mobile' },
  { id: 'sc_laptops', name: 'Laptops', parentCategoryId: 'electronics', imageUrl: 'https://placehold.co/80x80/007bff/ffffff.png?text=L', imageHint: 'laptops computer' },
  { id: 'sc_mens_apparel', name: 'Mens Apparel', parentCategoryId: 'fashion', imageUrl: 'https://placehold.co/80x80/ff69b4/ffffff.png?text=M', imageHint: 'mens clothing' },
  { id: 'sc_womens_apparel', name: 'Womens Apparel', parentCategoryId: 'fashion', imageUrl: 'https://placehold.co/80x80/ff69b4/ffffff.png?text=W', imageHint: 'womens clothing' },
  { id: 'sc_living_room', name: 'Living Room Furniture', parentCategoryId: 'home-garden', imageUrl: 'https://placehold.co/80x80/28a745/ffffff.png?text=LR', imageHint: 'furniture living room' },
  { id: 'sc_admission_books', name: 'Admission Prep', parentCategoryId: 'books', imageUrl: 'https://placehold.co/80x80/fd7e14/ffffff.png?text=A', imageHint: 'study books' },
  { id: 'sc_novels', name: 'Novels', parentCategoryId: 'books', imageUrl: 'https://placehold.co/80x80/fd7e14/ffffff.png?text=N', imageHint: 'fiction books' },
];

export const INITIAL_CATEGORY_ATTRIBUTE_TYPES: CategoryAttributeType[] = [
  { id: 'attr_author', categoryId: 'books', name: 'Author' },
  { id: 'attr_publication', categoryId: 'books', name: 'Publication' },
  { id: 'attr_color', categoryId: 'fashion', name: 'Color' },
  { id: 'attr_material', categoryId: 'fashion', name: 'Material' },
  { id: 'attr_storage', categoryId: 'electronics', name: 'Storage Size' },
  { id: 'attr_ram', categoryId: 'electronics', name: 'RAM' },
];

export const INITIAL_CATEGORY_ATTRIBUTE_VALUES: CategoryAttributeValue[] = [
  { id: 'val_author_rahim', attributeTypeId: 'attr_author', value: 'Mr. Rahim', imageUrl: 'https://placehold.co/40x40/777777/ffffff.png?text=AR', imageHint: 'author portrait' },
  { id: 'val_author_tagore', attributeTypeId: 'attr_author', value: 'Rabindranath Tagore', imageUrl: 'https://placehold.co/40x40/777777/ffffff.png?text=RT', imageHint: 'author profile' },
  { id: 'val_author_humayun', attributeTypeId: 'attr_author', value: 'Humayun Ahmed' },
  { id: 'val_pub_prothom', attributeTypeId: 'attr_publication', value: 'Prothom Alo Prokashona' },
  { id: 'val_pub_anyaprokash', attributeTypeId: 'attr_publication', value: 'Anyaprokash' },
  { id: 'val_color_red', attributeTypeId: 'attr_color', value: 'Red', imageUrl: 'https://placehold.co/40x40/ff0000/ffffff.png?text=R', imageHint: 'red color swatch' },
  { id: 'val_color_blue', attributeTypeId: 'attr_color', value: 'Blue', imageUrl: 'https://placehold.co/40x40/0000ff/ffffff.png?text=B', imageHint: 'blue color swatch' },
  { id: 'val_color_black', attributeTypeId: 'attr_color', value: 'Black', imageUrl: 'https://placehold.co/40x40/000000/ffffff.png?text=Blk', imageHint: 'black color swatch' },
  { id: 'val_material_cotton', attributeTypeId: 'attr_material', value: 'Cotton' },
  { id: 'val_material_leather', attributeTypeId: 'attr_material', value: 'Leather' },
  { id: 'val_storage_64gb', attributeTypeId: 'attr_storage', value: '64GB' },
  { id: 'val_storage_128gb', attributeTypeId: 'attr_storage', value: '128GB' },
  { id: 'val_storage_256gb', attributeTypeId: 'attr_storage', value: '256GB' },
  { id: 'val_ram_4gb', attributeTypeId: 'attr_ram', value: '4GB' },
  { id: 'val_ram_8gb', attributeTypeId: 'attr_ram', value: '8GB' },
  { id: 'val_ram_16gb', attributeTypeId: 'attr_ram', value: '16GB' },
];


export const ORDER_STATUSES: { value: OrderStatus; label: string, icon?: React.ComponentType<{className?: string}> }[] = [
  { value: 'pending', label: 'Pending', icon: Hourglass },
  { value: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { value: 'handed_over', label: 'Handed Over', icon: HandshakeIcon },
  { value: 'in_shipping', label: 'In Shipping', icon: Truck },
  { value: 'processing', label: 'Processing', icon: PackageIcon },
  { value: 'shipped', label: 'Shipped', icon: Truck },
  { value: 'delivered', label: 'Delivered', icon: PackageCheck },
  { value: 'cancelled', label: 'Cancelled', icon: PackageX },
];

export const PAYMENT_STATUSES: {value: 'paid' | 'unpaid', label: string}[] = [
    {value: 'paid', label: 'Paid'},
    {value: 'unpaid', label: 'Unpaid'},
];

export const SITE_NAVIGATION = [
  { name: 'Home', href: '/' },
  { name: 'Sell Product', href: '/sell', authRequired: true },
];

export const USER_NAVIGATION = [
  { name: 'My Orders', href: '/account/orders', icon: ShoppingCart },
  { name: 'My Products', href: '/account/my-products', icon: Briefcase },
  { name: 'My Earnings', href: '/account/my-earnings', icon: TrendingUp },
  { name: 'Account Settings', href: '/account/settings', icon: SettingsIcon },
];

export const DEFAULT_DIVISIONS: Division[] = [
  { id: 'barisal', name: 'Barisal' },
  { id: 'chittagong', name: 'Chittagong' },
  { id: 'dhaka', name: 'Dhaka' },
  { id: 'khulna', name: 'Khulna' },
  { id: 'mymensingh', name: 'Mymensingh' },
  { id: 'rajshahi', name: 'Rajshahi' },
  { id: 'rangpur', name: 'Rangpur' },
  { id: 'sylhet', name: 'Sylhet' },
];

export const DEFAULT_DISTRICTS: District[] = [
  // Dhaka Division
  { id: 'dhaka_dist', name: 'Dhaka', divisionId: 'dhaka' },
  { id: 'faridpur', name: 'Faridpur', divisionId: 'dhaka' },
  { id: 'gazipur', name: 'Gazipur', divisionId: 'dhaka' },
  { id: 'gopalganj', name: 'Gopalganj', divisionId: 'dhaka' },
  { id: 'kishoreganj', name: 'Kishoreganj', divisionId: 'dhaka' },
  { id: 'madaripur', name: 'Madaripur', divisionId: 'dhaka' },
  { id: 'manikganj', name: 'Manikganj', divisionId: 'dhaka' },
  { id: 'munshiganj', name: 'Munshiganj', divisionId: 'dhaka' },
  { id: 'narayanganj', name: 'Narayanganj', divisionId: 'dhaka' },
  { id: 'narsingdi', name: 'Narsingdi', divisionId: 'dhaka' },
  { id: 'rajbari', name: 'Rajbari', divisionId: 'dhaka' },
  { id: 'shariatpur', name: 'Shariatpur', divisionId: 'dhaka' },
  { id: 'tangail', name: 'Tangail', divisionId: 'dhaka' },
  // Chittagong Division
  { id: 'bandarban', name: 'Bandarban', divisionId: 'chittagong' },
  { id: 'brahmanbaria', name: 'Brahmanbaria', divisionId: 'chittagong' },
  { id: 'chandpur', name: 'Chandpur', divisionId: 'chittagong' },
  { id: 'chittagong_dist', name: 'Chittagong', divisionId: 'chittagong' },
  { id: 'comilla', name: 'Comilla', divisionId: 'chittagong' },
  { id: 'coxs_bazar', name: "Cox's Bazar", divisionId: 'chittagong' },
  { id: 'feni', name: 'Feni', divisionId: 'chittagong' },
  { id: 'khagrachhari', name: 'Khagrachhari', divisionId: 'chittagong' },
  { id: 'lakshmipur', name: 'Lakshmipur', divisionId: 'chittagong' },
  { id: 'noakhali', name: 'Noakhali', divisionId: 'chittagong' },
  { id: 'rangamati', name: 'Rangamati', divisionId: 'chittagong' },
  // Rajshahi Division
  { id: 'bogra', name: 'Bogra', divisionId: 'rajshahi' },
  { id: 'joypurhat', name: 'Joypurhat', divisionId: 'rajshahi' },
  { id: 'naogaon', name: 'Naogaon', divisionId: 'rajshahi' },
  { id: 'natore', name: 'Natore', divisionId: 'rajshahi' },
  { id: 'nawabganj_raj', name: 'Nawabganj', divisionId: 'rajshahi' },
  { id: 'pabna', name: 'Pabna', divisionId: 'rajshahi' },
  { id: 'rajshahi_dist', name: 'Rajshahi', divisionId: 'rajshahi' },
  { id: 'sirajganj', name: 'Sirajganj', divisionId: 'rajshahi' },
  // Khulna Division
  { id: 'bagerhat', name: 'Bagerhat', divisionId: 'khulna' },
  { id: 'chuadanga', name: 'Chuadanga', divisionId: 'khulna' },
  { id: 'jessore', name: 'Jessore', divisionId: 'khulna' },
  { id: 'jhenaidah', name: 'Jhenaidah', divisionId: 'khulna' },
  { id: 'khulna_dist', name: 'Khulna', divisionId: 'khulna' },
  { id: 'kushtia', name: 'Kushtia', divisionId: 'khulna' },
  { id: 'magura', name: 'Magura', divisionId: 'khulna' },
  { id: 'meherpur', name: 'Meherpur', divisionId: 'khulna' },
  { id: 'narail', name: 'Narail', divisionId: 'khulna' },
  { id: 'satkhira', name: 'Satkhira', divisionId: 'khulna' },
  // Barisal Division
  { id: 'barguna', name: 'Barguna', divisionId: 'barisal' },
  { id: 'barisal_dist', name: 'Barisal', divisionId: 'barisal' },
  { id: 'bhola', name: 'Bhola', divisionId: 'barisal' },
  { id: 'jhalokati', name: 'Jhalokati', divisionId: 'barisal' },
  { id: 'patuakhali', name: 'Patuakhali', divisionId: 'barisal' },
  { id: 'pirojpur', name: 'Pirojpur', divisionId: 'barisal' },
  // Sylhet Division
  { id: 'habiganj', name: 'Habiganj', divisionId: 'sylhet' },
  { id: 'moulvibazar', name: 'Moulvibazar', divisionId: 'sylhet' },
  { id: 'sunamganj', name: 'Sunamganj', divisionId: 'sylhet' },
  { id: 'sylhet_dist', name: 'Sylhet', divisionId: 'sylhet' },
  // Rangpur Division
  { id: 'dinajpur', name: 'Dinajpur', divisionId: 'rangpur' },
  { id: 'gaibandha', name: 'Gaibandha', divisionId: 'rangpur' },
  { id: 'kurigram', name: 'Kurigram', divisionId: 'rangpur' },
  { id: 'lalmonirhat', name: 'Lalmonirhat', divisionId: 'rangpur' },
  { id: 'nilphamari', name: 'Nilphamari', divisionId: 'rangpur' },
  { id: 'panchagarh', name: 'Panchagarh', divisionId: 'rangpur' },
  { id: 'rangpur_dist', name: 'Rangpur', divisionId: 'rangpur' },
  { id: 'thakurgaon', name: 'Thakurgaon', divisionId: 'rangpur' },
  // Mymensingh Division
  { id: 'jamalpur', name: 'Jamalpur', divisionId: 'mymensingh' },
  { id: 'mymensingh_dist', name: 'Mymensingh', divisionId: 'mymensingh' },
  { id: 'netrokona', name: 'Netrokona', divisionId: 'mymensingh' },
  { id: 'sherpur', name: 'Sherpur', divisionId: 'mymensingh' },
];

export const DEFAULT_UPAZILLAS: Upazilla[] = [
  // Dhaka District Upazillas
  { id: 'dhaka_city_consolidated', name: 'Dhaka City', districtId: 'dhaka_dist' },
  { id: 'savar_upazilla', name: 'Savar Upazila', districtId: 'dhaka_dist' },
  { id: 'keraniganj_upazilla', name: 'Keraniganj Upazila', districtId: 'dhaka_dist' },
  { id: 'dhamrai_upazilla', name: 'Dhamrai Upazila', districtId: 'dhaka_dist' },
  { id: 'dohar_upazilla', name: 'Dohar Upazila', districtId: 'dhaka_dist' },
  { id: 'nawabganj_dhaka_upazilla', name: 'Nawabganj Upazila (Dhaka)', districtId: 'dhaka_dist' },
  // Gazipur District Upazillas
  { id: 'gazipur_sadar_upazilla', name: 'Gazipur Sadar Upazila', districtId: 'gazipur' },
  { id: 'kaliakair_upazilla', name: 'Kaliakair Upazila', districtId: 'gazipur' },
  { id: 'kapasia_upazilla', name: 'Kapasia Upazila', districtId: 'gazipur' },
  { id: 'sreepur_upazilla', name: 'Sreepur Upazila', districtId: 'gazipur' },
  { id: 'kaliganj_gazipur_upazilla', name: 'Kaliganj Upazila (Gazipur)', districtId: 'gazipur' },
  // Chittagong District Upazillas
  { id: 'chittagong_sadar_upazilla', name: 'Chittagong Sadar Upazila', districtId: 'chittagong_dist' },
  { id: 'sitakunda_upazilla', name: 'Sitakunda Upazila', districtId: 'chittagong_dist' },
  { id: 'mirsharai_upazilla', name: 'Mirsharai Upazila', districtId: 'chittagong_dist' },
  { id: 'patiya_upazilla', name: 'Patiya Upazila', districtId: 'chittagong_dist' },
  // Sylhet District Upazillas
  { id: 'sylhet_sadar_upazilla', name: 'Sylhet Sadar Upazila', districtId: 'sylhet_dist' },
  // Rajshahi District Upazillas
  { id: 'rajshahi_sadar_upazilla', name: 'Rajshahi Sadar Upazila (Boalia)', districtId: 'rajshahi_dist' },
  // Khulna District Upazillas
  { id: 'khulna_sadar_upazilla', name: 'Khulna Sadar Upazila', districtId: 'khulna_dist' },
  // Barisal District Upazillas
  { id: 'barisal_sadar_upazilla', name: 'Barisal Sadar Upazila', districtId: 'barisal_dist' },
  // Rangpur District Upazillas
  { id: 'rangpur_sadar_upazilla', name: 'Rangpur Sadar Upazila', districtId: 'rangpur_dist' },
  // Mymensingh District Upazillas
  { id: 'mymensingh_sadar_upazilla', name: 'Mymensingh Sadar Upazila', districtId: 'mymensingh_dist' },
];


export const ADMIN_NAVIGATION: AdminNavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Approve Products', href: '/admin/products', icon: CheckSquare },
  {
    name: 'Products',
    href: '/admin/products/manage',
    icon: PackageIcon,
    subItems: [
      { name: 'Manage Products', href: '/admin/products/manage', icon: ListChecks },
      { name: 'Manage Categories', href: '/admin/products/categories', icon: FolderTree },
      { name: 'Manage Sub-Categories', href: '/admin/products/sub-categories', icon: FolderTree },
      { name: 'Manage Attributes', href: '/admin/products/attributes', icon: ListFilter },
      { name: 'Manage Attribute Values', href: '/admin/products/attribute-values', icon: TagsIcon },
      { name: 'Manage Brands (Legacy)', href: '/admin/products/brands', icon: TagsIcon },
    ]
  },
  {
    name: 'Orders',
    href: '/admin/orders/manage',
    icon: ShoppingCart,
    subItems: [
      { name: 'Manage Orders', href: '/admin/orders/manage', icon: SettingsIcon },
      { name: 'Processing Orders', href: '/admin/orders/processing', icon: PackageIcon },
      { name: 'Delivered Orders', href: '/admin/orders/delivered', icon: PackageCheck },
      { name: 'Cancelled Orders', href: '/admin/orders/cancelled', icon: PackageX },
    ]
  },
  {
    name: 'Location',
    href: '/admin/locations/countries',
    icon: Landmark, 
    subItems: [
      { name: 'Countries', href: '/admin/locations/countries', icon: Globe },
      { name: 'Divisions', href: '/admin/locations/divisions', icon: Library },
      { name: 'Districts', href: '/admin/locations/districts', icon: MapPin },
      { name: 'Upazillas', href: '/admin/locations/upazillas', icon: Home },
      { name: 'Delivery Charges', href: '/admin/locations/delivery-charges', icon: DollarSign },
      { name: 'Shipping Methods', href: '/admin/locations/shipping-methods', icon: Ship },
    ]
  },
  {
    name: 'Financials',
    href: '/admin/financials/withdrawal-requests',
    icon: PieChart,
    subItems: [
      { name: 'Withdrawal Requests', href: '/admin/financials/withdrawal-requests', icon: CreditCard },
      { name: 'Commissions', href: '/admin/financials/commissions', icon: Percent },
      { name: 'Cash in Hand', href: '/admin/financials/cash-in-hand', icon: Banknote },
    ]
  },
  {
    name: 'General Settings',
    href: '/admin/settings/business',
    icon: SettingsIcon,
    subItems: [
      { name: 'Business Settings', href: '/admin/settings/business', icon: Briefcase },
      { name: 'Banners (Sliders)', href: '/admin/settings/banners', icon: ImageIcon },
      { name: 'Custom Pages', href: '/admin/settings/custom-pages', icon: FileType },
      { name: 'Google Login', href: '/admin/settings/google-login', icon: LogIn },
    ]
  },
  { name: 'Manage Users', href: '/admin/users', icon: Users },
];


export const getStatusIcon = (status: OrderStatus) => {
  const statusObj = ORDER_STATUSES.find(s => s.value === status);
  return statusObj?.icon;
};

// Storage Keys
export const CATEGORIES_STORAGE_KEY = 'categories_v2'; // Added _v2 to potentially clear old structures
export const SUB_CATEGORIES_STORAGE_KEY = 'subCategories_v2';
export const CATEGORY_ATTRIBUTES_TYPES_STORAGE_KEY = 'categoryAttributeTypes_v2';
export const CATEGORY_ATTRIBUTE_VALUES_STORAGE_KEY = 'categoryAttributeValues_v2';
export const DELIVERY_CHARGES_STORAGE_KEY = 'deliveryChargeSettings';
export const COMMISSION_SETTINGS_STORAGE_KEY = 'commissionSettings';
export const BUSINESS_SETTINGS_STORAGE_KEY = 'businessSettings_v2';
export const HERO_BANNERS_STORAGE_KEY = 'heroBannerSlides_v2';
export const CUSTOM_PAGES_STORAGE_KEY = 'customPages_v2';
export const SHIPPING_METHODS_STORAGE_KEY = 'shippingMethods_v2';

// Default Values for Settings
export const DEFAULT_DELIVERY_CHARGES: DeliveryChargeSettings = {
  intraThana: 70, // Intra Upazilla
  intraDistrict: 110,
  interDistrict: 130,
};

export const DEFAULT_COMMISSION_SETTINGS: CommissionSetting[] = [];

export const DEFAULT_CURRENCIES: Currency[] = [
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
];

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  appName: '2ndhandbajar.com',
  logoUrl: '/logo-placeholder.png', 
  primaryColor: '217 91% 60%', 
  secondaryColor: '216 34% 90%', 
  faviconUrl: '/favicon.ico', 
  availableCurrencies: DEFAULT_CURRENCIES,
  defaultCurrencyCode: 'BDT',
  googleClientId: '',
  googleClientSecret: '',
};

export const DEFAULT_HERO_BANNER_SLIDES: HeroBannerSlide[] = [
  {
    id: 'slide1',
    imageUrl: 'https://placehold.co/1200x400/007bff/ffffff.png?text=Latest+Gadgets',
    imageHint: 'promotional electronics',
    title: 'Latest Gadgets on Sale!',
    description: 'Discover amazing deals on smartphones, laptops, and more.',
    buttonText: 'Shop Electronics',
    buttonLink: '/browse?categoryId=electronics',
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    isActive: true,
  },
  {
    id: 'slide2',
    imageUrl: 'https://placehold.co/1200x400/e83e8c/ffffff.png?text=Trendy+Fashion',
    imageHint: 'fashion sale',
    title: 'Trendy Fashion Finds',
    description: 'Upgrade your wardrobe with the latest styles.',
    buttonText: 'Explore Fashion',
    buttonLink: '/browse?categoryId=fashion',
    bgColor: 'bg-pink-500',
    textColor: 'text-white',
    isActive: true,
  },
  {
    id: 'slide3',
    imageUrl: 'https://placehold.co/1200x400/28a745/ffffff.png?text=Home+Decor',
    imageHint: 'home decor items',
    title: 'Home Decor Specials',
    description: 'Beautify your space with unique second-hand treasures.',
    buttonText: 'View Home Goods',
    buttonLink: '/browse?categoryId=home-garden',
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    isActive: true,
  },
];

export const MOCK_CUSTOM_PAGES: CustomPage[] = [
  {
    id: 'page-privacy',
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    content: '## Our Privacy Policy\n\nThis is a placeholder for the privacy policy content. Please replace this with your actual policy.\n\nWe collect information to provide better services to all our users.',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'page-terms',
    slug: 'terms-and-conditions',
    title: 'Terms and Conditions',
    content: '## Terms and Conditions\n\nWelcome to our website. If you continue to browse and use this website, you are agreeing to comply with and be bound by the following terms and conditions of use...',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
];

export const DEFAULT_SHIPPING_METHODS: ShippingMethod[] = [
  { id: 'standard-delivery', name: 'Standard Delivery' },
  { id: 'express-delivery', name: 'Express Delivery (Next Day)' },
];
