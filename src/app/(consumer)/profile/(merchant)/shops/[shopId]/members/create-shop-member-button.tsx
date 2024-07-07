"use client";

import { parseErrorResponse } from "@/common/utils";
import Modal from "@/components/Modal";
import ProgressButton from "@/components/ProgressButton";
import { Input } from "@/components/forms";
import { createShopMember } from "@/services/ShopService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

const schema = z.object({
  shopId: z.number(),
  phone: z.string().regex(/^(09)\d{7,12}$/, "Please enter valid phone number")
});

type CreateMemberForm = z.infer<typeof schema>;

export default function CreateShopMemberButton({
  shopId,
  onSuccess
}: {
  shopId: number;
  onSuccess?: () => void;
}) {
  const [isShowCreate, setShowCreate] = useState(false);

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset
  } = useForm<CreateMemberForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      shopId: shopId
    }
  });

  const createMember = async (values: CreateMemberForm) => {
    try {
      await createShopMember(shopId, values.phone);
      setShowCreate(false);
      onSuccess?.();
      toast.success("Shop member added");
    } catch (error) {
      toast.error(parseErrorResponse(error));
    }
  };

  return (
    <>
      <button
        className="btn btn-primary py-2"
        onClick={() => {
          setShowCreate(true);
        }}
      >
        Add member
      </button>

      <Modal
        id="createMemberModal"
        show={isShowCreate}
        onHidden={() => {
          reset();
        }}
      >
        {(isShown) => {
          if (!isShown) {
            return <></>;
          }
          return (
            <>
              <div className="modal-header">
                <h5 className="modal-title">Add member</h5>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <Input
                      label="Phone number"
                      type="tel"
                      placeholder={`09xxxxxxx`}
                      error={errors.phone?.message}
                      {...register(`phone`)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-default"
                  disabled={isSubmitting}
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <ProgressButton
                  loading={isSubmitting}
                  onClick={() => {
                    handleSubmit(createMember)();
                  }}
                >
                  Add
                </ProgressButton>
              </div>
            </>
          );
        }}
      </Modal>
    </>
  );
}
