"use client";
import { AuthenticationContext } from "@/common/contexts";
import { parseErrorResponse } from "@/common/utils";
import Alert from "@/components/Alert";
import ProgressButton from "@/components/ProgressButton";
import { Input, PasswordInput } from "@/components/forms";
import { existsUser, requestOTP, resetPassword } from "@/lib/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

const schema = z
  .object({
    password: z.string().min(6, {
      message: "Password must be at least 6 characters"
    }),
    confirmPassword: z.string(),
    code: z.string().min(1, {
      message: "Please enter otp code"
    })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

type ResetPasswordForm = z.infer<typeof schema>;

function ForgotPasswordPage() {
  const { status } = useContext(AuthenticationContext);
  const router = useRouter();

  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState<string>();
  const [requestId, setRequestId] = useState(0);
  const [resend, setResend] = useState(true);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (resend) {
      return;
    }

    setTimer(30);

    const interval = setInterval(() => {
      setTimer((old) => {
        if (old > 1) {
          return old - 1;
        }

        setResend(true);

        return 0;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [resend]);

  const {
    formState: { isSubmitting, errors },
    handleSubmit,
    register,
    reset
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      code: ""
    }
  });

  useEffect(() => {
    if (status === "success") {
      router.push("/");
    }
  }, [router, status]);

  const content = () => {
    if (!userExists) {
      return (
        <div className="row g-3">
          <div className="col-md-12">
            <Input
              label="Phone number"
              id="phoneInput"
              type="tel"
              autoComplete="username"
              placeholder="09xxxxxxx"
              value={phone ?? ""}
              onChange={(evt) => setPhone(evt.target.value)}
            />
          </div>
          <div className="col-md-12 mt-4">
            <ProgressButton
              className="w-100 py-2h"
              disabled={loading || !phone}
              loading={loading}
              onClick={async () => {
                try {
                  setLoading(true);
                  setError(undefined);
                  const result = await existsUser(phone ?? "");
                  if (!result) {
                    throw "User not found";
                  }
                  setUserExists(result);
                } catch (error) {
                  setError(parseErrorResponse(error));
                } finally {
                  setLoading(false);
                }
              }}
            >
              Continue
            </ProgressButton>
          </div>
        </div>
      );
    }

    return (
      <form
        className="row g-3"
        onSubmit={(evt) => {
          evt.preventDefault();
          handleSubmit(async (values) => {
            try {
              setError(undefined);
              setSuccess(false);
              await resetPassword({
                phone: phone,
                password: values.password,
                code: values.code,
                requestId: requestId
              });
              setSuccess(true);
            } catch (error) {
              setError(parseErrorResponse(error));
            }
          })();
        }}
      >
        <div className="col-12">
          <label className="form-label">OTP code</label>
          <div className="hstack gap-2 align-items-stretch">
            <Input
              id="otpInput"
              type="text"
              inputMode="numeric"
              placeholder="Enter otp code"
              maxLength={6}
              {...register("code")}
              error={errors.code?.message}
              hideErrorMessage
            />
            <button
              className="btn btn-primary text-nowrap"
              disabled={!resend}
              onClick={async () => {
                try {
                  setResend(false);
                  const result = await requestOTP(phone ?? "");
                  setRequestId(result.requestId);
                } catch (error) {
                  toast.error(parseErrorResponse(error));
                }
              }}
            >
              Get OTP
              {timer > 0 && <span className="ms-1">({timer})</span>}
            </button>
          </div>
          {errors.code?.message && (
            <div className="text-danger small mt-1">{errors.code.message}</div>
          )}
        </div>
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
        <div className="col-md-12 mt-4">
          <ProgressButton
            type="submit"
            className="w-100 py-2h"
            disabled={isSubmitting || success}
            loading={isSubmitting}
          >
            Reset password
          </ProgressButton>
        </div>
      </form>
    );
  };

  if (status === "loading") {
    return null;
  }

  if (status === "success") {
    return null;
  }

  return (
    <div className="container py-4">
      <div className="row my-4 mb-5">
        <div className="col-md-6 offset-md-3 col-xxl-4 offset-xxl-4">
          <div className="card">
            <div className="card-body p-lg-4">
              <h4 className="card-title fw-bold mt-2 mb-4">Reset password</h4>

              {success && (
                <Alert
                  message="Password reset success. Please login again."
                  variant="success"
                />
              )}

              {error && <Alert message={error} variant="danger" />}

              {content()}
            </div>
            <div className="text-center p-3 card-footer">
              Already have an account?
              <Link
                href="/login"
                className="text-decoration-none fw-medium link-anchor ms-1"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
