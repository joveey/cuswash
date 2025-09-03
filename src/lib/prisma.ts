import { PrismaClient } from '@prisma/client'

// Deklarasikan tipe untuk prisma di globalThis agar TypeScript tidak error.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Gunakan globalThis yang kompatibel dengan Node.js dan Edge Runtime.
const prisma = globalThis.prisma || new PrismaClient()

// Hanya simpan instance di environment pengembangan untuk mencegah koneksi berlebih.
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export default prisma;
