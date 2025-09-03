import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // Hapus data lama (opsional, tapi bagus untuk pengujian ulang)
  await prisma.carType.deleteMany();
  console.log('Deleted old car types.');

  // Buat data CarType yang baru
  await prisma.carType.createMany({
    data: [
      { name: 'Sedan', price: 75000 },
      { name: 'SUV', price: 100000 },
      { name: 'MPV', price: 90000 },
      { name: 'Hatchback', price: 70000 },
    ],
  });

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

