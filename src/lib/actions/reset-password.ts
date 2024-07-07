"use server";

import { validateResponse } from "@/common/utils";

export async function resetPassword(body: any) {
  const url = `${process.env.NEXT_PUBLIC_API_URL_LOCAL}/auth/reset-password`;

  const resp = await fetch(url, {
    method: "PUT",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json"
    }
  });

  await validateResponse(resp);
}
