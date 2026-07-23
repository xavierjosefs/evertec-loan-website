import {
  ArrowUpDown,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  Filter,
  PackageSearch,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import ProductCard from "../components/ProductCard";
import {
  getProductCatalogMeta,
  searchProducts,
} from "../services/productService";
import type { Product, ProductCategory } from "../types/product";
import { formatMoney } from "../utils/format";

const inputClassName = `
  mt-2 min-h-11 w-full rounded-xl border border-slate-200
  bg-white px-3.5 text-sm text-slate-900 outline-none
  transition-all duration-200 placeholder:text-slate-400
  hover:border-slate-300
  focus:border-brand-500 focus:ring-4 focus:ring-brand-100
`;

const selectClassName = `
  mt-2 min-h-11 w-full appearance-none rounded-xl
  border border-slate-200 bg-white px-3.5 pr-10
  text-sm text-slate-900 outline-none
  transition-all duration-200 hover:border-slate-300
  focus:border-brand-500 focus:ring-4 focus:ring-brand-100
`;

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceBounds, setPriceBounds] = useState({
    min: 0,
    max: 100000,
  });

  const filters = useMemo(
    () => ({
      search: searchParams.get("q") || "",
      categoryId: searchParams.get("categoria") || "",
      brand: searchParams.get("marca") || "",
      minPrice: Number(searchParams.get("precioMin") || priceBounds.min),
      maxPrice: Number(searchParams.get("precioMax") || priceBounds.max),
      featuredOnly: searchParams.get("destacados") === "true",
      availableOnly: searchParams.get("disponibles") === "true",
      sort: (searchParams.get("orden") || "featured") as
        | "featured"
        | "price-asc"
        | "price-desc",
    }),
    [priceBounds.max, priceBounds.min, searchParams],
  );

  const activeFilters = useMemo(() => {
    const items: Array<{
      key: string;
      label: string;
    }> = [];

    const search = searchParams.get("q");
    const categoryId = searchParams.get("categoria");
    const brand = searchParams.get("marca");
    const minPrice = searchParams.get("precioMin");
    const maxPrice = searchParams.get("precioMax");

    if (search) {
      items.push({
        key: "q",
        label: `Búsqueda: ${search}`,
      });
    }

    if (categoryId) {
      const category = categories.find((item) => item.id === categoryId);

      items.push({
        key: "categoria",
        label: category?.name ?? categoryId,
      });
    }

    if (brand) {
      items.push({
        key: "marca",
        label: brand,
      });
    }

    if (minPrice) {
      items.push({
        key: "precioMin",
        label: `Desde ${formatMoney(Number(minPrice))}`,
      });
    }

    if (maxPrice) {
      items.push({
        key: "precioMax",
        label: `Hasta ${formatMoney(Number(maxPrice))}`,
      });
    }

    if (filters.featuredOnly) {
      items.push({
        key: "destacados",
        label: "Solo destacados",
      });
    }

    if (filters.availableOnly) {
      items.push({
        key: "disponibles",
        label: "Solo disponibles",
      });
    }

    return items;
  }, [categories, filters.availableOnly, filters.featuredOnly, searchParams]);

  useEffect(() => {
    let mounted = true;

    getProductCatalogMeta()
      .then((meta) => {
        if (!mounted) {
          return;
        }

        setCategories(meta.categories);
        setBrands(meta.brands);
        setPriceBounds({
          min: meta.minPrice,
          max: meta.maxPrice,
        });
      })
      .catch(() => {
        if (mounted) {
          setLoadError(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setLoadError(false);

    searchProducts(filters)
      .then((result) => {
        if (!mounted) {
          return;
        }

        setProducts(result);
      })
      .catch(() => {
        if (mounted) {
          setLoadError(true);
          setProducts([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [filters]);

  useEffect(() => {
    if (!filtersOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFiltersOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [filtersOpen]);

  const updateParam = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);

    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const filterPanel = (
    <div className="space-y-6">
      <div className="relative">
        <label
          htmlFor="catalog-search"
          className="text-sm font-semibold text-slate-700"
        >
          Buscar productos
        </label>

        <div className="relative mt-2">
          <Search
            className="
              pointer-events-none absolute left-3.5 top-1/2
              h-4 w-4 -translate-y-1/2 text-slate-400
            "
            aria-hidden="true"
          />

          <input
            id="catalog-search"
            value={filters.search}
            onChange={(event) => updateParam("q", event.target.value)}
            placeholder="Nombre, marca o modelo"
            className="
              min-h-11 w-full rounded-xl border border-slate-200
              bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900
              outline-none transition-all duration-200
              placeholder:text-slate-400 hover:border-slate-300
              focus:border-brand-500 focus:ring-4
              focus:ring-brand-100
            "
          />

          {filters.search ? (
            <button
              type="button"
              onClick={() => updateParam("q")}
              className="
                absolute right-2.5 top-1/2 flex h-7 w-7
                -translate-y-1/2 items-center justify-center
                rounded-lg text-slate-400 transition-colors
                hover:bg-slate-100 hover:text-slate-700
              "
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      <div>
        <label
          htmlFor="catalog-category"
          className="text-sm font-semibold text-slate-700"
        >
          Categoría
        </label>

        <div className="relative">
          <select
            id="catalog-category"
            value={filters.categoryId}
            onChange={(event) => updateParam("categoria", event.target.value)}
            className={selectClassName}
          >
            <option value="">Todas las categorías</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <ChevronDown
            className="
              pointer-events-none absolute bottom-3.5 right-3.5
              h-4 w-4 text-slate-400
            "
            aria-hidden="true"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="catalog-brand"
          className="text-sm font-semibold text-slate-700"
        >
          Marca
        </label>

        <div className="relative">
          <select
            id="catalog-brand"
            value={filters.brand}
            onChange={(event) => updateParam("marca", event.target.value)}
            className={selectClassName}
          >
            <option value="">Todas las marcas</option>

            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <ChevronDown
            className="
              pointer-events-none absolute bottom-3.5 right-3.5
              h-4 w-4 text-slate-400
            "
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      <fieldset>
        <legend className="text-sm font-semibold text-slate-700">
          Rango de precio
        </legend>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-xs font-medium text-slate-500">
            Precio mínimo
            <input
              min={priceBounds.min}
              max={priceBounds.max}
              type="number"
              value={filters.minPrice}
              onChange={(event) => updateParam("precioMin", event.target.value)}
              className={inputClassName}
            />
          </label>

          <label className="text-xs font-medium text-slate-500">
            Precio máximo
            <input
              min={priceBounds.min}
              max={priceBounds.max}
              type="number"
              value={filters.maxPrice}
              onChange={(event) => updateParam("precioMax", event.target.value)}
              className={inputClassName}
            />
          </label>
        </div>

        <div
          className="
            mt-3 flex items-center justify-between rounded-xl
            bg-slate-50 px-3 py-2 text-[11px] font-medium
            text-slate-500
          "
        >
          <span>{formatMoney(priceBounds.min)}</span>
          <span className="mx-3 h-px flex-1 bg-slate-200" />
          <span>{formatMoney(priceBounds.max)}</span>
        </div>
      </fieldset>

      <div className="h-px bg-slate-100" />

      <fieldset className="space-y-3">
        <legend className="mb-3 text-sm font-semibold text-slate-700">
          Preferencias
        </legend>

        <label
          className="
            flex cursor-pointer items-center justify-between gap-4
            rounded-xl border border-slate-200 px-3.5 py-3
            transition-colors hover:border-brand-200
            hover:bg-brand-50/40
          "
        >
          <span className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
            <BadgeCheck
              className="h-4 w-4 text-violet-600"
              aria-hidden="true"
            />
            Solo destacados
          </span>

          <input
            checked={filters.featuredOnly}
            onChange={(event) =>
              updateParam(
                "destacados",
                event.target.checked ? "true" : undefined,
              )
            }
            type="checkbox"
            className="
              h-4 w-4 rounded border-slate-300
              accent-brand-600
            "
          />
        </label>

        <label
          className="
            flex cursor-pointer items-center justify-between gap-4
            rounded-xl border border-slate-200 px-3.5 py-3
            transition-colors hover:border-brand-200
            hover:bg-brand-50/40
          "
        >
          <span className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
            <CheckCircle2
              className="h-4 w-4 text-emerald-600"
              aria-hidden="true"
            />
            Solo disponibles
          </span>

          <input
            checked={filters.availableOnly}
            onChange={(event) =>
              updateParam(
                "disponibles",
                event.target.checked ? "true" : undefined,
              )
            }
            type="checkbox"
            className="
              h-4 w-4 rounded border-slate-300
              accent-brand-600
            "
          />
        </label>
      </fieldset>

      <div className="h-px bg-slate-100" />

      <div>
        <label
          htmlFor="catalog-sort"
          className="
            flex items-center gap-2 text-sm font-semibold
            text-slate-700
          "
        >
          <ArrowUpDown className="h-4 w-4 text-brand-600" aria-hidden="true" />
          Ordenar resultados
        </label>

        <div className="relative">
          <select
            id="catalog-sort"
            value={filters.sort}
            onChange={(event) => updateParam("orden", event.target.value)}
            className={selectClassName}
          >
            <option value="featured">Destacados primero</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
          </select>

          <ChevronDown
            className="
              pointer-events-none absolute bottom-3.5 right-3.5
              h-4 w-4 text-slate-400
            "
            aria-hidden="true"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={clearFilters}
        disabled={activeFilters.length === 0 && filters.sort === "featured"}
        className="
          inline-flex min-h-11 w-full items-center
          justify-center gap-2 rounded-xl
          border border-slate-200 bg-white px-4
          text-sm font-semibold text-slate-600
          transition-colors hover:border-rose-200
          hover:bg-rose-50 hover:text-rose-700
          disabled:cursor-not-allowed disabled:opacity-50
          disabled:hover:border-slate-200
          disabled:hover:bg-white disabled:hover:text-slate-600
        "
      >
        <X className="h-4 w-4" aria-hidden="true" />
        Limpiar filtros
      </button>
    </div>
  );

  return (
    <main className="min-h-[70vh] bg-slate-50 pb-16 lg:pb-24">
      <section
        className="
          border-b border-slate-200 bg-white
          bg-[radial-gradient(circle_at_top_right,rgba(219,234,254,0.85),transparent_42%)]
        "
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <span
            className="
              inline-flex items-center gap-2 rounded-full
              border border-brand-100 bg-brand-50 px-3 py-1.5
              text-xs font-semibold uppercase tracking-[0.14em]
              text-brand-700
            "
          >
            <PackageSearch className="h-3.5 w-3.5" aria-hidden="true" />
            Catálogo
          </span>

          <div
            className="
              mt-4 flex flex-col gap-6 lg:flex-row
              lg:items-end lg:justify-between
            "
          >
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Productos para tu hogar
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Explora nuestros electrodomésticos, compara opciones y consulta
                las cuotas disponibles antes de solicitar financiamiento.
              </p>
            </div>

            <div
              className="
                inline-flex w-fit items-center gap-3 rounded-2xl
                border border-brand-100 bg-brand-50/70 px-4 py-3
              "
            >
              <Sparkles className="h-5 w-5 text-brand-600" aria-hidden="true" />

              <div>
                <span className="block text-xs font-medium text-brand-600">
                  Catálogo disponible
                </span>

                <strong className="block text-sm text-brand-950">
                  Opciones con cuotas flexibles
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="
            mb-5 flex min-h-12 w-full items-center
            justify-between rounded-xl border border-slate-200
            bg-white px-4 text-sm font-semibold text-slate-700
            shadow-sm transition-colors hover:border-brand-200
            hover:text-brand-700 lg:hidden
          "
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
            Filtros y orden
          </span>

          {activeFilters.length > 0 ? (
            <span
              className="
                flex h-6 min-w-6 items-center justify-center
                rounded-full bg-brand-600 px-2 text-xs
                font-bold text-white
              "
            >
              {activeFilters.length}
            </span>
          ) : null}
        </button>

        {filtersOpen ? (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
              onClick={() => setFiltersOpen(false)}
              aria-label="Cerrar filtros"
            />

            <aside
              className="
                absolute bottom-0 right-0 top-0 w-full max-w-sm
                overflow-y-auto bg-white shadow-2xl
              "
              aria-label="Filtros de productos"
            >
              <div
                className="
                  sticky top-0 z-10 flex items-center
                  justify-between border-b border-slate-200
                  bg-white/95 px-5 py-4 backdrop-blur-lg
                "
              >
                <div className="flex items-center gap-2">
                  <Filter
                    className="h-5 w-5 text-brand-600"
                    aria-hidden="true"
                  />

                  <strong className="text-base text-slate-950">Filtros</strong>
                </div>

                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="
                    flex h-9 w-9 items-center justify-center
                    rounded-xl border border-slate-200
                    text-slate-500 transition-colors
                    hover:bg-slate-100 hover:text-slate-900
                  "
                  aria-label="Cerrar filtros"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="p-5">
                {filterPanel}

                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="
                    mt-3 inline-flex min-h-12 w-full
                    items-center justify-center rounded-xl
                    bg-brand-600 px-5 text-sm font-semibold
                    text-white transition-colors hover:bg-brand-700
                  "
                >
                  Ver {products.length}{" "}
                  {products.length === 1 ? "producto" : "productos"}
                </button>
              </div>
            </aside>
          </div>
        ) : null}

        <div
          className="
            grid items-start gap-7
            lg:grid-cols-[280px_minmax(0,1fr)]
            xl:grid-cols-[300px_minmax(0,1fr)]
            lg:gap-8
          "
        >
          <aside
            className="
              sticky top-24 hidden overflow-hidden rounded-3xl
              border border-slate-200 bg-white
              shadow-[0_20px_55px_-40px_rgba(15,23,42,0.35)]
              lg:block
            "
            aria-label="Filtros de productos"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
              <span
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-xl bg-brand-50 text-brand-600
                "
              >
                <Filter className="h-5 w-5" aria-hidden="true" />
              </span>

              <div>
                <strong className="block text-sm text-slate-950">
                  Filtrar productos
                </strong>

                <span className="text-xs text-slate-500">
                  Ajusta tu búsqueda
                </span>
              </div>
            </div>

            <div className="max-h-[calc(100vh-150px)] overflow-y-auto p-5">
              {filterPanel}
            </div>
          </aside>

          <section className="min-w-0" aria-label="Resultados del catálogo">
            <div
              className="
                mb-5 flex flex-col gap-4 rounded-2xl
                border border-slate-200 bg-white px-4 py-4
                sm:flex-row sm:items-center sm:justify-between
                sm:px-5
              "
            >
              <p className="text-sm text-slate-500" aria-live="polite">
                {loading ? (
                  "Buscando productos..."
                ) : (
                  <>
                    Mostrando{" "}
                    <strong className="font-semibold text-slate-900">
                      {products.length}
                    </strong>{" "}
                    {products.length === 1 ? "producto" : "productos"}
                  </>
                )}
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ArrowUpDown className="h-4 w-4" aria-hidden="true" />

                {filters.sort === "price-asc"
                  ? "Precio: menor a mayor"
                  : filters.sort === "price-desc"
                    ? "Precio: mayor a menor"
                    : "Destacados primero"}
              </div>
            </div>

            {activeFilters.length > 0 ? (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Filtros activos
                </span>

                {activeFilters.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => updateParam(filter.key)}
                    className="
                      inline-flex min-h-8 items-center gap-1.5
                      rounded-full border border-brand-100
                      bg-brand-50 px-3 text-xs font-medium
                      text-brand-700 transition-colors
                      hover:border-brand-200 hover:bg-brand-100
                    "
                  >
                    {filter.label}
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                ))}

                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    min-h-8 px-2 text-xs font-semibold
                    text-slate-500 transition-colors
                    hover:text-rose-700
                  "
                >
                  Limpiar todos
                </button>
              </div>
            ) : null}

            {loading ? (
              <LoadingState label="Buscando productos..." />
            ) : loadError ? (
              <EmptyState
                title="No pudimos cargar el catálogo"
                message="Ocurrió un inconveniente al consultar los productos. Intenta nuevamente más tarde."
                actionLabel="Volver al inicio"
                actionTo="/"
              />
            ) : products.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No encontramos productos"
                message="Prueba con otra búsqueda o elimina algunos filtros para consultar el catálogo completo."
                actionLabel="Limpiar filtros"
                actionTo="/productos"
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
