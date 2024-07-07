import makeApiRequest from "../common/make-api-request";
import { City } from "../common/models";
import { validateResponse } from "../common/utils";

export async function getAllCities() {
  const url = "/content/cities";

  const resp = await makeApiRequest({url});

  await validateResponse(resp);

  return resp.json() as Promise<City[]>;
}
