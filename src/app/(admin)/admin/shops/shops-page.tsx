"use client";
import { useCities, useMarkets } from "@/common/hooks";
/* eslint-disable @next/next/no-img-element */
import makeApiRequest from "@/common/make-api-request";
import { City, Market, PageData, Shop, ShopStatus } from "@/common/models";
import {
  buildQueryParams,
  formatTimestamp,
  parseErrorResponse,
  validateResponse
} from "@/common/utils";
import { withAuthorization } from "@/common/withAuthorization";
import Alert from "@/components/Alert";
import Loading from "@/components/Loading";
import Pagination from "@/components/Pagination";
import { AutocompleteSelect, Input, Select } from "@/components/forms";
import { RiPencilFill } from "@remixicon/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

export interface ShopQuery {
  q?: string;
  "city-id"?: number;
  "market-id"?: number;
  "expire-before"?: number;
  status?: ShopStatus;
  expired?: boolean;
  featured?: boolean;
  page?: number;
}

const getShops = async (query: ShopQuery) => {
  const q = buildQueryParams({ ...query });
  const url = `/admin/shops${q}`;
  const resp = await makeApiRequest({ url, authenticated: true });

  await validateResponse(resp);

  return resp.json() as Promise<PageData<Shop>>;
};

const updateFeature = async (path: string, shopId: number) => {
  const url = `/admin/shops/${shopId}/${path}`;
  const resp = await makeApiRequest({
    url,
    options: { method: "PUT" },
    authenticated: true
  });

  await validateResponse(resp);
};

const FeaturedCheck = ({
  shop,
  mutate
}: {
  shop: Shop;
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
        checked={shop.featured ?? false}
        onChange={(evt) => {
          const path = shop.featured ? "remove-featured" : "make-featured";
          setLoading(true);
          updateFeature(path, shop.id)
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

function ShopsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState<ShopQuery>();

  const qInputRef = useRef<HTMLInputElement>(null);

  const { data, error, isLoading, mutate } = useSWR(
    ["/admin/shops", query],
    ([url, q]) => (q ? getShops(q) : undefined),
    {
      revalidateOnFocus: false
    }
  );

  useEffect(() => {
    const page = searchParams.get("page");
    const q = searchParams.get("q");
    const city = searchParams.get("city");
    const market = searchParams.get("market");
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");
    const expireBefore = searchParams.get("expire-before");
    setQuery({
      q: q ?? undefined,
      "city-id": city && !isNaN(parseInt(city)) ? parseInt(city) : undefined,
      "market-id":
        market && !isNaN(parseInt(market)) ? parseInt(market) : undefined,
      status: status?.match(/PENDING|APPROVED|DISABLED/)
        ? (status as ShopStatus)
        : undefined,
      featured: featured === "true" ? true : undefined,
      "expire-before":
        expireBefore && !isNaN(parseInt(expireBefore))
          ? parseInt(expireBefore)
          : undefined,
      page: page && !isNaN(parseInt(page)) ? parseInt(page) - 1 : undefined
    });
  }, [searchParams]);

  const citiesState = useCities();

  const marketsState = useMarkets();

  const statusView = (status?: ShopStatus) => {
    if (status === "APPROVED") {
      return <small className="fw-semibold text-success">{status}</small>;
    }

    if (status === "PENDING") {
      return <small className="fw-semibold text-warning">{status}</small>;
    }

    if (status === "DISABLED") {
      return <small className="fw-semibold text-danger">{status}</small>;
    }
    return <></>;
  };

  const content = () => {
    if (error) {
      return <Alert message={parseErrorResponse(error)} variant="danger" />;
    }

    if (!data || isLoading) {
      return <Loading />;
    }

    if (data.totalElements === 0) {
      return <Alert message="No shops found" variant="info" />;
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
                <th scope="col" style={{ minWidth: 120 }}>
                  STATUS
                </th>
                <th scope="col" style={{ minWidth: 150 }}>
                  EXPIRED AT
                </th>
                <th scope="col" style={{ minWidth: 150 }}>
                  CREATED AT
                </th>
                <th scope="col" style={{ minWidth: 100 }}>
                  Featured
                </th>
                <th scope="col" style={{ minWidth: 150 }}>
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {data.contents.map((s, i) => {
                return (
                  <tr key={s.id}>
                    <td>{i + 1 + data.currentPage * 10}</td>
                    <td className="py-3">
                      <img
                        className="rounded border"
                        src={s.logo ?? "/images/placeholder.jpeg"}
                        alt="Shop Logo"
                        style={{ objectFit: "contain" }}
                        width={80}
                        height={80}
                      />
                    </td>
                    <th scope="row">{s.name}</th>
                    <td>{statusView(s.status)}</td>
                    <td>
                      {(s?.expiredAt ?? 0) > 0
                        ? formatTimestamp(s?.expiredAt)
                        : "--"}
                    </td>
                    <td>{formatTimestamp(s.audit?.createdAt)}</td>
                    <td>
                      <FeaturedCheck shop={s} mutate={mutate} />
                    </td>
                    <td>
                      <Link
                        href={`/admin/shops/${s.id}`}
                        className="btn btn-default"
                      >
                        <RiPencilFill size={20} />
                      </Link>
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
                router.push("/admin/shops?" + params.toString());
              } else {
                router.push("/admin/shops");
              }
            }}
          />
        </div>
      </>
    );
  };

  return (
    <>
      <div className="row g-3 mb-3">
        <div className="col-12 col-md">
          <h2 className="mb-0">Shops</h2>
        </div>
      </div>
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-auto">
          <form
            onSubmit={(evt) => {
              evt.preventDefault();
              const params = new URLSearchParams(searchParams.toString());
              const q = qInputRef.current?.value;

              if (q) {
                params.set("q", q);
              } else {
                params.delete("q");
              }

              params.delete("page");

              if (params.size > 0) {
                router.push("/admin/shops?" + params.toString());
              } else {
                router.push("/admin/shops");
              }
            }}
          >
            <Input
              ref={qInputRef}
              name="q"
              type="search"
              placeholder="Search..."
              defaultValue={searchParams.get("q") ?? ""}
            />
          </form>
        </div>
        <div className="col-12 col-md-auto">
          <AutocompleteSelect<City, number>
            options={citiesState.cities?.sort((a, b) =>
              a.name.localeCompare(b.name)
            )}
            isLoading={citiesState.isLoading}
            placeholder="By city"
            getOptionKey={(c) => c.id}
            getOptionLabel={(c) => c.name}
            onChange={(c) => {
              const params = new URLSearchParams(searchParams.toString());

              if (c?.id) {
                params.set("city", c.id.toString());
              } else {
                params.delete("city");
              }

              params.delete("page");

              if (params.size > 0) {
                router.push("/admin/shops?" + params.toString());
              } else {
                router.push("/admin/shops");
              }
            }}
            isClearable
          />
        </div>
        <div className="col-12 col-md-auto">
          <AutocompleteSelect<Market, number>
            options={marketsState.markets?.sort((a, b) =>
              a.name.localeCompare(b.name)
            )}
            isLoading={marketsState.isLoading}
            placeholder="By market"
            getOptionKey={(m) => m.id}
            getOptionLabel={(m) => m.name}
            onChange={(m) => {
              const params = new URLSearchParams(searchParams.toString());

              if (m?.id) {
                params.set("market", m.id.toString());
              } else {
                params.delete("market");
              }

              params.delete("page");

              if (params.size > 0) {
                router.push("/admin/shops?" + params.toString());
              } else {
                router.push("/admin/shops");
              }
            }}
            isClearable
          />
        </div>
        <div className="col-12 col-md-auto">
          <Select
            value={query?.status}
            onChange={(evt) => {
              var status = evt.target.value;
              const params = new URLSearchParams(searchParams.toString());

              if (status) {
                params.set("status", status);
              } else {
                params.delete("status");
              }

              params.delete("page");

              if (params.size > 0) {
                router.push("/admin/shops?" + params.toString());
              } else {
                router.push("/admin/shops");
              }
            }}
          >
            <option value="">All status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="DISABLED">Disabled</option>
          </Select>
        </div>
        <div className="col-12 col-md-auto hstack">
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
                  router.push("/admin/shops?" + params.toString());
                } else {
                  router.push("/admin/shops");
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
        </div>
        <div className="col-12 col-md-auto hstack">
          <div className="form-check">
            <input
              id="expireBeforeCheck"
              className="form-check-input"
              type="checkbox"
              checked={(query?.["expire-before"] ?? 0) > 0}
              onChange={(evt) => {
                const checked = evt.target.checked;
                const params = new URLSearchParams(searchParams.toString());

                if (checked) {
                  params.set("expire-before", "7");
                } else {
                  params.delete("expire-before");
                }

                params.delete("page");

                if (params.size > 0) {
                  router.push("/admin/shops?" + params.toString());
                } else {
                  router.push("/admin/shops");
                }
              }}
            ></input>
            <label
              htmlFor="expireBeforeCheck"
              className="form-check-label fw-medium"
            >
              Expire within 7 days
            </label>
          </div>
        </div>
      </div>

      {content()}
    </>
  );
}

export default withAuthorization(ShopsPage, ["SHOP_READ", "SHOP_WRITE"]);
