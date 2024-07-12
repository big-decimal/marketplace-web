import makeApiRequest from "@/common/make-api-request";
import { User, UserEdit, UserStatistic } from "@/common/models";
import { validateResponse } from "@/common/utils";

export async function updateUser(values: UserEdit) {
  const url = `/profile`;

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

export async function uploadUserImage(file: File) {
  const url = `/profile/image`;

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

export async function getLoginUser() {
  const url = `/profile`;

  const resp = await makeApiRequest({
    url,
    authenticated: true
  });

  await validateResponse(resp);

  return resp.json() as Promise<User>;
}

export async function getUserStatistic() {
  const url = `/profile/statistic`;

  const resp = await makeApiRequest({ url, authenticated: true });

  await validateResponse(resp);

  return (await resp.json()) as UserStatistic;
}

export async function verifyPhoneNumber(userId: number) {
  const url = `/admin/users/${userId}/verify-phone-number`;

  const resp = await makeApiRequest({
    url,
    options: {
      method: "PUT"
    },
    authenticated: true
  });

  await validateResponse(resp);
}

export async function enableUser(userId: number) {
  const url = `/admin/users/${userId}/enable`;

  const resp = await makeApiRequest({
    url,
    options: {
      method: "PUT"
    },
    authenticated: true
  });

  await validateResponse(resp);
}

export async function disableUser(userId: number) {
  const url = `/admin/users/${userId}/disable`;

  const resp = await makeApiRequest({
    url,
    options: {
      method: "PUT"
    },
    authenticated: true
  });

  await validateResponse(resp);
}
