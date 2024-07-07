"use client";

import { ProgressContext } from "@/common/contexts";
import { ShopMember } from "@/common/models";
import { formatTimestamp, parseErrorResponse } from "@/common/utils";
import Alert from "@/components/Alert";
import ConfirmModal from "@/components/ConfirmModal";
import Loading from "@/components/Loading";
import { deleteShopMember, getShopMembers } from "@/services/ShopService";
import { RiDeleteBinLine } from "@remixicon/react";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";
import CreateShopMemberButton from "./create-shop-member-button";

export default function ShopMembersPage({ shopId }: { shopId: number }) {
  const [member, setMember] = useState<ShopMember>();
  const [isShowDelete, setShowDelete] = useState(false);

  const progressContext = useContext(ProgressContext);

  const { data, error, isLoading, mutate } = useSWR(
    `/vendor/shops/${shopId}/members`,
    () => getShopMembers(shopId),
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

    if (!data || data.length === 0) {
      return <Alert message="No members found" />;
    }

    return (
      <>
        <div className="table-responsive bg-white rounded border">
          <table className="table align-middle mb-0">
            <thead className="text-nowrap align-middle">
              <tr>
                <th scope="col" style={{ minWidth: 200 }}>
                  MEMBER
                </th>
                <th scope="col" style={{ minWidth: 120 }}>
                  ROLE
                </th>
                <th scope="col" style={{ minWidth: 150 }}>
                  CREATED AT
                </th>
                <th scope="col" style={{ minWidth: 150 }}>
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="text-nowrap">
              {data.map((m, i) => {
                return (
                  <tr key={i}>
                    <td className="w-100 py-2">
                      <div className="vstack">
                        <span className="mb-1 fw-medium">{m.member.name}</span>
                        <small className="text-muted">{m.member.phone}</small>
                      </div>
                    </td>
                    <td>{m.role}</td>
                    <td>{formatTimestamp(m.audit?.createdAt)}</td>
                    <td>
                      {m.role !== "OWNER" && (
                        <div className="hstack align-items-center gap-2">
                          <button
                            disabled={false}
                            className="btn btn-danger"
                            onClick={() => {
                              setMember(m);
                              setShowDelete(true);
                            }}
                          >
                            <RiDeleteBinLine size={20} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* <div className="d-flex justify-content-end p-3 pt-0">
              <Pagination
                currentPage={data?.currentPage}
                totalPage={data?.totalPage}
                onChange={setPage}
              />
            </div> */}
      </>
    );
  };

  return (
    <>
      <div className="hstack mb-3">
        <div className="flex-grow-1"></div>
        <CreateShopMemberButton shopId={shopId} onSuccess={mutate} />
      </div>
      {content()}

      <ConfirmModal
        show={isShowDelete}
        message={<span>Are you sure to remove <b>{member?.member.name}</b>?</span>}
        onHidden={() => setMember(undefined)}
        onConfirm={async (result) => {
          try {
            if (!result) {
              return;
            }
            progressContext.update(true);
            member && (await deleteShopMember(shopId, member.member.id));
            mutate();
          } catch (error) {
            const msg = parseErrorResponse(error);
            toast.error(msg);
          } finally {
            setMember(undefined);
            progressContext.update(false);
          }
        }}
        close={() => {
          setShowDelete(false);
        }}
      />
    </>
  );
}
