import { UserRole } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

// Kita "memperluas" tipe data bawaan dari NextAuth
// untuk menyertakan properti kustom kita (id dan role)

declare module "next-auth" {
  /**
   * Tipe data yang dikembalikan oleh `useSession`, `getSession` dan diterima
   * oleh `SessionProvider` props.
   */
  interface Session {
    user: {
      /** Properti kustom yang kita tambahkan. */
      id: string;
      role: UserRole;
    } & DefaultSession["user"]; // & DefaultSession["user"] untuk mewarisi properti default (name, email, image)
  }

  /**
   * Tipe data untuk objek User yang diteruskan ke callback `authorize`
   */
  interface User extends DefaultUser {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  /** Tipe data untuk token JWT */
  interface JWT {
    id: string;
    role: UserRole;
  }
}
