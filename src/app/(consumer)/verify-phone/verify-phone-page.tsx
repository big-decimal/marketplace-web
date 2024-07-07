"use client";
import { AuthenticationContext } from "@/common/contexts";
import { parseErrorResponse } from "@/common/utils";
import ProgressButton from "@/components/ProgressButton";
import { Input } from "@/components/forms";
import { requestOTP } from "@/lib/actions";
import { verifyPhone } from "@/services/AuthService";
import { RiCheckLine } from "@remixicon/react";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

function VerifyPhonePage() {
  const { user, status, reload } = useContext(AuthenticationContext);
  const [resend, setResend] = useState(true);
  const [timer, setTimer] = useState(0);
  const [otp, setOtp] = useState<string>();
  const [requestId, setRequestId] = useState<number>();
  const [isSubmitting, setSubmitting] = useState(false);

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

  const content = () => {
    if (status !== "success") {
      return null;
    }

    if (user?.phoneNumberVerified) {
      return (
        <div className="vstack align-items-center">
          <div className="mt-4 mb-3">
            <div className="rounded-circle bg-success p-2h">
              <RiCheckLine size={64} className="text-light" />
            </div>
          </div>

          <h5 className="text-center mb-6">
            Your phone number has been verified
          </h5>

          <div className="d-flex justify-content-center gap-2 flex-wrap mb-3">
            <Link href={"/shops"} className="btn btn-primary py-2 shadow-none">
              Browse shops
            </Link>
            <Link
              href={"/profile"}
              className="btn btn-default py-2 shadow-none"
            >
              Go to profile
            </Link>
          </div>
        </div>
      );
    }

    return (
      <>
        <h4 className="card-title fw-bold mt-2 mb-4">Verify phone number</h4>

        <form
          className="row g-3"
          onSubmit={async (evt) => {
            evt.preventDefault();
            try {
              setSubmitting(true);
              if (!requestId || !otp) {
                throw "Invalid OTP code";
              }

              await verifyPhone(requestId, otp);
              reload();
            } catch (error) {
              toast.error(parseErrorResponse(error));
              setSubmitting(false);
            }
          }}
        >
          <div className="col-12">
            <Input
              label="Phone number"
              id="phoneInput"
              type="tel"
              autoComplete="username"
              placeholder="09xxxxxxx"
              disabled
              defaultValue={user?.phone}
            />
          </div>
          <div className="col-12">
            <label className="form-label">OTP Code</label>
            <div className="hstack gap-2 align-items-stretch">
              <Input
                id="otpInput"
                type="text"
                inputMode="numeric"
                autoComplete="username"
                placeholder="Enter otp code"
                value={otp ?? ""}
                maxLength={6}
                onChange={(evt) => {
                  const value = evt.target.value;
                  setOtp(value);
                }}
              />
              <button
                className="btn btn-primary text-nowrap"
                disabled={!resend}
                onClick={async () => {
                  try {
                    setResend(false);
                    setRequestId(0);
                    const result = await requestOTP(user?.phone ?? "");
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
          </div>

          <div className="col-md-12 mt-4">
            <ProgressButton
              type="submit"
              className="w-100 py-2h"
              disabled={isSubmitting || !otp}
              loading={isSubmitting}
            >
              Verify
            </ProgressButton>
          </div>
        </form>
      </>
    );
  };

  if (status !== "success") {
    return <></>;
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-6 offset-md-3 col-xxl-4 offset-xxl-4">
          <div className="card">
            <div className="card-body">{content()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyPhonePage;
