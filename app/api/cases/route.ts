import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
  const session = await getServerSession(getAuthOptions());

  // 1. Authentication Check: Ensure user is logged in with a valid role.
  if (!session?.user?.id || !session?.user?.role) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: userId, role } = session.user;
  const prisma = await getPrisma();

  // 2. Authorization Logic: Dynamically build the database query based on user role.
  let whereClause = {};

  if (role === Role.CLIENT) {
    // Clients can only see cases where they are the client.
    whereClause = { clientId: userId };
  } else if (role === Role.STAFF) {
    // Staff can see cases where they are either the case manager OR the lawyer.
    whereClause = {
      OR: [
        { caseManagerId: userId },
        { lawyerId: userId },
      ],
    };
  } else if (role === Role.ADMIN) {
    // Admins can see all cases, so the where clause remains empty.
    whereClause = {};
  } else {
    // If the role is unknown, return no cases for security.
    return NextResponse.json({ cases: [] });
  }

  // 3. Database Query: Fetch cases using the secure where clause.
  try {
    const cases = await prisma.case.findMany({
      where: whereClause,
      include: {
        client: { select: { name: true, email: true } },
        caseManager: { select: { name: true } },
        lawyer: { select: { name: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json({ cases });
  } catch (error) {
    console.error("Failed to fetch cases:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
