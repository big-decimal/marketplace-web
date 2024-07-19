"use client";

import { useMarket } from "@/common/hooks";
import makeApiRequest from "@/common/make-api-request";
import { Market, PageData, Shop } from "@/common/models";
import {
  formatTimestamp,
  parseErrorResponse,
  validateResponse
} from "@/common/utils";
import { withAuthorization } from "@/common/withAuthorization";
import Alert from "@/components/Alert";
import Loading from "@/components/Loading";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

const getShops = async (marketId: number, page: number) => {
  const url = `/admin/markets/${marketId}/shops?page=${page}`;
  const resp = await makeApiRequest({ url, authenticated: true });

  await validateResponse(resp);

  return resp.json() as Promise<PageData<Shop>>;
};

function MarketShopsPage({ marketId }: { marketId: number }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [page, setPage] = useState<number>();

  const marketState = useMarket(marketId);

  const { data, error, isLoading } = useSWR(
    [`/admin/market/${marketId}/shops`, page],
    ([url, p]) => (typeof p !== 'undefined' ? getShops(marketId, p) : undefined),
    {
      revalidateOnFocus: false
    }
  );

  useEffect(() => {
    const page = searchParams.get("page");
    setPage(page && !isNaN(parseInt(page)) ? parseInt(page) - 1 : 0);
  }, [searchParams]);

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
                  SHOP
                </th>
                <th scope="col" style={{ minWidth: 320 }}>
                  LEGAL
                </th>
                <th scope="col" style={{ minWidth: 150 }}>
                  CREATED AT
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
                    <td className="w-100">
                      <div className="vstack">
                        <div className="fw-medium mb-1">{s.name}</div>
                        <div className="text-muted">{s.headline}</div>
                      </div>
                    </td>
                    <td>
                      <div className="vstack small">
                        <div className="hstack">
                          <span className="fw-medium">Owner Name:</span>
                          <span className="text-muted ms-1">{s.legal?.ownerName ?? "--"}</span>
                        </div>
                        <div className="hstack">
                          <span className="fw-medium">Seller Name:</span>
                          <span className="text-muted ms-1">{s.legal?.sellerName ?? "--"}</span>
                        </div>
                        <div className="hstack">
                          <span className="fw-medium">Shop Number:</span>
                          <span className="text-muted ms-1">{s.legal?.shopNumber ?? "--"}</span>
                        </div>
                      </div>
                    </td>
                    <td>{formatTimestamp(s.audit?.createdAt)}</td>
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
                router.push("");
              }
            }}
          />
        </div>
      </>
    );
  };

  if (marketState.error) {
    return <Alert message={parseErrorResponse(marketState.error)} variant="danger" />;
  }

  if (marketState.isLoading) {
    return <Loading />;
  }

  if (!marketState.market) {
    return <Alert message="No market found" variant="info" />;
  }

  return (
    <>
      <div className="row mb-4 g-3">
        <div className="col-auto me-auto">
          <h3 className="fw-semibold mb-1">{marketState.market.name}</h3>
          <nav aria-label="breadcrumb col-12">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item">
                <Link href="/admin/markets" className="link-anchor">
                  Markets
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Shops
              </li>
            </ol>
          </nav>
        </div>
      </div>
      {content()}
    </>
  );
}

export default withAuthorization(MarketShopsPage, ["MARKET_READ"]);
