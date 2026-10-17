import { cookies } from "next/headers";
import { users } from "./users";



export async function getSession() {
  const cookieStore = await cookies();

  const session = cookieStore.get("session");

  if (!session) {
    return null;
  }

  const user = users.find(
    (user) => user.id === session.value
  );

  if (!user) {
    return null;
  }

  return user;
}