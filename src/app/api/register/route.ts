import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcryptjs from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    // MODIFY: Destructure phoneNumber from the request body
    const { name, email, password, phoneNumber } = await req.json();

    // MODIFY: Add phoneNumber to the validation check
    if (!name || !email || !password || !phoneNumber) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 } // 409 Conflict
      );
    }

    // Enkripsi password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Simpan pengguna baru ke database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber, // ADD: Save the phoneNumber to the database
      },
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: { id: newUser.id, name: newUser.name, email: newUser.email },
      },
      { status: 201 } // 201 Created
    );
  } catch (error) {
    console.error("REGISTRATION_ERROR", error);
    return NextResponse.json(
      { error: "An internal error occurred" },
      { status: 500 }
    );
  }
}
