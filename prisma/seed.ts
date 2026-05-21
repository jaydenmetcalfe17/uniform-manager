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