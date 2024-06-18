import makeApiRequest from "../common/makeApiRequest";
import { Market, PageData } from "../common/models";
import { buildQueryParams, validateResponse } from "../common/utils";

export interface MarketQuery {
  page?: number;
  limit?: number;
}

export async function getMarkets(query: MarketQuery) {
  const q = buildQueryParams({ ...query });
  const url = `/content/markets${q}`;

  const resp = await makeApiRequest({ url });

  await validateResponse(resp);

  return resp.json() as Promise<PageData<Market>>;
}
