"use server";

import { validateResponse } from "@/common/utils";

export async function existsUser(phone: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL_LOCAL}/auth/exists-user?phone=${phone}`;

  const resp = await fetch(url);

  await validateResponse(resp);

  return (await resp.json()) as boolean;
}
