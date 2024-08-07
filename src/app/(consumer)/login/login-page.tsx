"use client";
import { AuthenticationContext } from "@/common/contexts";
import { parseErrorResponse } from "@/common/utils";
import Alert from "@/components/Alert";
import Loading from "@/components/Loading";
import ProgressButton from "@/components/ProgressButton";
import { Input, PasswordInput } from "@/components/forms";
import { signIn } from "@/lib/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface LoginInputs {
  username?: string;
  password?: string;
}

function LoginPage() {
  const router = useRouter();
  const { status, user, reload } = useContext(AuthenticationContext);
  const [error, setError] = useState<string>();

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit
  } = useForm<LoginInputs>();

  useEffect(() => {
    if (status === "success") {
      router.replace(user?.phoneNumberVerified ? "/" : "/verify-phone");
    }
  }, [router, status, user]);

  const passwordLogin = async (values: LoginInputs) => {
    try {
      setError(undefined);
      const result = await signIn({
        username: values.username!,
        password: values.password!
      });
      localStorage.setItem("access_token", result.accessToken);
      // reload();
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "access_token",
          newValue: result.accessToken
        })
      );
    } catch (error: any) {
      setError(parseErrorResponse(error));
    }
  };

  if (status === "success") {
    return <></>;
  }

  if (status === "loading") {
    return (
      <div className="container py-3">
        <Loading />
      </div>
    );
  }

  return (
    <div className="container py-3">
      <div className="row my-4 mb-5">
        <div className="col-md-6 offset-md-3 col-xxl-4 offset-xxl-4">
          <div className="card">
            <div className="card-body p-lg-4">
              <h4 className="card-title fw-bold mt-2 mb-4">Sign In</h4>

              {error && <Alert message={error} variant="danger" />}

              <form
                className="row g-3"
                onSubmit={(evt) => {
                  evt.preventDefault();
                  handleSubmit(async (data) => await passwordLogin(data))();
                }}
              >
                <div className="col-md-12">
                  <Input
                    label="Phone number"
                    id="phoneInput"
                    type="tel"
                    autoComplete="username"
                    placeholder="09xxxxxxx"
                    {...register("username", {
                      required: true,
                      pattern: /^(09)\d{7,12}$/
                    })}
                    error={errors.username && "Please enter valid phone number"}
                  />
                </div>
                <div className="col-md-12">
                  <PasswordInput
                    label="Password"
                    placeholder="Enter password"
                    autoComplete="current-password"
                    {...register("password", {
                      required: "Please enter password"
                    })}
                    error={errors.password?.message}
                  />
                  <div className="mt-1">
                    <Link href="/forgot-password" className="link-anchor">
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <div className="col-md-12 mt-4">
                  <ProgressButton
                    type="submit"
                    className="w-100 py-2h"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                  >
                    Login
                  </ProgressButton>
                </div>
              </form>
            </div>
            <div className="text-center p-3 card-footer">
              Don&apos;t have an account?
              <Link
                href="/sign-up"
                className="text-decoration-none fw-medium link-anchor ms-1"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
