import Image from "next/image";
import Pagination from "../Pagination";
import Rating from "../Rating";
import useSWR from "swr";
import ShopReviewEdit from "./ShopReviewEdit";
import { PageData, ShopReview } from "../../common/models";
import { getReviews } from "../../services/ShopReviewService";
import Loading from "../Loading";
import { formatTimestamp, parseErrorResponse } from "../../common/utils";
import Alert from "../Alert";
import { useState } from "react";

interface ShopReviewProps {
  value: ShopReview;
}

function Review({ value }: ShopReviewProps) {
  return (
    <div className="list-group-item px-0 py-2h">
      <div className="hstack gap-3 align-items-start">
        <div className="position-relative flex-shrink-0">
          <Image
            src={value.reviewer?.image ?? "/images/profile.png"}
            width={60}
            height={60}
            alt=""
            className="rounded-circle"
            objectFit="cover"
          />
        </div>
        <div>
          <h6 className="mb-0">{value.reviewer?.name}</h6>
          <span className="text-muted small">
            {formatTimestamp(value.updatedAt ?? 0)}
          </span>
          <div className="mt-3">
            <Rating rating={value.rating ?? 0} />
          </div>
          <div className="text-muted fw-normal mt-2">{value.description}</div>
        </div>
      </div>
    </div>
  );
}

function ShopReviewListing({ shopId }: { shopId: number }) {
  const [page, setPage] = useState(0);
  const { data, error, isLoading } = useSWR(
    ["/shop-reviews", page],
    ([url, p]) => getReviews(shopId, "DESC", p),
    {
      revalidateOnFocus: false
    }
  );

  const content = () => {
    if (isLoading) {
      return <Loading />;
    }

    if (error) {
      return <Alert message={parseErrorResponse(error)} variant="danger" />;
    }

    if (data?.contents.length === 0) {
      return <Alert message="No reviews found" />;
    }

    return (
      <>
        <ul className="list-group list-group-flush">
          {data?.contents &&
            data?.contents.map((r, i) => <Review key={i} value={r} />)}
        </ul>
        {(data?.totalPage ?? 0) > 1 && (
          <div className="hstack justify-content-end mt-2">
            <div>
              <Pagination
                currentPage={data?.currentPage}
                totalPage={data?.totalPage}
                onChange={setPage}
              />
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div>
      <ShopReviewEdit />
      <div className="card shadow-sm">
        <div className="card-body">{content()}</div>
      </div>
    </div>
  );
}

export default ShopReviewListing;
