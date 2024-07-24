"use client";
import { ProgressContext } from "@/common/contexts";
import makeApiRequest from "@/common/make-api-request";
import { Shop, ShopStatus } from "@/common/models";
import { parseErrorResponse, validateResponse } from "@/common/utils";
import { withAuthorization } from "@/common/withAuthorization";
import Alert from "@/components/Alert";
import ConfirmModal from "@/components/ConfirmModal";
import Dropdown from "@/components/Dropdown";
import Loading from "@/components/Loading";
import { RiExternalLinkLine } from "@remixicon/react";
import Link from "next/link";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";
import ShopHeading from "./ShopHeading";
import ShopLicenses from "./shop-licenses";
import ShopMembers from "./shop-members";

const getShopById = async (shopId: number) => {
  const url = `/admin/shops/${shopId}`;
  const resp = await makeApiRequest({ url, authenticated: true });

  await validateResponse(resp, true);

  return resp
    .json()
    .then((json) => json as Shop)
    .catch((e) => undefined);
};

const approveShop = async (shopId: number) => {
  const url = `/admin/shops/${shopId}/approve`;
  const resp = await makeApiRequest({
    url,
    options: {
      method: "PUT"
    },
    authenticated: true
  });

  await validateResponse(resp);
};

const disableShop = async (shopId: number) => {
  const url = `/admin/shops/${shopId}/disable`;
  const resp = await makeApiRequest({
    url,
    options: {
      method: "PUT"
    },
    authenticated: true
  });

  await validateResponse(resp);
};

function ShopPage({ shopId }: { shopId: number }) {
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);
  const progressContext = useContext(ProgressContext);

  const { data, error, isLoading, mutate } = useSWR(
    `/admin/shops/${shopId}`,
    () => getShopById(shopId),
    {
      revalidateOnFocus: false,
      errorRetryCount: 1
    }
  );

  const statusView = (status?: ShopStatus) => {
    if (status === "APPROVED") {
      return <h6 className="mb-0 text-success fw-bold">{status}</h6>;
    }

    if (status === "PENDING") {
      return <h6 className="mb-0 text-warning fw-bold">{status}</h6>;
    }

    if (status === "DISABLED") {
      return <h6 className="mb-0 text-danger fw-bold">{status}</h6>;
    }

    return <></>;
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Alert message={parseErrorResponse(error)} variant="danger" />;
  }

  if (!data) {
    return <Alert message="Shop not found" variant="info" />;
  }

  const isExpired = (data.expiredAt ?? 0) < new Date().getTime();

  return (
    <>
      <div className="row mb-4 g-3 align-items-center">
        <div className="col-lg-6">
          <h3 className="fw-semibold mb-1">Shop Detail</h3>
          <nav aria-label="breadcrumb col-12">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item">
                <Link href="/admin" className="link-anchor">
                  Dashboard
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/admin/shops" className="link-anchor">
                  Shops
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {data.name}
              </li>
            </ol>
          </nav>
        </div>
        <div className="col-lg-6">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <Link
              href={`/shops/${data.slug}`}
              target={"_blank"}
              className="hstack gap-2 btn btn-default ms-lg-auto"
            >
              <span>View public</span>
              <RiExternalLinkLine size={20} />
            </Link>
            <Link
              href={`/admin/shops/${data.id}/products`}
              className="btn btn-default"
            >
              View products
            </Link>
            <Dropdown
              toggle={<span>Update</span>}
              className="align-self-center"
              toggleClassName="btn btn-primary dropdown-toggle"
              menuClassName="shadow"
            >
              {data.status !== "APPROVED" && (
                <li
                  role="button"
                  className="dropdown-item"
                  onClick={() => {
                    setConfirmApprove(true);
                  }}
                >
                  Approve
                </li>
              )}
              {data.status !== "DISABLED" && (
                <li
                  role="button"
                  className="dropdown-item"
                  onClick={() => {
                    setConfirmDisable(true);
                  }}
                >
                  Disable
                </li>
              )}
            </Dropdown>
          </div>
        </div>
      </div>

      {isExpired && <Alert message="This shop subscription is expired." variant="warning" />}

      <div className="position-relative border rounded bg-white vstack overflow-hidden mb-3">
        <ShopHeading shop={data} />
      </div>

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card mb-3">
            <div className="card-body">
              <dl className="row mb-0">
                <dt className="col-12">Status</dt>
                <dd className="col-12">{statusView(data.status)}</dd>

                <dt className="col-12">Phones</dt>
                <dd className="col-12">
                  <span className="text-muted">
                    {data.contact?.phones?.join(", ")}
                  </span>
                </dd>

                <dt className="col-12">Market</dt>
                <dd className="col-12">
                  <span className="text-muted">
                    {data.market?.name ?? "--"}
                  </span>
                </dd>

                <dt className="col-12">City</dt>
                <dd className="col-12">
                  <span className="text-muted">{data.city?.name ?? "--"}</span>
                </dd>

                <dt className="col-12">Address</dt>
                <dd className="col-12 mb-0">
                  <p className="text-muted mb-0">
                    {data.contact?.address ?? "--"}
                  </p>
                </dd>
              </dl>
            </div>
          </div>
          <div className="card">
            <div className="card-header py-3">
              <h5 className="mb-0">Members</h5>
            </div>
            <div className="card-body p-0">
              <ShopMembers shopId={shopId} />
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card mb-3">
            <div className="card-header py-3">
              <h5 className="mb-0">About</h5>
            </div>
            <div className="card-body">
              {!data.about && <span className="text-muted">No content</span>}
              <div dangerouslySetInnerHTML={{ __html: data.about ?? "" }}></div>
            </div>
          </div>

          <ShopLicenses shopId={shopId} />

          <div className="card mb-3">
            <div className="card-header py-3">
              <h5 className="mb-0">Legal information</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-lg-6">
                  <h6 className="fw-semibold mb-1">Owner Name</h6>
                  <div className="text-muted">
                    {data.legal?.ownerName ?? "--"}
                  </div>
                </div>
                <div className="col-lg-6">
                  <h6 className="fw-semibold mb-1">Seller Name</h6>
                  <div className="text-muted">
                    {data.legal?.sellerName ?? "--"}
                  </div>
                </div>
                <div className="col-12">
                  <h6 className="fw-semibold mb-1">Shop Number</h6>
                  <div className="text-muted">
                    {data.legal?.shopNumber ?? "--"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={confirmApprove}
        message={`Are you sure to approve ${data.name}?`}
        close={() => setConfirmApprove(false)}
        onConfirm={async (result) => {
          if (!result) {
            return;
          }
          try {
            if (!data.id) {
              throw Error();
            }
            progressContext.update(true);
            await approveShop(data.id);
            mutate();
            toast.success("Shop approved");
          } catch (error) {
            const msg = parseErrorResponse(error);
            toast.error(msg);
          } finally {
            setConfirmApprove(false);
            progressContext.update(false);
          }
        }}
      />

      <ConfirmModal
        show={confirmDisable}
        message={`Are you sure to disable ${data.name}?`}
        close={() => setConfirmDisable(false)}
        onConfirm={async (result) => {
          if (!result) {
            return;
          }
          try {
            if (!data.id) {
              throw Error();
            }
            progressContext.update(true);
            await disableShop(data.id);
            mutate();
            toast.success("Shop disabled");
          } catch (error) {
            const msg = parseErrorResponse(error);
            toast.error(msg);
          } finally {
            setConfirmDisable(false);
            progressContext.update(false);
          }
        }}
      />
    </>
  );
}

export default withAuthorization(ShopPage, ["SHOP_WRITE"]);
