"use client";

import { useMarket } from "@/common/hooks";
import makeApiRequest from "@/common/make-api-request";
import { Market, PageData, Shop } from "@/common/models";
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
import ProgressButton from "@/components/ProgressButton";
import { Input } from "@/components/forms";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";
import * as XLSX from "xlsx";

export interface ShopQuery {
  q?: string;
  limit?: number;
  page?: number;
}

const getShops = async (marketId: number, query: ShopQuery) => {
  const params = buildQueryParams(query);
  const url = `/admin/markets/${marketId}/shops${params}`;
  const resp = await makeApiRequest({ url, authenticated: true });

  await validateResponse(resp);

  return resp.json() as Promise<PageData<Shop>>;
};

function MarketShopsPage({ marketId }: { marketId: number }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const qInputRef = useRef<HTMLInputElement>(null);

  const [exporting, setExporting] = useState(false);

  const [query, setQuery] = useState<ShopQuery>();

  const marketState = useMarket(marketId);

  const { data, error, isLoading } = useSWR(
    [`/admin/market/${marketId}/shops`, query],
    ([url, q]) => (q ? getShops(marketId, q) : undefined),
    {
      revalidateOnFocus: false
    }
  );

  useEffect(() => {
    const page = searchParams.get("page");
    const q = searchParams.get("q");
    setQuery({
      q: q ?? undefined,
      page: page && !isNaN(parseInt(page)) ? parseInt(page) - 1 : undefined
    });
  }, [searchParams]);

  const exportToExcel = async (market: Market) => {
    try {
      setExporting(true);
      const shops = await getShops(marketId, {});

      if (shops.contents.length <= 0) {
        return;
      }

      const rows = shops.contents.map((s) => {
        return {
          name: s.name,
          headline: s.headline,
          ownerName: s.legal?.ownerName ?? "--",
          sellerName: s.legal?.sellerName ?? "--",
          shopNumber: s.legal?.shopNumber ?? "--",
          createdAt: dayjs(s.audit?.createdAt ?? 0).format("YYYY-MM-DD"),
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "shops");
      XLSX.utils.sheet_add_aoa(
        worksheet,
        [
          [
            "Name",
            "Headline",
            "Owner Name",
            "Seller Name",
            "Shop No.",
            "Created At"
          ]
        ],
        { origin: "A1" }
      );

      const name_max_width = rows.reduce(
        (w, r) => Math.max(w, r.name?.length ?? 0),
        10
      );
      const headline_max_width = rows.reduce(
        (w, r) => Math.max(w, r.headline?.length ?? 0),
        10
      );
      worksheet["!cols"] = [
        { wch: name_max_width },
        { wch: headline_max_width },
        { wch: 20 },
        { wch: 20 },
        { wch: 10 },
        { wch: 10 },
      ];

      XLSX.writeFile(workbook, `${market.name}.xlsx`, { compression: true });

      toast.success("Excel exported!");
    } catch (error) {
      toast.error(parseErrorResponse(error));
    } finally {
      setExporting(false);
    }
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
                          <span className="text-muted ms-1">
                            {s.legal?.ownerName ?? "--"}
                          </span>
                        </div>
                        <div className="hstack">
                          <span className="fw-medium">Seller Name:</span>
                          <span className="text-muted ms-1">
                            {s.legal?.sellerName ?? "--"}
                          </span>
                        </div>
                        <div className="hstack">
                          <span className="fw-medium">Shop Number:</span>
                          <span className="text-muted ms-1">
                            {s.legal?.shopNumber ?? "--"}
                          </span>
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
                router.push(`/admin/markets/${marketId}/shops`);
              }
            }}
          />
        </div>
      </>
    );
  };

  if (marketState.error) {
    return (
      <Alert message={parseErrorResponse(marketState.error)} variant="danger" />
    );
  }

  if (marketState.isLoading) {
    return <Loading />;
  }

  if (!marketState.market) {
    return <Alert message="Market not found" variant="info" />;
  }

  return (
    <>
      <div className="row mb-4 g-3 align-items-center">
        <div className="col-12 col-md me-auto">
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
                router.push("?" + params.toString());
              } else {
                router.push(`/admin/markets/${marketId}/shops`);
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
          <ProgressButton
            loading={exporting}
            onClick={async () => {
              marketState.market && (await exportToExcel(marketState.market));
            }}
          >
            Excel export
          </ProgressButton>
        </div>
      </div>

      {content()}
    </>
  );
}

export default withAuthorization(MarketShopsPage, ["MARKET_READ"]);