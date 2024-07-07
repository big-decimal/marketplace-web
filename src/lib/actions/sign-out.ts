"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function signOut() {
  cookies().delete("refresh_token");
  revalidatePath("/", "layout");
}
