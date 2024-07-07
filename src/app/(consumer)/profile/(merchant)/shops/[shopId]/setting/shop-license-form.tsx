import { ProgressContext } from "@/common/contexts";
import { ShopLicense } from "@/common/models";
import { parseErrorResponse } from "@/common/utils";
import Alert from "@/components/Alert";
import ConfirmModal from "@/components/ConfirmModal";
import Loading from "@/components/Loading";
import Modal from "@/components/Modal";
import {
  deleteShopLicense,
  getShopLicenses,
  uploadShopLicense
} from "@/services/ShopService";
import { RiDeleteBin6Line, RiFullscreenLine } from "@remixicon/react";
import Image from "next/image";
import { ChangeEvent, useContext, useRef, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

const ShopLicenseForm = ({ shopId }: { shopId: number }) => {
  const progressContext = useContext(ProgressContext);

  const [shopLicense, setShopLicense] = useState<ShopLicense>();
  const [showFull, setShowFull] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const { data, error, isLoading, mutate } = useSWR(
    `/content/shops/${shopId}/licenses`,
    () => getShopLicenses(shopId),
    {
      revalidateOnFocus: false
    }
  );

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;

      if (files && files.length > 0) {
        let file = files[0];
        const fileSize = file.size / (1024 * 1024);

        if (fileSize > 1) {
          throw "File size must not greater than 1MB";
        }

        progressContext.update(true);

        await uploadShopLicense(shopId, file);
        mutate();
      }
    } catch (error) {
      const msg = parseErrorResponse(error);
      toast.error(msg);
    } finally {
      event.target.value = "";
      progressContext.update(false);
    }
  };

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
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      setShopLicense(l);
                      setDeleteConfirm(true);
                    }}
                  >
                    <RiDeleteBin6Line size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {(data?.length ?? 0) < 2 && (
          <button
            className="btn btn-primary mt-3"
            onClick={() => {
              fileRef.current?.click();
            }}
          >
            Upload
          </button>
        )}
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

      <input
        ref={fileRef}
        type="file"
        className="d-none"
        accept="image/x-png,image/jpeg"
        onChange={handleImageChange}
      />

      <ConfirmModal
        message="Are you sure to delete license?"
        show={deleteConfirm}
        close={() => {
          setShopLicense(undefined);
          setDeleteConfirm(false);
        }}
        onConfirm={async (result) => {
          if (!result || !shopLicense) {
            return;
          }
          try {
            progressContext.update(true);
            await deleteShopLicense(shopId, shopLicense.id);
            mutate();
            setShopLicense(undefined);
            setDeleteConfirm(false);
          } catch (error) {
            const msg = parseErrorResponse(error);
            toast.error(msg);
          } finally {
            progressContext.update(false);
          }
        }}
      />

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

export default ShopLicenseForm;
