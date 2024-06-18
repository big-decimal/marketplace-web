import makeApiRequest from "@/common/makeApiRequest";
import { Market } from "@/common/models";
import {
  parseErrorResponse,
  setEmptyOrString,
  setStringToSlug,
  validateResponse
} from "@/common/utils";
import Alert from "@/components/Alert";
import ProgressButton from "@/components/ProgressButton";
import { Input } from "@/components/forms";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface MarketEditProps {
  value?: Market;
  handleClose?: (reload?: boolean) => void;
}

const saveMarket = async (values: Market) => {
  const url = `/admin/markets`;

  const resp = await makeApiRequest({
    url,
    options: {
      method: values.id > 0 ? "PUT" : "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json"
      }
    },
    authenticated: true
  });

  await validateResponse(resp);
};

export default function MarketEdit({ value, handleClose }: MarketEditProps) {
  const [error, setError] = useState<string>();

  const {
    control,
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue
  } = useForm<Market>({
    values: value ?? {
      id: 0,
      name: "",
      slug: ""
    }
  });

  const executeSave = async (values: Market) => {
    try {
      setError(undefined);
      await saveMarket(values);
      toast.success("Market saved successfully");
      handleClose?.(true);
    } catch (error) {
      const msg = parseErrorResponse(error);
      setError(msg);
    }
  };

  return (
    <>
      <div className="modal-header">
        <h4 className="modal-title">
          {(value?.id ?? 0) > 0 ? "Update" : "Create"} Market
        </h4>
        <button
          type="button"
          className="btn-close shadow-none"
          aria-label="Close"
          disabled={isSubmitting}
          onClick={() => handleClose?.()}
        ></button>
      </div>
      <div className="modal-body">
        {error && <Alert message={error} variant="danger" />}
        <div className="row g-3">
          <div className="col-12">
            <Input
              label="Name *"
              type="text"
              placeholder="Enter market name"
              {...register("name", {
                required: "Please enter market name",
                setValueAs: setEmptyOrString,
                onChange: (evt) => {
                  const slug = setStringToSlug(evt.target.value);
                  if (slug) {
                    setValue("slug", slug, {
                      shouldValidate: !!errors.slug?.message
                    });
                  }
                }
              })}
              error={errors.name?.message}
            />
          </div>
          <div className="col-12">
            <Controller
              control={control}
              name="slug"
              rules={{
                validate: (v) => {
                  if (!setStringToSlug(v)) {
                    return "Please enter valid slug";
                  }
                  return true;
                }
              }}
              render={({ field, fieldState: { error } }) => {
                return (
                  <Input
                    label="Slug *"
                    placeholder="market-name"
                    value={field.value ?? ""}
                    onChange={(evt) => {
                      setValue(
                        "slug",
                        setStringToSlug(evt.target.value) ?? "",
                        {
                          shouldValidate: true
                        }
                      );
                    }}
                    error={error?.message}
                  />
                );
              }}
            />
          </div>
          <div className="col-12">
            <Input
              label="Url"
              type="text"
              placeholder="Enter market url"
              {...register("url")}
            />
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <ProgressButton
          loading={isSubmitting}
          onClick={() => {
            handleSubmit(async (data) => {
              await executeSave(data);
            })();
          }}
        >
          Save
        </ProgressButton>
      </div>
    </>
  );
}
