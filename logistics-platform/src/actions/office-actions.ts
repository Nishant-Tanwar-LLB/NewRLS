"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createOfficeAction(formData: FormData) {
  const name = formData.get("name") as string;
  const city = formData.get("city") as string;
  const zoneId = formData.get("zoneId") as string;

  if (!name || !city || !zoneId) return;

  await prisma.office.create({
    data: {
      name,
      city,
      zoneId
    }
  });

  // Refresh the page so the new office appears instantly
  revalidatePath("/dashboard/offices");
}