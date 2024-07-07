"use client";
import { useCities, useMarkets } from "@/common/hooks";
/* eslint-disable @next/next/no-img-element */
import makeApiRequest from "@/common/make-api-request";
import { City, Market, PageData, Shop, ShopStatus } from "@/common/models";
import {
  buildQueryParams,
  debounce,
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
import { useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

export interface ShopQuery {
  q?: string;
  "city-id"?: number;
  "market-id"?: number;
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
  const [query, setQuery] = useState<ShopQuery>({});

  const { data, error, isLoading, mutate } = useSWR(
    ["/admin/shops", query],
    ([url, q]) => getShops(q),
    {
      revalidateOnFocus: false
    }
  );

  const citiesState = useCities();

  const marketsState = useMarkets();

  const updateInput = debounce((v) => {
    setQuery((old) => {
      return {
        ...old,
        page: undefined,
        q: !v ? undefined : v
      };
    });
  }, 800);

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
    if (isLoading) {
      return <Loading />;
    }

    if (error) {
      return <Alert message={parseErrorResponse(error)} variant="danger" />;
    }

    if (data?.totalElements === 0) {
      return <Alert message="No shops found" variant="info" />;
    }

    return (
      <>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="text-nowrap align-middle">
              <tr>
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
              {data?.contents?.map((s, i) => {
                return (
                  <tr key={s.id}>
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
              setQuery((old) => {
                return { ...old, page: p };
              });
            }}
          />
        </div>
      </>
    );
  };

  return (
    <>
      <div className="row g-3 mb-4">
        <div className="col-12 col-md">
          <h2 className="mb-0">Shops</h2>
        </div>

        <div className="col-12 col-md-auto">
          <Input
            id="searchInput"
            name="q"
            type="search"
            placeholder="Search..."
            onChange={(evt) => {
              var q = evt.target.value;
              updateInput(q);
            }}
          />
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
              setQuery((old) => {
                return {
                  ...old,
                  "city-id": c?.id,
                  page: undefined
                };
              });
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
              setQuery((old) => {
                return {
                  ...old,
                  "market-id": m?.id,
                  page: undefined
                };
              });
            }}
            isClearable
          />
        </div>
        <div className="col-12 col-md-auto">
          <Select
            value={query.status}
            onChange={(evt) => {
              var status = evt.target.value;
              setQuery((old) => {
                return {
                  ...old,
                  page: undefined,
                  status: !status ? undefined : (status as ShopStatus)
                };
              });
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
              checked={query.featured ?? false}
              onChange={(evt) => {
                setQuery((old) => {
                  return { ...old, featured: evt.target.checked };
                });
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
      </div>

      {content()}
    </>
  );
}

export default withAuthorization(ShopsPage, ["SHOP_READ", "SHOP_WRITE"]);
