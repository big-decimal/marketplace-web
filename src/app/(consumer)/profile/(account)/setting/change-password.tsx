import { parseErrorResponse, setEmptyOrString } from "@/common/utils";
import ProgressButton from "@/components/ProgressButton";
import { PasswordInput } from "@/components/forms";
import { changePassword } from "@/services/AuthService";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface ChangePasswordForm {
  oldPassword?: string;
  newPassword?: string;
  confirmPassoword?: string;
}

export default function ChangePassword() {
  const {
    formState: { isSubmitting, errors },
    handleSubmit,
    register,
    reset
  } = useForm<ChangePasswordForm>();

  const executeChange = async (values: ChangePasswordForm) => {
    try {
      await changePassword({
        oldPassword: values.oldPassword!,
        newPassword: values.newPassword!
      });
      toast.success("Password changed");
      reset({
        oldPassword: "",
        newPassword: "",
        confirmPassoword: ""
      });
    } catch (error) {
      toast.error(parseErrorResponse(error));
    }
  };

  return (
    <form
      onSubmit={(evt) => {
        evt.preventDefault();
        handleSubmit(async (values) => {
          await executeChange(values);
        })();
      }}
    >
      <div className="row">
        <div className="order-2 order-md-2 col-lg-8">
          <div className="vstack">
            <div className="row g-3">
              <div className="col-12">
                <PasswordInput
                  label="Old password"
                  placeholder="Enter old password"
                  autoComplete="current-password"
                  {...register("oldPassword", {
                    required: "Please enter old password",
                    setValueAs: setEmptyOrString
                  })}
                  error={errors.oldPassword?.message}
                />
              </div>
              <div className="col-12">
                <PasswordInput
                  label="New password"
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  {...register("newPassword", {
                    required: true,
                    minLength: 8,
                    setValueAs: setEmptyOrString
                  })}
                  error={
                    errors.newPassword &&
                    "Password must be at least 8 charachers"
                  }
                />
              </div>
              <div className="col-12">
                <PasswordInput
                  label="Confirm password"
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  {...register("confirmPassoword", {
                    required: "Please re-enter new password",
                    setValueAs: setEmptyOrString,
                    validate: (v, fv) => {
                      if (v !== fv.newPassword) {
                        return "Password does not match";
                      }
                      return undefined;
                    }
                  })}
                  error={errors.confirmPassoword?.message}
                />
              </div>
            </div>
          </div>

          <div className="col order-3 mt-4 d-flex">
            <ProgressButton
              type="submit"
              className="flex-grow-1 flex-md-grow-0 px-3 py-2"
              loading={isSubmitting}
            >
              Change password
            </ProgressButton>
          </div>
        </div>
      </div>
    </form>
  );
}
