import { ShopLicense } from "@/common/models";
import { parseErrorResponse } from "@/common/utils";
import Alert from "@/components/Alert";
import Loading from "@/components/Loading";
import Modal from "@/components/Modal";
import { getShopLicenses } from "@/services/ShopService";
import { RiFullscreenLine } from "@remixicon/react";
import Image from "next/image";
import { useState } from "react";
import useSWR from "swr";

const ShopLicenses = ({ shopId }: { shopId: number }) => {
  const [shopLicense, setShopLicense] = useState<ShopLicense>();
  const [showFull, setShowFull] = useState(false);

  const { data, error, isLoading } = useSWR(
    `/vendor/shops/${shopId}/licenses`,
    () => getShopLicenses(shopId),
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

    return (
      <>
        <div className="d-flex flex-wrap gap-3">
          {data?.map((l, i) => {
            return (
              <div key={i} className="position-relative">
                <Image
                  src={l.image}
                  width={150}
                  height={150}
                  alt=""
                  style={{
                    objectFit: "contain"
                  }}
                  className="rounded border"
                />

                <div className="position-absolute top-0 end-0 m-2 d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-default"
                    onClick={() => {
                      setShopLicense(l);
                      setShowFull(true);
                    }}
                  >
                    <RiFullscreenLine size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <>
      <div className="card">
        <div className="card-header py-3">
          <h5 className="mb-0">Licenses</h5>
        </div>
        <div className="card-body">{content()}</div>
      </div>

      <Modal
        show={showFull}
        variant="large"
        onHidden={() => {
          setShopLicense(undefined);
        }}
      >
        {(isShown) => {
          return (
            <>
              <div className="modal-header">
                <h4 className="modal-title">Shop License</h4>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  aria-label="Close"
                  onClick={() => {
                    setShowFull(false);
                  }}
                ></button>
              </div>
              <div className="modal-body p-0">
                {shopLicense && (
                  <Image
                    src={shopLicense.image}
                    alt="Shop License"
                    sizes="100vw"
                    width={0}
                    height={0}
                    style={{
                      objectFit: "contain",
                      width: "100%",
                      height: "auto"
                    }}
                  />
                )}
              </div>
            </>
          );
        }}
      </Modal>
    </>
  );
};

export default ShopLicenses;
