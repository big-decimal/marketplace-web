import makeApiRequest from "@/common/make-api-request";
import {
  PageData,
  PaymentTokenResult,
  Shop,
  ShopContact,
  ShopCreateForm,
  ShopLegal,
  ShopLicense,
  ShopMember,
  ShopMonthlySale,
  ShopSetting,
  ShopStatistic,
  ShopUpdate
} from "@/common/models";
import { buildQueryParams, validateResponse } from "@/common/utils";

export interface ShopQuery {
  q?: string;
  page?: number;
  "city-id"?: number;
  "market-id"?: number;
}

export async function createShop(values: ShopCreateForm) {
  const url = `/vendor/shops`;
  const formData = new FormData();
  values.name && formData.append("name", values.name);
  values.slug && formData.append("slug", values.slug);
  values.phone && formData.append("phone", values.phone);
  values.headline && formData.append("headline", values.headline);
  values.about && formData.append("about", values.about);
  values.address && formData.append("address", values.address);
  values.marketId && formData.append("marketId", values.marketId.toString());
  values.cityId && formData.append("cityId", values.cityId.toString());
  formData.append("cashOnDelivery", "true");
  values.logoImage && formData.append("logo", values.logoImage);
  values.coverImage && formData.append("cover", values.coverImage);

  values.licenses?.forEach((l, i) => {
    l.file && formData.append(`licenses[${i}]`, l.file);
  });

  if (values.legal) {
    values.legal.ownerName && formData.append("legal.ownerName", values.legal.ownerName);
    values.legal.sellerName && formData.append("legal.sellerName", values.legal.sellerName);
    values.legal.shopNumber && formData.append("legal.shopNumber", values.legal.shopNumber);
  }

  const resp = await makeApiRequest({
    url,
    options: {
      method: "POST",
      body: formData
    },
    authenticated: true
  });

  await validateResponse(resp);

  return resp
    .json()
    .then((json) => json as PaymentTokenResult)
    .catch((e) => undefined);
}

export async function updateShop(values: ShopUpdate) {
  const url = `/vendor/shops/${values.shopId}`;

  const resp = await makeApiRequest({
    url,
    options: {
      method: "PUT",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json"
      }
    },
    authenticated: true
  });

  await validateResponse(resp);

  return resp.json() as Promise<Shop>;
}

export async function updateShopContact(values: ShopContact) {
  const url = `/vendor/shops/${values.shopId}/contact`;
  const resp = await makeApiRequest({
    url,
    options: {
      method: "PUT",
      body: JSON.stringify({ ...values, cityId: values.city?.id }),
      headers: {
        "Content-Type": "application/json"
      }
    },
    authenticated: true
  });

  await validateResponse(resp);
}

export async function updateShopLegal(shopId: number, values: ShopLegal) {
  const url = `/vendor/shops/${shopId}/legal`;
  const resp = await makeApiRequest({
    url,
    options: {
      method: "PUT",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json"
      }
    },
    authenticated: true
  });

  await validateResponse(resp);
}

export async function updateShopSetting(values: ShopSetting) {
  const url = `/vendor/shops/${values.shopId}/setting`;
  const resp = await makeApiRequest({
    url,
    options: {
      method: "PUT",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json"
      }
    },
    authenticated: true
  });

  await validateResponse(resp);
}

export async function uploadShopLogo(shopId: number, file: File) {
  const url = `/vendor/shops/${shopId}/logo`;

  const form = new FormData();
  form.append("file", file);

  const resp = await makeApiRequest({
    url,
    options: {
      method: "PUT",
      body: form
    },
    authenticated: true
  });

  await validateResponse(resp);
}

export async function uploadShopCover(shopId: number, file: File) {
  const url = `/vendor/shops/${shopId}/cover`;

  const form = new FormData();
  form.append("file", file);

  const resp = await makeApiRequest({
    url,
    options: {
      method: "PUT",
      body: form
    },
    authenticated: true
  });

  await validateResponse(resp);
}

export async function getShopById(id: number) {
  const url = `/vendor/shops/${id}`;

  const resp = await makeApiRequest({ url, authenticated: true });

  await validateResponse(resp);

  return resp
    .json()
    .then((json) => json as Shop)
    .catch((e) => null);
}

export async function getShopBySlug(slug: String) {
  const url = `/content/shops/${slug}`;

  const resp = await makeApiRequest({ url, options: { cache: "no-store" } });

  await validateResponse(resp, true);

  return resp
    .json()
    .then((json) => json as Shop)
    .catch((e) => null);
}

export async function getMyShops(page?: number) {
  const query = buildQueryParams({
    page: page
  });
  const url = `/profile/shops${query}`;

  const resp = await makeApiRequest({ url, authenticated: true });

  await validateResponse(resp);

  return resp.json() as Promise<PageData<Shop>>;
}

export async function findShops(query: ShopQuery) {
  const q = buildQueryParams({ ...query });
  const url = `/content/shops${q}`;

  const resp = await makeApiRequest({ url });

  await validateResponse(resp);

  return resp.json() as Promise<PageData<Shop>>;
}

export async function getShopStatistic(shopId: number) {
  const url = `/vendor/shops/${shopId}/statistic`;

  const resp = await makeApiRequest({ url, authenticated: true });

  await validateResponse(resp);

  return resp.json() as Promise<ShopStatistic>;
}

export async function getShopSetting(shopId: number) {
  const url = `/content/shops/${shopId}/setting`;

  const resp = await makeApiRequest({ url, authenticated: true });

  await validateResponse(resp);

  return resp
    .json()
    .then((json) => json as ShopSetting)
    .catch((e) => null);
}

export async function getPendingOrderCount(shopId: number) {
  const url = `/vendor/shops/${shopId}/pending-order-count`;

  const resp = await makeApiRequest({ url, authenticated: true });

  await validateResponse(resp);

  return resp.text() as Promise<string>;
}

export async function getMonthlySale(shopId: number, year: number) {
  const url = `/vendor/shops/${shopId}/monthly-sales?year=${year}`;

  const resp = await makeApiRequest({ url, authenticated: true });

  await validateResponse(resp);

  return resp.json() as Promise<ShopMonthlySale[]>;
}

export async function uploadShopLicense(shopId: number, file: File) {
  const url = `/vendor/shops/${shopId}/licenses`;
  const form = new FormData();
  form.append("file", file);

  const resp = await makeApiRequest({
    url,
    options: {
      method: "POST",
      body: form
    },
    authenticated: true
  });

  await validateResponse(resp);
}

export async function deleteShopLicense(shopId: number, id: number) {
  const url = `/vendor/shops/${shopId}/licenses/${id}`;

  const resp = await makeApiRequest({
    url,
    options: {
      method: "DELETE"
    },
    authenticated: true
  });

  await validateResponse(resp);
}

export async function getShopLicenses(shopId: number) {
  const url = `/content/shops/${shopId}/licenses`;

  const resp = await makeApiRequest({ url });

  await validateResponse(resp);

  return resp.json() as Promise<ShopLicense[]>;
}

export async function getShopMembers(shopId: number) {
  const url = `/vendor/shops/${shopId}/members`;

  const resp = await makeApiRequest({ url, authenticated: true });

  await validateResponse(resp);

  return resp.json() as Promise<ShopMember[]>;
}

export async function getShopMember(shopId: number, userId: number) {
  const url = `/vendor/shops/${shopId}/members/${userId}`;

  const resp = await makeApiRequest({ url, authenticated: true });

  await validateResponse(resp);

  return resp.json() as Promise<ShopMember>;
}

export async function createShopMember(shopId: number, phone: string) {
  const url = `/vendor/shops/${shopId}/members/${phone}`;

  const resp = await makeApiRequest({
    url,
    options: {
      method: "POST"
    },
    authenticated: true
  });

  await validateResponse(resp);
}

export async function deleteShopMember(shopId: number, userId: number) {
  const url = `/vendor/shops/${shopId}/members/${userId}`;

  const resp = await makeApiRequest({
    url,
    options: {
      method: "DELETE"
    },
    authenticated: true
  });

  await validateResponse(resp);
}
