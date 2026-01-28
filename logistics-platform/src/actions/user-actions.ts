"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth"; // <--- NEW IMPORT
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // <--- NEW IMPORT

const prisma = new PrismaClient();

export async function createUserAction(formData: FormData) {
  // 1. GET THE CURRENT LOGGED IN USER (The Boss hiring someone)
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return;

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!currentUser) return;

  // 2. GET FORM DATA
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  let role = formData.get("role") as any;
  let department = formData.get("department") as any;
  let officeId = formData.get("officeId") as string;

  // --- 3. APPLY "THE RULE OF POWER" ---

  if (currentUser.role !== "SUPER_ADMIN") {
    // If it's a Department Head, they stay in their department...
    // BUT they are allowed to assign ANY Office (because they manage the whole operation)

    if (currentUser.role === "DEPT_HEAD") {
      // 1. Lock Department to their own (e.g., Head Ops -> Operations)
      department = currentUser.department;

      // 2. Allow them to use the officeId from the form (Do not overwrite it!)
      // (No code needed here, we just use the 'officeId' variable from the form)
    } else {
      // If it is a LOWER Manager (e.g., Office Manager), LOCK them to their own office
      if (currentUser.officeId) {
        officeId = currentUser.officeId;
      }
      department = currentUser.department;
    }
  }

  // 4. SAVE TO DB
  if (!name || !email || !password || !role || !department) return;

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      department,
      officeId: officeId || null,
    },
  });

  revalidatePath("/dashboard/users");
}
