"use client";
/* eslint-disable @next/next/no-img-element */
import makeApiRequest from "@/common/make-api-request";
import { Discount, PageData, Product, Shop } from "@/common/models";
import {
  buildQueryParams,
  formatNumber,
  parseErrorResponse,
  transformDiscount,
  validateResponse
} from "@/common/utils";
import { withAuthorization } from "@/common/withAuthorization";
import Alert from "@/components/Alert";
import Loading from "@/components/Loading";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

interface ProductQuery {
  q?: string;
  "category-id"?: number;
  "shop-id"?: number;
  featured?: boolean;
  discount?: boolean;
  page?: number;
}

const getShopById = async (shopId: number) => {
  const url = `/admin/shops/${shopId}`;
  const resp = await makeApiRequest({ url, authenticated: true });

  await validateResponse(resp, true);

  return resp
    .json()
    .then((json) => json as Shop)
    .catch((e) => undefined);
};

const getProducts = async (query: ProductQuery) => {
  const q = buildQueryParams({ ...query });
  const url = `/admin/products${q}`;
  const resp = await makeApiRequest({ url, authenticated: true });

  await validateResponse(resp);

  return resp.json() as Promise<PageData<Product>>;
};

const updateFeature = async (path: string, productId: number) => {
  const url = `/admin/products/${productId}/${path}`;
  const resp = await makeApiRequest({
    url,
    options: { method: "PUT" },
    authenticated: true
  });

  await validateResponse(resp);
};

const FeaturedCheck = ({
  product,
  mutate
}: {
  product: Product;
  mutate: () => void;
}) => {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <span
        className="spinner-border spinner-border-sm text-light-gray"
        role="status"
      ></span>
    );
  }

  return (
    <div className="form-check form-switch">
      <input
        className="form-check-input"
        type="checkbox"
        role="switch"
        checked={product.featured ?? false}
        onChange={(evt) => {
          const path = product.featured ? "remove-featured" : "make-featured";
          setLoading(true);
          updateFeature(path, product.id)
            .then(() => mutate())
            .catch((e) => {
              toast.error(parseErrorResponse(e));
            })
            .finally(() => {
              setLoading(false);
            });
        }}
      ></input>
    </div>
  );
};

function ShopProductsPage({ shopId }: { shopId: number }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState<ProductQuery>();

  const shopState = useSWR(
    `/admin/shops/${shopId}`,
    () => getShopById(shopId),
    {
      revalidateOnFocus: false
    }
  );

  const { data, error, isLoading, mutate } = useSWR(
    ["/admin/products", query],
    ([url, q]) => (q ? getProducts(q) : undefined),
    {
      revalidateOnFocus: false
    }
  );

  useEffect(() => {
    const page = searchParams.get("page");
    const featured = searchParams.get("featured");
    const discount = searchParams.get("discount");
    setQuery({
      "shop-id": shopId,
      featured: featured === "true" ? true : undefined,
      discount: discount === "true" ? true : undefined,
      page: page && !isNaN(parseInt(page)) ? parseInt(page) - 1 : undefined
    });
  }, [shopId, searchParams]);

  const discountView = (d?: Discount) => {
    if (d?.type === "PERCENTAGE") {
      return `${d.value} %`;
    }

    if (d?.type === "FIXED_AMOUNT") {
      return formatNumber(d.value ?? 0);
    }

    return "";
  };

  const priceView = (value: Product) => {
    if (value.discount) {
      return (
        <div className="vstack">
          <del className="text-muted small fw-normal me-1 text-truncate">
            {formatNumber(value.price ?? 0)}&nbsp;Ks
          </del>
          <span className="text-truncate">
            {formatNumber(transformDiscount(value.discount, value.price))}
            &nbsp;Ks
          </span>
        </div>
      );
    }

    return <>{formatNumber(value.price ?? 0)} Ks</>;
  };

  const content = () => {
    if (error) {
      return <Alert message={parseErrorResponse(error)} variant="danger" />;
    }

    if (!data || isLoading) {
      return <Loading />;
    }

    if (data.totalElements === 0) {
      return <Alert message="No products found" variant="info" />;
    }

    return (
      <>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="text-nowrap align-middle">
              <tr>
                <th scope="col" style={{ minWidth: 50 }}>
                  NO.
                </th>
                <th scope="col" style={{ minWidth: 100 }}>
                  IMAGE
                </th>
                <th scope="col" style={{ minWidth: 300 }}>
                  NAME
                </th>
                <th scope="col" style={{ minWidth: 200 }}>
                  PRICE
                </th>
                <th scope="col" style={{ minWidth: 150 }}>
                  CATEGORY
                </th>
                <th scope="col" style={{ minWidth: 150 }}>
                  DISCOUNT
                </th>
                <th scope="col" style={{ minWidth: 150 }}>
                  FEATURED
                </th>
              </tr>
            </thead>
            <tbody>
              {data.contents.map((p, i) => {
                return (
                  <tr key={p.id}>
                    <td>{i + 1 + data.currentPage * 10}</td>
                    <td className="py-3">
                      <img
                        className="rounded border"
                        src={p.thumbnail ?? "/images/placeholder.jpeg"}
                        alt="Product"
                        style={{ objectFit: "contain" }}
                        width={80}
                        height={80}
                      />
                    </td>
                    <th scope="row">
                      <Link href={`/products/${p.slug}`} className="text-dark">
                        {p.name}
                      </Link>
                    </th>
                    <td>{priceView(p)}</td>
                    <td>{p.category?.name ?? ""}</td>
                    <td className="text-danger">-{discountView(p.discount)}</td>
                    <td>
                      <FeaturedCheck product={p} mutate={mutate} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-end pt-4">
          <Pagination
            currentPage={data?.currentPage}
            totalPage={data?.totalPage}
            onChange={(p) => {
              const params = new URLSearchParams(searchParams.toString());

              if (p > 0) {
                params.set("page", `${p + 1}`);
              } else {
                params.delete("page");
              }

              if (params.size > 0) {
                router.push("?" + params.toString());
              } else {
                router.push(`/admin/shops/${shopId}/products`);
              }
            }}
          />
        </div>
      </>
    );
  };

  if (shopState.error) {
    return (
      <Alert message={parseErrorResponse(shopState.error)} variant="danger" />
    );
  }

  if (shopState.isLoading) {
    return <Loading />;
  }

  if (!shopState.data) {
    return <Alert message="Shop not found" variant="info" />;
  }

  const isExpired = (shopState.data.expiredAt ?? 0) < new Date().getTime();

  return (
    <>
      <div className="row g-3 mb-4">
        <div className="col-12 col-md">
          <h3 className="mb-1">{shopState.data.name}</h3>
          <nav aria-label="breadcrumb col-12">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item">
                <Link href="/admin/shops" className="link-anchor">
                  All Shops
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link href={`/admin/shops/${shopId}`} className="link-anchor">
                  {shopState.data.name}
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Products
              </li>
            </ol>
          </nav>
        </div>

        <div className="col-12 col-md-auto">
          <div className="d-flex flex-wrap align-items-center gap-3 h-100">
            <div className="form-check">
              <input
                id="featuredCheck"
                className="form-check-input"
                type="checkbox"
                checked={query?.featured ?? false}
                onChange={(evt) => {
                  const checked = evt.target.checked;
                  const params = new URLSearchParams(searchParams.toString());

                  if (checked) {
                    params.set("featured", "true");
                  } else {
                    params.delete("featured");
                  }

                  params.delete("page");

                  if (params.size > 0) {
                    router.push("?" + params.toString());
                  } else {
                    router.push(`/admin/shops/${shopId}/products`);
                  }
                }}
              ></input>
              <label
                htmlFor="featuredCheck"
                className="form-check-label fw-medium"
              >
                Featured
              </label>
            </div>
            <div className="form-check">
              <input
                id="discountCheck"
                className="form-check-input"
                type="checkbox"
                checked={query?.discount ?? false}
                onChange={(evt) => {
                  const checked = evt.target.checked;
                  const params = new URLSearchParams(searchParams.toString());

                  if (checked) {
                    params.set("discount", "true");
                  } else {
                    params.delete("discount");
                  }

                  params.delete("page");

                  if (params.size > 0) {
                    router.push("?" + params.toString());
                  } else {
                    router.push(`/admin/shops/${shopId}/products`);
                  }
                }}
              ></input>
              <label
                htmlFor="discountCheck"
                className="form-check-label fw-medium"
              >
                Discount
              </label>
            </div>
          </div>
        </div>
      </div>
      {isExpired && (
        <Alert message="This shop subscription is expired." variant="warning" />
      )}
      {content()}
    </>
  );
}

export default withAuthorization(ShopProductsPage, [
  "PRODUCT_READ",
  "PRODUCT_WRITE"
]);
