import { Shop, ShopLegal } from "@/common/models";
import { parseErrorResponse } from "@/common/utils";
import ProgressButton from "@/components/ProgressButton";
import { Input } from "@/components/forms";
import { updateShopLegal } from "@/services/ShopService";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useSWRConfig } from "swr";

const ShopLegalForm = ({ shop }: { shop: Shop }) => {
  const { mutate } = useSWRConfig();

  const {
    control,
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<ShopLegal>({
    values: {
      ownerName: shop.legal?.ownerName,
      sellerName: shop.legal?.sellerName,
      shopNumber: shop.legal?.shopNumber
    }
  });

  const executeUpdate = async (values: ShopLegal) => {
    try {
      await updateShopLegal(shop.id, values);
      mutate<Shop>(`/vendor/shops/${shop.id}`);
      toast.success("Update success");
    } catch (error) {
      const msg = parseErrorResponse(error);
      toast.error(msg);
    }
  };

  return (
    <div className="card">
      <div className="card-header py-3">
        <h5 className="mb-0">Legal information</h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-lg-6">
            <Input
              label="Owner name"
              placeholder="Enter owner name"
              {...register("ownerName")}
            />
          </div>
          <div className="col-lg-6">
            <Input
              label="Seller name"
              placeholder="Enter seller name"
              {...register("sellerName")}
            />
          </div>
          <div className="col-12">
            <Input
              label="Shop number"
              placeholder="Enter shop number"
              {...register("shopNumber")}
            />
          </div>
        </div>
      </div>
      <div className="card-footer border-top-0 py-2h">
        <ProgressButton
          loading={isSubmitting}
          onClick={() => {
            handleSubmit(async (data) => {
              await executeUpdate(data);
            })();
          }}
        >
          Update
        </ProgressButton>
      </div>
    </div>
  );
};

export default ShopLegalForm;
