export type CurrencyCode = "DOP";

export interface ProductCategory {
  id: string;
  code?: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  image?: string | null;
  order?: number;
}

export interface ProductImage {
  id: string;
  alt: string;
  src?: string;
  tone: "cool" | "fresh" | "warm" | "dark" | "clean";
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductFinancingRules {
  minimumTermMonths?: number | null;
  maximumTermMonths?: number | null;
  defaultTermMonths?: number | null;
  minimumDownPaymentPercent?: number | null;
  annualInterestRate?: number | null;
  administrativeFeePercent?: number | null;
  [key: string]: unknown;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;

  categoryId: string;
  categoryCode?: string;
  categoryName?: string;
  categorySlug?: string;

  brand: string;
  model: string;
  sku: string;

  price: number;
  salePrice?: number;
  currency: CurrencyCode;

  images: ProductImage[];
  features: string[];
  specifications: ProductSpecification[];

  stock: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isFinancingAvailable?: boolean;
  useGlobalFinancingCriteria?: boolean;

  financingTerms: {
    minimum: number;
    maximum: number;
    default: number;
  };

  effectiveFinancingCriteria?: {
    financingRules: ProductFinancingRules;
  };

  createdAt?: string;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  featuredOnly?: boolean;
  availableOnly?: boolean;
  sort?: "price-asc" | "price-desc" | "featured";
}
