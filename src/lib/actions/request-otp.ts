"use server";

import { SmspohResult } from "@/common/models";
import { validateResponse } from "@/common/utils";

export async function requestOTP(phone: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL_LOCAL}/auth/request-otp?phone=${phone}`;

  const resp = await fetch(url);

  await validateResponse(resp);

  return (await resp.json()) as SmspohResult;
}
