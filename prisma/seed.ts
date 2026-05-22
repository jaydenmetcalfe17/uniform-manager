import { PrismaClient, Prisma } from "../src/generated/prisma/client";

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
        catalog: "Red shell jacket",
        size: "S",
        code: "24888S19"
    }
];

async function main() {
    for (const e of employeeData) {
        await prisma.employee.create({ data: e });
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