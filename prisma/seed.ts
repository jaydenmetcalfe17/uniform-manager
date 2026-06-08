import { PrismaClient, Prisma } from "../src/generated/prisma";
import bcrypt from "bcryptjs"

const prisma = new PrismaClient();

const employeeData: Prisma.EmployeeCreateInput[] = [
    {
        id: 191,
        firstName: "Jayden",
        lastName: "Metcalfe",
        email: "jayden10.9@gmail.com",
        phone: "7058880831",
    }
];

const catalogueData: Prisma.CatalogueCreateInput[] = [
    {
        piece: "Black raincoat",
    },
    {
        piece: "Regular snowpants",
    },
    {
        piece: "Bib snowpants",
    },
    {
        piece: "Black puffy midlayer jacket",
    },
    {
        piece: "Red shell jacket",
    },
    {
        piece: "Red insulated jacket",
    },
    {
        piece: "Black shell jacket"
    }
];

const itemData: Prisma.ItemCreateInput[] = [
  {
    catalogue: {
      connect: { piece: "Red shell jacket" }
    },
    size: "S",
    code: "24888S19"
  }
];

async function main() {
    for (const e of employeeData) {
        await prisma.employee.upsert({
            where: { id: e.id },
            update: {},
            create: e,
        });
    }
    for (const c of catalogueData) {
        await prisma.catalogue.upsert({
            where: { piece: c.piece },
            update: {},
            create: c,
        });
    }
    for (const i of itemData) {
        await prisma.item.upsert({
            where: { code: i.code },
            update: {},
            create: i,
        });
    }

    const existingPassword = await prisma.password.findFirst()
    if (!existingPassword) {
        const hash = await bcrypt.hash(process.env.INITIAL_PASSWORD!, 12)
        await prisma.password.create({ data: { hash } })
        console.log("Password seeded.")
    }

    console.log("Seeding done.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

// npx prisma db seed