import makeApiRequest from "../common/makeApiRequest";
import {
  PageData,
  SaleHistory,
  Shop,
  ShopAcceptedPayment,
  ShopContact,
  ShopCreateForm,
  ShopGeneral,
  ShopSetting,
  ShopStatistic
} from "../common/models";
import {
  buildQueryParams,
  getAuthHeader,
  validateResponse
} from "../common/utils";

const basePath = "shops";

export interface ShopQuery {
  q?: string;
  page?: number;
}

export async function createShop(value: ShopCreateForm) {
  const url = basePath;
  const formData = new FormData();
  value.name && formData.append("name", value.name);
  value.slug && formData.append("slug", value.slug);
  value.headline && formData.append("headline", value.headline);
  value.about && formData.append("about", value.about);
  value.address && formData.append("address", value.address);
  formData.append("cashOnDelivery", value.cashOnDelivery ? "true" : "false");
  formData.append("bankTransfer", value.bankTransfer ? "true" : "false");
  value.logoImage && formData.append("logo", value.logoImage);
  value.coverImage && formData.append("cover", value.coverImage);

  value.acceptedPayments?.forEach((v, i) => {
    //v.id && formData.append(`acceptedPayments[${i}].id`, v.id.toPrecision());
    v.accountType &&
      formData.append(`acceptedPayments[${i}].accountType`, v.accountType);
    v.accountNumber &&
      formData.append(`acceptedPayments[${i}].accountNumber`, v.accountNumber);
  });

  value.deliveryCities?.forEach((v, i) => {
    formData.append(`deliveryCities[${i}].id`, v.id.toString());
    formData.append(`deliveryCities[${i}].name`, v.name);
  });

  const resp = await makeApiRequest(
    url,
    {
      method: "POST",
      body: formData
    },
    true
  );

  await validateResponse(resp);
}

export async function updateShopGeneral(value: ShopGeneral) {
  const url = `${basePath}/${value.shopId}/general`;

  // const resp = await fetch(url, {
  //   method: "PUT",
  //   body: JSON.stringify(value),
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: await getAuthHeader()
  //   }
  // });

  const resp = await makeApiRequest(
    url,
    {
      method: "PUT",
      body: JSON.stringify(value),
      headers: {
        "Content-Type": "application/json"
      }
    },
    true
  );

  await validateResponse(resp);

  return resp.json() as Promise<Shop>;
}

export async function updateShopContact(value: ShopContact) {
  const url = `${basePath}/${value.shopId}/contact`;
  const resp = await makeApiRequest(
    url,
    {
      method: "PUT",
      body: JSON.stringify(value),
      headers: {
        "Content-Type": "application/json"
      }
    },
    true
  );

  await validateResponse(resp);
}

export async function updateShopSetting(value: ShopSetting) {
  const url = `${basePath}/${value.shopId}/setting`;
  const resp = await makeApiRequest(
    url,
    {
      method: "PUT",
      body: JSON.stringify(value),
      headers: {
        "Content-Type": "application/json"
      }
    },
    true
  );

  await validateResponse(resp);
}

export async function uploadShopLogo(shopId: number, file: File) {
  const url = `${basePath}/${shopId}/logo`;

  const form = new FormData();
  form.append("file", file);

  const resp = await makeApiRequest(
    url,
    {
      method: "PUT",
      body: form
    },
    true
  );

  await validateResponse(resp);
}

export async function uploadShopCover(shopId: number, file: File) {
  const url = `${basePath}/${shopId}/cover`;

  const form = new FormData();
  form.append("file", file);

  const resp = await makeApiRequest(
    url,
    {
      method: "PUT",
      body: form
    },
    true
  );

  await validateResponse(resp);
}

export async function saveShopAcceptedPayment(
  shopId: number,
  value: ShopAcceptedPayment
) {
  const url = `${basePath}/${shopId}/accepted-payments`;
  const resp = await makeApiRequest(
    url,
    {
      method: !value.id ? "POST" : "PUT",
      body: JSON.stringify(value),
      headers: {
        "Content-Type": "application/json"
      }
    },
    true
  );

  await validateResponse(resp);
}

export async function deleteShopAcceptedPayment(
  shopId: number,
  paymentId: number
) {
  const url = `${basePath}/${shopId}/accepted-payments/${paymentId}`;
  const resp = await makeApiRequest(
    url,
    {
      method: "DELETE"
    },
    true
  );

  await validateResponse(resp);
}

export async function getShopById(id: number) {
  const url = `${basePath}/${id}`;
  // const resp = await fetch(url, {
  //   headers: {
  //     Authorization: await getAuthHeader()
  //   }
  // });

  const resp = await makeApiRequest(url, {}, true);

  await validateResponse(resp);

  return resp
    .json()
    .then((json) => json as Shop)
    .catch((e) => null);
}

export async function getShopBySlug(slug: String) {
  const url = `${basePath}/${slug}`;
  //const resp = await fetch(url);

  const resp = await makeApiRequest(url);

  await validateResponse(resp);

  return resp
    .json()
    .then((json) => json as Shop)
    .catch((e) => null);
}

export async function existsShopBySlug(slug: String, excludeId: number) {
  const query = buildQueryParams({
    exclude: excludeId
  });
  const url = `${basePath}/${slug}/exists${query}`;
  //const resp = await fetch(url);

  const resp = await makeApiRequest(url);

  await validateResponse(resp);

  return resp.json() as Promise<boolean>;
}

export async function isShopMember(shopId: number) {
  try {
    const url = `${basePath}/${shopId}/check-member`;

    // const authHeader = getAuthHeader();

    // if (!authHeader) {
    //   return false;
    // }

    // const resp = await fetch(url, {
    //   headers: {
    //     Authorization: authHeader
    //   }
    // });

    const resp = await makeApiRequest(url, {}, true);

    if (resp.ok) {
      return resp.json() as Promise<boolean>;
    }
  } catch (error) {}

  return false;
}

export async function getMyShops(page?: number) {
  const query = buildQueryParams({
    page: page
  });
  const url = `profile/${basePath}${query}`;
  // const resp = await fetch(url, {
  //   headers: {
  //     Authorization: await getAuthHeader()
  //   }
  // });

  const resp = await makeApiRequest(url, {}, true);

  await validateResponse(resp);

  return resp.json() as Promise<PageData<Shop>>;
}

export async function getShopHints(q: string) {
  const query = buildQueryParams({ q: q });
  const url = `search/shop-hints${query}`;
  //const resp = await fetch(url);

  const resp = await makeApiRequest(url);

  await validateResponse(resp);

  return resp.json() as Promise<string[]>;
}

export async function findShops(query: ShopQuery) {
  const q = buildQueryParams({ ...query });
  const url = `${basePath}${q}`;
  //const resp = await fetch(url);

  const resp = await makeApiRequest(url);

  await validateResponse(resp);

  return resp.json() as Promise<PageData<Shop>>;
}

export async function getShopStatistic(shopId: number) {
  const url = `${basePath}/${shopId}/statistic`;

  const resp = await makeApiRequest(url, {}, true);

  await validateResponse(resp);

  return resp.json() as Promise<ShopStatistic>;
}

export async function getShopSetting(shopId: number) {
  const url = `${basePath}/${shopId}/setting`;

  const resp = await makeApiRequest(url, {}, true);

  await validateResponse(resp);

  return resp
    .json()
    .then((json) => json as ShopSetting)
    .catch((e) => null);
}

export async function getPendingOrderCount(shopId: number) {
  const url = `${basePath}/${shopId}/pending-order-count`;

  const resp = await makeApiRequest(url, {}, true);

  await validateResponse(resp);

  return resp.text() as Promise<string>;
}

export async function getMonthlySale(shopId: number, year: number) {
  const url = `${basePath}/${shopId}/monthly-sales?year=${year}`;

  const resp = await makeApiRequest(url, {}, true);

  await validateResponse(resp);

  return resp.json() as Promise<SaleHistory[]>;
}

export async function getShopAcceptedPayments(shopId: number) {
  const url = `${basePath}/${shopId}/accepted-payments`;

  const resp = await makeApiRequest(url, {}, true);

  await validateResponse(resp);

  return resp.json() as Promise<ShopAcceptedPayment[]>;
}
