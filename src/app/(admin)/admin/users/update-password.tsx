import makeApiRequest from "@/common/make-api-request";
import { User } from "@/common/models";
import { parseErrorResponse, validateResponse } from "@/common/utils";
import ProgressButton from "@/components/ProgressButton";
import { PasswordInput } from "@/components/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

const schema = z
  .object({
    password: z.string().min(6, {
      message: "Password must be at least 6 characters"
    }),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

type ChangePasswordForm = z.infer<typeof schema>;

export default function UpdatePassword({
  user,
  close,
  onSuccess
}: {
  user: User;
  close?: () => void;
  onSuccess?: () => void;
}) {
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  const change = async (values: ChangePasswordForm) => {
    try {
      const url = `/admin/users/${user.id}/update-password?password=${values.password}`;
      const resp = await makeApiRequest({
        url,
        options: { method: "PUT" },
        authenticated: true
      });
      await validateResponse(resp);
      onSuccess?.();
      toast.success("Password updated");
      close?.();
    } catch (error) {
      toast.error(parseErrorResponse(error));
    }
  };

  return (
    <>
      <div className="modal-header">
        <h5 className="modal-title">
          Update <b>{user?.name}</b>&apos;s password
        </h5>
      </div>
      <div className="modal-body">
        <form className="row g-3">
          <div className="col-md-12">
            <PasswordInput
              label="New Password"
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
              {...register("password")}
              error={errors.password?.message}
            />
          </div>
          <div className="col-12">
            <PasswordInput
              label="Confirm Password"
              autoComplete="new-password"
              placeholder="Minimum 6 characters"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />
          </div>
        </form>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-default"
          disabled={isSubmitting}
          onClick={() => close?.()}
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
