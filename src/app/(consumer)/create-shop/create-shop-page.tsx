"use client";
import { withAuthentication } from "@/common/WithAuthentication";
import { useCities, useMarkets } from "@/common/hooks";
import { City, Market, ShopCreateForm } from "@/common/models";
import {
  parseErrorResponse,
  setEmptyOrString,
  setStringToSlug
} from "@/common/utils";
import ProgressButton from "@/components/ProgressButton";
import { AutocompleteSelect, Input } from "@/components/forms";
import { RichTextEditorInputProps } from "@/components/forms/RichTextEditor";
import { createShop } from "@/services/ShopService";
import { RiDeleteBin6Line } from "@remixicon/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CSSProperties, ChangeEvent, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";

const DynamicEditor = dynamic<RichTextEditorInputProps>(
  () => import("@/components/forms").then((f) => f.RichTextEditor),
  {
    ssr: false
  }
);

function CreateShopPage() {
  const router = useRouter();

  const [acceptTerms, setAcceptTerms] = useState(false);

  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const licenseRef = useRef<HTMLInputElement>(null);

  const citiesState = useCities();

  const marketsState = useMarkets();

  const {
    register,
    formState: { errors, isSubmitting },
    setValue,
    handleSubmit,
    control
  } = useForm<ShopCreateForm>({
    defaultValues: { cashOnDelivery: true }
  });

  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "licenses",
    keyName: "vId"
  });

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    try {
      let files = event.target.files;
      const name = event.target.name;
      if (files && files.length > 0) {
        let file = files[0];
        const fileSize = file.size / (1024 * 1024);

        let limit = 1;
        if (name === "logo") {
          limit = 0.36;
        }
        if (name === "cover") {
          limit = 0.512;
        }

        if (fileSize > limit) {
          throw `File size must not greater than ${limit * 1000}KB`;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
          //props.setFieldValue?.(name, e.target?.result);
          const result = e.target?.result;
          if (!result) {
            return;
          }

          if (name === "logo" && logoRef.current) {
            setValue("logo", result as string);
          } else if (name === "cover" && coverRef.current) {
            setValue("cover", result as string);
          } else if (name === "license" && licenseRef.current) {
            append({
              id: 0,
              image: result as string,
              file: file
            });
          }

          event.target.value = "";
        };
        reader.readAsDataURL(file);

        if (name === "logo" && logoRef.current) {
          setValue("logoImage", file);
        } else if (name === "cover" && coverRef.current) {
          setValue("coverImage", file);
        }
      }
    } catch (error) {
      const msg = parseErrorResponse(error);
      toast.error(msg);
      event.target.value = "";
    } finally {
    }
  }

  const executeCreate = async (shop: ShopCreateForm) => {
    try {
      console.log(shop);
      const result = await createShop(shop);
      if (result) {
        window.location.href = result.webPaymentUrl;
      } else {
        toast.success("Shop registration success");
        router.replace("/profile/shops");
      }
    } catch (error) {
      const msg = parseErrorResponse(error);
      toast.error(msg);
    }
  };

  return (
    <div className="pb-5">
      <div className="header-bar mb-3">
        <div className="container py-3">
          <div className="row g-3">
            <div className="col-lg-6">
              <h3 className="text-lg-start text-light mb-1">Create Shop</h3>
              <nav aria-label="breadcrumb col-12">
                <ol
                  className="breadcrumb mb-1"
                  style={
                    {
                      "--bs-breadcrumb-divider-color": "#bbb",
                      "--bs-breadcrumb-item-active-color": "#bbb"
                    } as CSSProperties
                  }
                >
                  <li className="breadcrumb-item">
                    <Link href="/profile" className="">
                      My profile
                    </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link href="/profile/shops" className="">
                      shops
                    </Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Create shop
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row g-3 mb-5">
          <div className="col-lg-8">
            <div className="card mb-3">
              <div className="card-header py-2h">
                <h4 className="mb-0">Basic information</h4>
              </div>

              <div className="card-body">
                <div className="row g-3">
                  <div className="col-lg-6">
                    <Input
                      label="Name *"
                      id="nameInput"
                      type="text"
                      placeholder="Enter shop name"
                      {...register("name", {
                        required: "Please enter shop name",
                        setValueAs: setEmptyOrString,
                        onChange: (evt) => {
                          setValue("slug", setStringToSlug(evt.target.value), {
                            shouldValidate: !!errors.slug?.message
                          });
                        }
                      })}
                      error={errors.name?.message}
                    />
                  </div>
                  <div className="col-lg-6">
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
                          <>
                            <Input
                              label="Slug *"
                              value={field.value ?? ""}
                              placeholder="your-shop-name"
                              onChange={(evt) => {
                                setValue(
                                  "slug",
                                  setStringToSlug(evt.target.value),
                                  {
                                    shouldValidate: true
                                  }
                                );
                              }}
                              error={error?.message}
                            />
                          </>
                        );
                      }}
                    />
                  </div>
                  <div className="col-12">
                    <Input
                      label="Phone number *"
                      id="phoneInput"
                      type="text"
                      placeholder="Enter shop phone number"
                      {...register("phone", {
                        required: true,
                        pattern: /^(09)\d{7,12}$/
                      })}
                      error={errors.phone && "Please enter valid phone number"}
                    />
                  </div>
                  <div className="col-12">
                    <Input
                      label="Headline"
                      id="headlineInput"
                      type="text"
                      placeholder="Enter shop headline"
                      {...register("headline")}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">
                      Market<span className="text-muted">(Optional)</span>
                    </label>
                    <div className="flex-grow-1">
                      <Controller
                        control={control}
                        name="marketId"
                        render={({ field }) => {
                          return (
                            <AutocompleteSelect<Market, number>
                              options={marketsState.markets?.sort((f, s) =>
                                f.name.localeCompare(s.name)
                              )}
                              placeholder="Select market"
                              getOptionKey={(m) => m.id}
                              getOptionLabel={(m) => m.name}
                              onChange={(m) => {
                                setValue("marketId", m?.id);
                              }}
                              isClearable
                              error={errors.marketId?.message}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label">City *</label>
                    <div className="flex-grow-1">
                      <Controller
                        control={control}
                        name="cityId"
                        rules={{
                          validate: (v) => (v ?? 0) > 0 || "Please select city"
                        }}
                        render={({ field }) => {
                          return (
                            <AutocompleteSelect<City, number>
                              options={citiesState.cities?.sort((f, s) =>
                                f.name.localeCompare(s.name)
                              )}
                              placeholder="Select city"
                              getOptionKey={(c) => c.id}
                              getOptionLabel={(c) => c.name}
                              onChange={(c) => {
                                setValue("cityId", c?.id, {
                                  shouldValidate: true
                                });
                              }}
                              error={errors.cityId?.message}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <Input
                      label="Address"
                      id="addressInput"
                      type="text"
                      placeholder="Enter shop address"
                      {...register("address")}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">About us</label>
                    <div className="flex-grow-1">
                      <Controller
                        name="about"
                        control={control}
                        render={({ field }) => {
                          return (
                            <DynamicEditor
                              id="aboutInput"
                              placeholder="Enter about us..."
                              minHeight={300}
                              value={field.value}
                              onEditorChange={(value) => {
                                setValue(field.name, value);
                              }}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card mb-3">
              <div className="card-header py-2h">
                <h4 className="mb-0">Licenses</h4>
              </div>

              <div className="card-body">
                <div className="d-flex flex-wrap gap-3">
                  {fields?.map((l, i) => {
                    return (
                      <div key={i} className="position-relative">
                        <Image
                          src={l.image}
                          width={150}
                          height={150}
                          alt=""
                          style={{
                            objectFit: "contain"
                          }}
                          className="rounded border"
                        />

                        <div className="position-absolute top-0 end-0 m-2 d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              remove(i);
                            }}
                          >
                            <RiDeleteBin6Line size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {fields.length < 2 && (
                  <button
                    className="btn btn-primary mt-3"
                    onClick={() => {
                      licenseRef.current?.click();
                    }}
                  >
                    Upload
                  </button>
                )}

                <input
                  ref={licenseRef}
                  onChange={handleImageChange}
                  name="license"
                  className="d-none"
                  type="file"
                  accept="image/x-png,image/jpeg,image/png"
                />
              </div>

              <div className="card-footer py-2h">
                <span className="text-muted">
                  Shop approval process will take longer if no license attached.
                </span>
              </div>
            </div>

            <div className="card">
              <div className="card-header py-2h">
                <div className="hstack">
                  <h4 className="mb-0">Legal information</h4>
                  <span className="text-muted ms-1">(Optional)</span>
                </div>
              </div>

              <div className="card-body">
                <div className="row g-3">
                  <div className="col-lg-6">
                    <Input
                      label="Owner name"
                      placeholder="Enter owner name"
                      {...register("legal.ownerName")}
                    />
                  </div>
                  <div className="col-lg-6">
                    <Input
                      label="Seller name"
                      placeholder="Enter seller name"
                      {...register("legal.sellerName")}
                    />
                  </div>
                  <div className="col-12">
                    <Input
                      label="Shop number"
                      placeholder="Enter shop number"
                      {...register("legal.shopNumber")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card mb-3">
              <div className="card-header py-2h">
                <h4 className="mb-0">Shop media</h4>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="logoInput" className="form-label">
                      Logo image
                    </label>
                    <input
                      ref={logoRef}
                      className="form-control"
                      type="file"
                      id="logoInput"
                      name="logo"
                      accept="image/x-png,image/jpeg,image/png"
                      onChange={handleImageChange}
                    ></input>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Cover image</label>
                    <div
                      role="button"
                      className="rounded border position-relative bg-light"
                      style={{
                        minHeight: 200
                      }}
                      onClick={() => {
                        coverRef.current?.click();
                      }}
                    >
                      <div className="position-absolute text-muted top-50 start-50 translate-middle h-auto w-auto fw-medium">
                        Click here to upload
                      </div>
                      <Controller
                        control={control}
                        name="cover"
                        render={({ field }) => {
                          if (!field.value) {
                            return <></>;
                          }
                          return (
                            <Image
                              src={field.value}
                              fill
                              style={{
                                objectFit: "cover"
                              }}
                              className="rounded-1"
                              alt=""
                            />
                          );
                        }}
                      />
                      <input
                        ref={coverRef}
                        onChange={handleImageChange}
                        name="cover"
                        className="d-none"
                        type="file"
                        accept="image/x-png,image/jpeg,image/png"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ProgressButton
              className="py-2 w-100 mb-3"
              loading={isSubmitting}
              disabled={!acceptTerms}
              onClick={() => {
                handleSubmit(
                  async (data) => {
                    await executeCreate(data);
                  },
                  (errors) => {
                    const errorList = (
                      <ul className="mb-0">
                        {errors.name?.message && <li>{errors.name.message}</li>}
                        {errors.slug?.message && <li>{errors.slug.message}</li>}
                        {errors.phone?.message && (
                          <li>{errors.phone.message}</li>
                        )}
                        {errors.cityId?.message && (
                          <li>{errors.cityId.message}</li>
                        )}
                      </ul>
                    );

                    toast.error(errorList, {
                      icon: false
                    });
                  }
                )();
              }}
            >
              <span>Create shop</span>
            </ProgressButton>
            <div className="form-check mb-3">
              <input
                id="termsAndConditions"
                type="checkbox"
                name="level"
                className="form-check-input"
                checked={acceptTerms}
                onChange={(evt) => setAcceptTerms(evt.target.checked)}
              />
              <label className="form-check-label text-muted">
                By checking, you have read and agree to the&nbsp;
                <Link
                  href={"/terms-and-conditions"}
                  target="_blank"
                  className="link-anchor fw-medium"
                >
                  terms of service
                </Link>
                .
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuthentication(CreateShopPage);
