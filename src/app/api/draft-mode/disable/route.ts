import { perspectiveCookieName } from "@sanity/preview-url-secret/constants";
import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request): Promise<Response> {
  const draftModeStore = await draftMode();
  draftModeStore.disable();

  const cookieStore = await cookies();
  cookieStore.delete(perspectiveCookieName);

  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get("redirectTo") || "/";

  return redirect(redirectTo) as Promise<Response>;
}
