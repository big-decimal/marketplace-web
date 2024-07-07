"use client";

import { parseErrorResponse } from "@/common/utils";
import Alert from "@/components/Alert";
import Loading from "@/components/Loading";
import Pagination from "@/components/Pagination";
import { ShopGridItem } from "@/components/shop";
import { ShopQuery, findShops } from "@/services/ShopService";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";

export default function MarketShopsPage({ query }: { query: ShopQuery }) {
  const router = useRouter();
  const { slug } = useParams();

  const { data, error, isLoading } = useSWR(
    ["/shops", query],
    ([url, q]) => (q ? findShops(q) : undefined),
    {
      revalidateOnFocus: false
    }
  );

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Alert message={parseErrorResponse(error)} variant="danger" />;
  }

  if (!data || data.contents.length === 0) {
    return <Alert message="No shop found" />;
  }

  return (
    <>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xxxl-4 g-4">
        {data.contents.map((s, i) => {
          return (
            <div className="col" key={i}>
              <ShopGridItem value={s} />
            </div>
          );
        })}
      </div>

      <div className="d-flex justify-content-end pt-3 px-3">
        <Pagination
          currentPage={data?.currentPage}
          totalPage={data?.totalPage}
          onChange={(page) => {
            if (page > 0) {
              router.push(`/markets/${slug}?page=${page}`);
            } else {
              router.push(`/markets/${slug}`);
            }
          }}
        />
      </div>
    </>
  );
}
