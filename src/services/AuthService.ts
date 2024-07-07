import makeApiRequest from "@/common/make-api-request";
import { validateResponse } from "@/common/utils";

export async function changePassword(body: any) {
  const url = `/auth/change-password`;

  const resp = await makeApiRequest({
    url: url,
    options: {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json"
      }
    },
    authenticated: true
  });

  await validateResponse(resp);
}

export async function verifyPhone(requestId: number, code: string) {
  const url = `/auth/verify-phone?requestId=${requestId}&code=${code}`;

  const resp = await makeApiRequest({
    url: url,
    authenticated: true
  });

  await validateResponse(resp);
}

export async function changePhone(body: any) {
  const url = `/auth/change-phone`;

  const resp = await makeApiRequest({
    url: url,
    options: {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json"
      }
    },
    authenticated: true
  });

  await validateResponse(resp);
}
