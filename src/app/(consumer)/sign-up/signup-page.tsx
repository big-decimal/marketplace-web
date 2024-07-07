"use client";
import { AuthenticationContext } from "@/common/contexts";
import { parseErrorResponse, setEmptyOrString } from "@/common/utils";
import Alert from "@/components/Alert";
import Loading from "@/components/Loading";
import ProgressButton from "@/components/ProgressButton";
import { Input, PasswordInput } from "@/components/forms";
import { signUp } from "@/lib/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface SignUpInputs {
  name?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

function SignUpPage() {
  const router = useRouter();
  const { status, user, reload } = useContext(AuthenticationContext);
  const [error, setError] = useState<string>();

  const {
    register,
    control,
    formState: { errors, isSubmitting },
    handleSubmit
  } = useForm<SignUpInputs>();

  useEffect(() => {
    if (status === "success") {
      router.replace(user?.phoneNumberVerified ? "/" : "/verify-phone");
    }
  }, [router, status, user]);

  const processSignUp = async (values: SignUpInputs) => {
    try {
      setError(undefined);
      const result = await signUp({
        name: values.name!,
        phone: values.phone!,
        password: values.password!
      });
      localStorage.setItem('access_token', result.accessToken);
      // reload();
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "access_token",
          newValue: result.accessToken
        })
      );
    } catch (error) {
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
        <div className="col-lg-6 offset-lg-3">
          <div className="card">
            <div className="card-body p-lg-4">
              <h4 className="card-title fw-bold mt-2 mb-4">Sign Up</h4>

              {error && <Alert message={error} variant="danger" />}

              <form
                className="row g-3"
                onSubmit={(evt) => {
                  evt.preventDefault();
                  handleSubmit(async (data) => await processSignUp(data))();
                }}
              >
                <div className="col-lg-6">
                  <Input
                    label="Full Name"
                    id="nameInput"
                    type="text"
                    placeholder="Your full name"
                    {...register("name", {
                      required: true,
                      setValueAs: setEmptyOrString
                    })}
                    error={errors.name && "Please enter full name"}
                  />
                </div>
                <div className="col-lg-6">
                  <Input
                    label="Phone number"
                    id="phoneInput"
                    type="tel"
                    autoComplete="username"
                    placeholder="09xxxxxxx"
                    {...register("phone", {
                      required: true,
                      pattern: /^(09)\d{7,12}$/
                    })}
                    error={errors.phone && "Please enter valid phone number"}
                  />
                </div>
                <div className="col-12">
                  <PasswordInput
                    label="Password"
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                    {...register("password", {
                      required: true,
                      minLength: 8,
                      setValueAs: setEmptyOrString
                    })}
                    error={
                      errors.password &&
                      "Password must be at least 8 charachers"
                    }
                  />
                </div>
                <div className="col-12">
                  <PasswordInput
                    label="Confirm Password"
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                    {...register("confirmPassword", {
                      setValueAs: setEmptyOrString,
                      validate: (v, fv) => v === fv.password
                    })}
                    error={errors.confirmPassword && "Password does not match"}
                  />
                </div>

                <div className="col-md-12 mt-4">
                  <ProgressButton
                    type="submit"
                    className="w-100 py-2h"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                  >
                    Sign up
                  </ProgressButton>
                </div>
              </form>
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

export default SignUpPage;
