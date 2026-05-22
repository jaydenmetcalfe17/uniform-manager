import { PrismaClient, Prisma } from "../src/generated/prisma";

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

const catalogData: Prisma.CatalogCreateInput[] = [
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
    catalog: {
      connect: { piece: "Red shell jacket" }  // connects to existing Catalog record
    },
    size: "S",
    code: "24888S19"
  }
];

async function main() {
    for (const e of employeeData) {
        await prisma.employee.create({ data: e });
    }
    for (const c of catalogData) {
        await prisma.catalog.create({ data: c });
    }
    for (const i of itemData) {
        await prisma.item.create({ data: i });
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