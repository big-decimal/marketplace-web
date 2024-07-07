"use server";

import { SmspohResult } from "@/common/models";
import { validateResponse } from "@/common/utils";

export async function verifyOTP(requestId: number, code: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL_LOCAL}/auth/verify-otp?requestId=${requestId}&code=${code}`;

  const resp = await fetch(url);

  await validateResponse(resp);

  return (await resp.json()) as SmspohResult;
}
