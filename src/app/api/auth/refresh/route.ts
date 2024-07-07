import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;
  try {
    if (!refreshToken) {
      throw "Refresh token not found";
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL_LOCAL}/auth/refresh`;
    const body = {
      token: refreshToken,
    };

    const resp = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!resp.ok) {
      cookieStore.delete("refresh_token");
      return new Response(null, {
        status: 401
      });
    }

    const json = await resp.json();

    cookieStore.set({
      name: "refresh_token",
      value: json["refreshToken"],
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 2592000
    });

    return Response.json(json);
  } catch (error) {
    cookieStore.delete("refresh_token");
    return new Response(null, {
      status: 401
    });
  }
}
