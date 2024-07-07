import makeApiRequest from "../common/make-api-request";
import { Market, PageData } from "../common/models";
import { buildQueryParams, validateResponse } from "../common/utils";

export interface MarketQuery {
  page?: number;
  limit?: number;
}

export async function getMarket(slug: string) {
  const url = `/content/markets/${slug}`;

  const resp = await makeApiRequest({
    url,
    options: {
      cache: "no-store"
    }
  });

  await validateResponse(resp, true);

  return resp
    .json()
    .then((json) => json as Market)
    .catch((e) => null);
}

export async function getMarkets(query: MarketQuery) {
  const q = buildQueryParams({ ...query });
  const url = `/content/markets${q}`;

  const resp = await makeApiRequest({
    url,
    options: {
      cache: "no-store"
    }
  });

  await validateResponse(resp);

  return resp.json() as Promise<PageData<Market>>;
}
