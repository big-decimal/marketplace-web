"use server";

import { AuthResult } from "@/common/models";
import { validateResponse } from "@/common/utils";
import { cookies } from "next/headers";

export async function signUp(body: any) {

    const url = `${process.env.NEXT_PUBLIC_API_URL_LOCAL}/auth/sign-up`;

    const resp = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json"
      }
    });

    await validateResponse(resp);

    const json = (await resp.json()) as AuthResult;
  
    cookies().set({
      name: "refresh_token",
      value: json.refreshToken,
      httpOnly: true,
      maxAge: 2592000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return json;
  }