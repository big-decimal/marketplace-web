"use client";
import { AuthenticationContext, ProgressContext } from "@/common/contexts";
import makeApiRequest from "@/common/makeApiRequest";
import { Market } from "@/common/models";
import {
  formatNumber,
  parseErrorResponse,
  validateResponse
} from "@/common/utils";
import { hasAccess, withAuthorization } from "@/common/withAuthorization";
import Alert from "@/components/Alert";
import ConfirmModal from "@/components/ConfirmModal";
import Loading from "@/components/Loading";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import { MarketQuery, getMarkets } from "@/services/MarketService";
import { RiDeleteBinLine, RiPencilFill } from "@remixicon/react";
import { useContext, useMemo, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";
import MarketEdit from "./market-edit";

const deleteMarket = async (id: number) => {
  const url = `/admin/markets/${id}`;
  const resp = await makeApiRequest({
    url,
    options: { method: "DELETE" },
    authenticated: true
  });
  await validateResponse(resp);
};

function MarketsPage() {
  const { user } = useContext(AuthenticationContext);

  const [showConfirm, setShowConfirm] = useState(false);

  const [showEdit, setShowEdit] = useState(false);

  const [query, setQuery] = useState<MarketQuery>({ limit: 10 });

  const [market, setMarket] = useState<Market>();

  const progressContext = useContext(ProgressContext);

  const { write, del } = useMemo(() => {
    return {
      write: hasAccess(["MARKET_WRITE"], user),
      del: hasAccess(["MARKET_WRITE"], user)
    };
  }, [user]);

  const { data, error, isLoading, mutate } = useSWR(
    ["/content/markets", query],
    ([url, q]) => getMarkets(q),
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

    if (!data || data.totalElements === 0) {
      return <Alert message="No markets found" variant="info" />;
    }

    return (
      <>
        <div className="table-responsive py-1 scrollbar-custom">
          <table className="table align-middle">
            <thead className="text-nowrap align-middle">
              <tr>
                <th scope="col" style={{ minWidth: 400 }}>
                  <div className="hstack gap-2">NAME</div>
                </th>
                <th scope="col" style={{ minWidth: 200 }}>
                  <div className="hstack gap-2">NO. OF SHOPS</div>
                </th>
                <th scope="col" style={{ minWidth: 200 }}>
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {data.contents.map((m, i) => {
                return (
                  <tr key={m.id}>
                    <th scope="row" className="w-100 py-3">
                      {m.name}
                    </th>
                    <td>{formatNumber(m.shopCount ?? 0)}</td>
                    <td>
                      <div className="hstack align-items-center gap-2">
                        {write && (
                          <button
                            className="btn btn-default"
                            onClick={() => {
                              setMarket(m);
                              setShowEdit(true);
                            }}
                          >
                            <RiPencilFill size={20} />
                          </button>
                        )}
                        {del && (
                          <button
                            className="btn btn-danger"
                            onClick={() => {
                              setMarket(m);
                              setShowConfirm(true);
                            }}
                          >
                            <RiDeleteBinLine size={20} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-end pt-3">
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
    <div>
      <div className="row mb-4">
        <div className="col-auto me-auto">
          <h2 className="mb-0">Markets</h2>
        </div>

        <div className="col-auto hstack">
          {write && (
            <button
              className="btn btn-primary align-self-center text-nowrap"
              onClick={() => {
                setMarket(undefined);
                setShowEdit(true);
              }}
            >
              Add new
            </button>
          )}
        </div>
      </div>

      {content()}

      <ConfirmModal
        show={showConfirm}
        message="Are you sure to delete?"
        onConfirm={async (result) => {
          try {
            if (!result || !market) {
              return;
            }

            progressContext.update(true);
            await deleteMarket(market.id);
            mutate();
            toast.success("Market deleted successfully");
          } catch (error) {
            const msg = parseErrorResponse(error);
            toast.error(msg);
          } finally {
            setMarket(undefined);
            progressContext.update(false);
          }
        }}
        close={() => {
          setShowConfirm(false);
        }}
      />

      <Modal
        id="editModal"
        show={showEdit}
        onHidden={() => setMarket(undefined)}
      >
        {(isShown) => {
          return isShown ? (
            <MarketEdit
              value={market}
              handleClose={(reload) => {
                setShowEdit(false);
                if (reload) {
                  mutate();
                }
              }}
            />
          ) : (
            <></>
          );
        }}
      </Modal>
    </div>
  );
}

export default withAuthorization(MarketsPage, ["MARKET_READ", "MARKET_WRITE"]);
