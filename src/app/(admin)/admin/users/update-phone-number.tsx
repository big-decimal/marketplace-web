import makeApiRequest from "@/common/make-api-request";
import { User } from "@/common/models";
import { parseErrorResponse, validateResponse } from "@/common/utils";
import ProgressButton from "@/components/ProgressButton";
import { Input } from "@/components/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

const schema = z.object({
  phone: z.string().regex(/^(09)\d{7,12}$/, "Please enter valid phone number")
});

type ChangePhoneNumberForm = z.infer<typeof schema>;

export default function UpdatePhoneNumber({
  user,
  onSuccess,
  close,
}: {
  user: User;
  onSuccess?: () => void;
  close?: () => void;
}) {
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit
  } = useForm<ChangePhoneNumberForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: user.phone ?? ""
    }
  });

  const change = async (values: ChangePhoneNumberForm) => {
    try {
      const url = `/admin/users/${user.id}/update-phone-number?phone=${values.phone}`;
      const resp = await makeApiRequest({
        url,
        options: { method: "PUT" },
        authenticated: true
      });
      await validateResponse(resp);
      onSuccess?.();
      toast.success("Phone number updated");
      close?.();
    } catch (error) {
      toast.error(parseErrorResponse(error));
    }
  };

  return (
    <>
      <div className="modal-header">
        <h5 className="modal-title">
          Update <b>{user?.name}</b>&apos;s phone number
        </h5>
      </div>
      <div className="modal-body">
        <div className="row g-3">
          <div className="col-12">
            <Input
              label="Phone number"
              type="tel"
              placeholder={`09xxxxxxx`}
              {...register(`phone`)}
              error={errors.phone?.message}
            />
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-default"
          disabled={isSubmitting}
          onClick={close}
        >
          Cancel
        </button>
        <ProgressButton
          loading={isSubmitting}
          onClick={() => {
            handleSubmit(change)();
          }}
        >
          Update
        </ProgressButton>
      </div>
    </>
  );
}
