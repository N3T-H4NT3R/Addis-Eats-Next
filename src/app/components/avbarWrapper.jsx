import { getSession } from "@/app/lib/session";
import Navbar from "./Navbar";

export default async function NavbarWrapper() {
  const session = await getSession();

  return (
    <Navbar
      isAuthenticated={Boolean(session)}
      userId={session ? String(session.id) : null}
      role={session?.role ?? null}
    />
  );
}
