"use client";

import makeApiRequest from "@/common/make-api-request";
import { ShopMember } from "@/common/models";
import { parseErrorResponse, validateResponse } from "@/common/utils";
import Alert from "@/components/Alert";
import Loading from "@/components/Loading";
import { Fragment } from "react";
import useSWR from "swr";

const getShopMembers = async (shopId: number) => {
  const url = `/admin/shops/${shopId}/members`;

  const resp = await makeApiRequest({ url, authenticated: true });

  await validateResponse(resp);

  return resp.json() as Promise<ShopMember[]>;
}

export default function ShopMembers({ shopId }: { shopId: number }) {
  const { data, error, isLoading } = useSWR(
    `/admin/shops/${shopId}/members`,
    () => getShopMembers(shopId),
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

  if (!data || data.length === 0) {
    return <Alert message="No members found" />;
  }

  return (
    <div
      className="vstack scrollbar-custom p-3"
      style={{
        overflowY: "auto",
        maxHeight: 300
      }}
    >
      {data.map((m, i, ary) => {
        return (
          <Fragment key={i}>
            <div className="vstack">
              <div className="hstack align-items-baseline text-truncate">
                <span className="mb-1 fw-medium text-wrap">{m.member.name}</span>
                <div className="flex-grow-1"></div>
                <small className="ms-1 text-primary">{m.role}</small>
              </div>
              <small className="text-muted">{m.member.phone}</small>
            </div>
            {i < ary.length - 1 && <hr className="text-muted" />}
          </Fragment>
        );
      })}
    </div>
  );
}
