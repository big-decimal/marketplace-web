"use client";

import { parseErrorResponse } from "@/common/utils";
import Modal from "@/components/Modal";
import ProgressButton from "@/components/ProgressButton";
import { Input } from "@/components/forms";
import { requestOTP } from "@/lib/actions";
import { changePhone } from "@/services/AuthService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

const schema = z.object({
  phone: z.string().regex(/^(09)\d{7,12}$/, "Please enter valid phone number"),
  code: z.string().min(1, {
    message: "Please enter otp code"
  })
});

type ChangePhoneNumberForm = z.infer<typeof schema>;

export default function ChangePhoneNumberButton({
  onSuccess
}: {
  onSuccess?: () => void;
}) {
  const [isShowEdit, setShowEdit] = useState(false);
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
    control,
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset
  } = useForm<ChangePhoneNumberForm>({
    resolver: zodResolver(schema),
    defaultValues: {}
  });

  const change = async (values: ChangePhoneNumberForm) => {
    try {
      await changePhone({
        ...values,
        requestId: requestId
      });
      onSuccess?.();
      toast.success("Phone number change success");
      setShowEdit(false);
    } catch (error) {
      toast.error(parseErrorResponse(error));
    }
  };

  return (
    <>
      <div
        role="button"
        className="link-primary small"
        onClick={() => {
          setShowEdit(true);
        }}
      >
        Change
      </div>

      <Modal
        id="changePhoneNumberModal"
        show={isShowEdit}
        onHidden={() => {
          reset({
            phone: "",
            code: ""
          });
          setRequestId(0);
          setTimer(0);
          setResend(true);
        }}
      >
        {(isShown) => {
          if (!isShown) {
            return <></>;
          }
          return (
            <>
              <div className="modal-header">
                <h5 className="modal-title">Change phone number</h5>
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
                      <Controller
                        control={control}
                        name="phone"
                        render={({ field }) => {
                          return (
                            <button
                              className="btn btn-primary text-nowrap"
                              disabled={!resend || !field.value}
                              onClick={async () => {
                                try {
                                  setResend(false);
                                  setRequestId(0);
                                  const result = await requestOTP(field.value);
                                  setRequestId(result.requestId);
                                } catch (error) {
                                  toast.error(parseErrorResponse(error));
                                }
                              }}
                            >
                              Get OTP
                              {timer > 0 && (
                                <span className="ms-1">({timer})</span>
                              )}
                            </button>
                          );
                        }}
                      />
                    </div>
                    {errors.code?.message && (
                      <div className="text-danger small mt-1">
                        {errors.code.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-default"
                  disabled={isSubmitting}
                  onClick={() => setShowEdit(false)}
                >
                  Cancel
                </button>
                <ProgressButton
                  disabled={isSubmitting || requestId <= 0}
                  loading={isSubmitting}
                  onClick={() => {
                    handleSubmit(change)();
                  }}
                >
                  Change
                </ProgressButton>
              </div>
            </>
          );
        }}
      </Modal>
    </>
  );
}
