import type {
  CurrencyCode,
  Product,
  ProductCategory,
  ProductFilters,
  ProductFinancingRules,
  ProductImage,
  ProductSpecification,
} from "../types/product";
import { apiRequest } from "./apiClient";

interface ApiCategory {
  _id?: string;
  id?: string;
  code?: string;
  slug?: string;
  name?: string;
  description?: string;
  icon?: string;
  image?: string | null;
  order?: number;
}

interface ApiProductCategoryRef {
  _id?: string;
  id?: string;
  code?: string;
  slug?: string;
  name?: string;
}

interface ApiProduct {
  _id?: string;
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;

  categoryRef?: ApiProductCategoryRef | string | null;
  categoryId?: string;
  categoryCode?: string;
  categoryName?: string;
  categorySlug?: string;

  brand?: string;
  model?: string;
  sku?: string;

  price?: number;
  salePrice?: number;
  currency?: CurrencyCode;

  images?: Array<
    | string
    | {
        src?: string;
        url?: string;
        Location?: string;
        secure_url?: string;
      }
  >;
  features?: string[];
  specifications?: ProductSpecification[];

  stock?: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
  isFinancingAvailable?: boolean;
  useGlobalFinancingCriteria?: boolean;

  financingTerms?: {
    minimum?: number;
    maximum?: number;
    default?: number;
  };

  effectiveFinancingCriteria?: {
    financingRules?: ProductFinancingRules;
  };

  createdAt?: string;
}

interface CategoriesResponse {
  categories?: ApiCategory[];
}

interface ProductsResponse {
  products?: ApiProduct[];
}

interface ProductResponse {
  product?: ApiProduct;
}

const slugify = (value: string) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toFiniteNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toPositiveInteger = (value: unknown): number | null => {
  const parsed = Math.trunc(Number(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const getComparablePrice = (product: Product) =>
  product.salePrice ?? product.price;

const normalizeImage = (
  image:
    | string
    | {
        src?: string;
        url?: string;
        Location?: string;
        secure_url?: string;
      },
  productName: string,
  index: number,
): ProductImage | null => {
  const src =
    typeof image === "string"
      ? image
      : image.src || image.url || image.Location || image.secure_url;

  if (!src || !String(src).trim()) return null;

  return {
    id: `${slugify(productName) || "producto"}-${index}`,
    alt: `${productName} imagen ${index + 1}`,
    src: String(src),
    tone: "clean",
  };
};

const normalizeCategory = (category: ApiCategory): ProductCategory | null => {
  const id = String(category.id || category._id || "").trim();
  const name = String(category.name || "").trim();

  if (!id || !name) return null;

  return {
    id,
    code: String(category.code || "").trim(),
    name,
    slug: String(category.slug || slugify(name)).trim(),
    description: String(category.description || "").trim(),
    icon: category.icon ? String(category.icon) : undefined,
    image: category.image || null,
    order: toFiniteNumber(category.order, 0),
  };
};

const normalizeFinancingTerms = (apiProduct: ApiProduct) => {
  const rules = apiProduct.effectiveFinancingCriteria?.financingRules || {};

  const minimum =
    toPositiveInteger(apiProduct.financingTerms?.minimum) ??
    toPositiveInteger(rules.minimumTermMonths);

  const maximum =
    toPositiveInteger(apiProduct.financingTerms?.maximum) ??
    toPositiveInteger(rules.maximumTermMonths);

  const defaultTerm =
    toPositiveInteger(apiProduct.financingTerms?.default) ??
    toPositiveInteger(rules.defaultTermMonths);

  if (!minimum || !maximum) {
    throw new Error(
      `El producto ${apiProduct.name || apiProduct.id || apiProduct._id || ""} no tiene un rango de financiamiento válido.`,
    );
  }

  const normalizedMaximum = Math.max(minimum, maximum);
  const normalizedDefault = Math.min(
    normalizedMaximum,
    Math.max(minimum, defaultTerm || minimum),
  );

  return {
    minimum,
    maximum: normalizedMaximum,
    default: normalizedDefault,
  };
};

const normalizeProduct = (apiProduct: ApiProduct): Product => {
  const id = String(apiProduct.id || apiProduct._id || "").trim();
  const name = String(apiProduct.name || "").trim();

  if (!id) {
    throw new Error("La API devolvió un producto sin identificador.");
  }

  if (!name) {
    throw new Error(`La API devolvió el producto ${id} sin nombre.`);
  }

  const categoryDocument =
    apiProduct.categoryRef && typeof apiProduct.categoryRef === "object"
      ? apiProduct.categoryRef
      : null;

  const categoryId = String(
    apiProduct.categoryId ||
      categoryDocument?.id ||
      categoryDocument?._id ||
      "",
  ).trim();

  const categoryCode = String(
    apiProduct.categoryCode || categoryDocument?.code || "",
  ).trim();

  const categoryName = String(
    apiProduct.categoryName || categoryDocument?.name || "",
  ).trim();

  const categorySlug = String(
    apiProduct.categorySlug ||
      categoryDocument?.slug ||
      slugify(categoryName || categoryCode),
  ).trim();

  const normalizedImages = Array.isArray(apiProduct.images)
    ? apiProduct.images
        .map((image, index) => normalizeImage(image, name, index))
        .filter((image): image is ProductImage => Boolean(image))
    : [];

  const price = toFiniteNumber(apiProduct.price ?? apiProduct.salePrice, 0);
  const salePrice =
    apiProduct.salePrice !== undefined
      ? toFiniteNumber(apiProduct.salePrice, 0)
      : undefined;

  return {
    id,
    name,
    slug: String(apiProduct.slug || id).trim(),
    description: String(
      apiProduct.description || apiProduct.shortDescription || "",
    ).trim(),
    shortDescription: String(
      apiProduct.shortDescription || apiProduct.description || "",
    ).trim(),

    categoryId,
    categoryCode,
    categoryName,
    categorySlug,

    brand: String(apiProduct.brand || "").trim(),
    model: String(apiProduct.model || "").trim(),
    sku: String(apiProduct.sku || "").trim(),

    price,
    salePrice,
    currency: apiProduct.currency || "DOP",

    images: normalizedImages,
    features: Array.isArray(apiProduct.features)
      ? apiProduct.features.filter(Boolean).map(String)
      : [],
    specifications: Array.isArray(apiProduct.specifications)
      ? apiProduct.specifications.filter(
          (item) => Boolean(item?.label) && Boolean(item?.value),
        )
      : [],

    stock: Math.max(0, toFiniteNumber(apiProduct.stock, 0)),
    isAvailable: Boolean(apiProduct.isAvailable),
    isFeatured: Boolean(apiProduct.isFeatured),
    isFinancingAvailable: Boolean(apiProduct.isFinancingAvailable),
    useGlobalFinancingCriteria: apiProduct.useGlobalFinancingCriteria !== false,

    financingTerms: normalizeFinancingTerms(apiProduct),
    effectiveFinancingCriteria: {
      financingRules: {
        minimumDownPaymentPercent:
          apiProduct.effectiveFinancingCriteria?.financingRules
            ?.minimumDownPaymentPercent ?? null,
        annualInterestRate:
          apiProduct.effectiveFinancingCriteria?.financingRules
            ?.annualInterestRate ?? null,
        minimumTermMonths:
          apiProduct.effectiveFinancingCriteria?.financingRules
            ?.minimumTermMonths ?? null,
        maximumTermMonths:
          apiProduct.effectiveFinancingCriteria?.financingRules
            ?.maximumTermMonths ?? null,
        defaultTermMonths:
          apiProduct.effectiveFinancingCriteria?.financingRules
            ?.defaultTermMonths ?? null,
        administrativeFeePercent:
          apiProduct.effectiveFinancingCriteria?.financingRules
            ?.administrativeFeePercent ?? null,
      },
    },

    createdAt: apiProduct.createdAt,
  };
};

export async function getCategories(): Promise<ProductCategory[]> {
  const response = await apiRequest<CategoriesResponse>("/products/categories");

  if (!Array.isArray(response.categories)) {
    throw new Error("La API no devolvió una lista válida de categorías.");
  }

  return response.categories
    .map(normalizeCategory)
    .filter((category): category is ProductCategory => Boolean(category))
    .sort(
      (a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name),
    );
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return searchProducts({ featuredOnly: true, availableOnly: true });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const normalizedSlug = String(slug || "").trim();
  if (!normalizedSlug) return null;

  const response = await apiRequest<ProductResponse>(
    `/products/${encodeURIComponent(normalizedSlug)}`,
  );

  if (!response.product) {
    throw new Error("La API no devolvió la información del producto.");
  }

  return normalizeProduct(response.product);
}

export async function getProductById(id: string): Promise<Product | null> {
  const normalizedId = String(id || "").trim();

  if (!normalizedId) {
    return null;
  }

  const response = await apiRequest<ProductResponse>(
    `/products/${encodeURIComponent(normalizedId)}`,
  );

  if (!response.product) {
    throw new Error("La API no devolvió la información del producto.");
  }

  return normalizeProduct(response.product);
}

export async function searchProducts(
  filters: ProductFilters = {},
): Promise<Product[]> {
  const params = new URLSearchParams();

  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.categoryId?.trim()) {
    params.set("categoryId", filters.categoryId.trim());
  }
  if (filters.brand?.trim()) params.set("brand", filters.brand.trim());
  if (filters.minPrice !== undefined) {
    params.set("minPrice", String(filters.minPrice));
  }
  if (filters.maxPrice !== undefined) {
    params.set("maxPrice", String(filters.maxPrice));
  }
  if (filters.featuredOnly) params.set("featuredOnly", "true");
  if (filters.availableOnly) params.set("availableOnly", "true");

  params.set("limit", "100");

  const response = await apiRequest<ProductsResponse>(
    `/products?${params.toString()}`,
  );

  if (!Array.isArray(response.products)) {
    throw new Error("La API no devolvió una lista válida de productos.");
  }

  let result = response.products.map(normalizeProduct);

  if (filters.availableOnly) {
    result = result.filter((product) => product.isAvailable);
  }

  if (filters.sort === "price-asc") {
    result = [...result].sort(
      (a, b) => getComparablePrice(a) - getComparablePrice(b),
    );
  }

  if (filters.sort === "price-desc") {
    result = [...result].sort(
      (a, b) => getComparablePrice(b) - getComparablePrice(a),
    );
  }

  if (filters.sort === "featured") {
    result = [...result].sort(
      (a, b) => Number(b.isFeatured) - Number(a.isFeatured),
    );
  }

  return result;
}

export async function getProductCatalogMeta() {
  const [categories, products] = await Promise.all([
    getCategories(),
    searchProducts(),
  ]);

  const brands = Array.from(
    new Set(products.map((product) => product.brand).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));

  const prices = products
    .map(getComparablePrice)
    .filter((price) => Number.isFinite(price) && price > 0);

  return {
    categories,
    brands,
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
  };
}

export async function getCategoryName(categoryId: string) {
  const categories = await getCategories();

  return (
    categories.find((category) => category.id === categoryId)?.name ||
    "Sin categoría"
  );
}
