import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const carTypes = await prisma.carType.findMany();
    return NextResponse.json(carTypes);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data jenis mobil" },
      { status: 500 }
    );
  }
}

