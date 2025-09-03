import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // Hapus data lama (opsional)
  await prisma.operatingHour.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.carType.deleteMany();

  // 1. Seed Car Types (seperti sebelumnya)
  await prisma.carType.createMany({
    data: [
      { name: 'Sedan', price: 75000 },
      { name: 'SUV', price: 100000 },
      { name: 'MPV', price: 90000 },
      { name: 'Hatchback', price: 70000 },
    ],
  });
  console.log('Seeded car types.');

  // 2. Seed Operating Hours (Senin - Sabtu, 08:00 - 17:00)
  await prisma.operatingHour.createMany({
    data: [
      { dayOfWeek: 1, openTime: '08:00', closeTime: '17:00' }, // Senin
      { dayOfWeek: 2, openTime: '08:00', closeTime: '17:00' }, // Selasa
      { dayOfWeek: 3, openTime: '08:00', closeTime: '17:00' }, // Rabu
      { dayOfWeek: 4, openTime: '08:00', closeTime: '17:00' }, // Kamis
      { dayOfWeek: 5, openTime: '08:00', closeTime: '17:00' }, // Jumat
      { dayOfWeek: 6, openTime: '08:00', closeTime: '12:00' }, // Sabtu
    ],
  });
  console.log('Seeded operating hours.');

  // 3. Seed Time Slots (dari jam 8 pagi sampai 4 sore, kapasitas 2 mobil/slot)
  const slots = [];
  for (let hour = 8; hour < 17; hour++) {
    slots.push({ time: `${hour.toString().padStart(2, '0')}:00`, capacity: 2 });
  }
  await prisma.timeSlot.createMany({
    data: slots,
  });
  console.log('Seeded time slots.');

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
