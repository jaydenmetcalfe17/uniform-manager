-- AlterTable
CREATE SEQUENCE employee_id_seq;
ALTER TABLE "Employee" ALTER COLUMN "id" SET DEFAULT nextval('employee_id_seq'),
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;
ALTER SEQUENCE employee_id_seq OWNED BY "Employee"."id";
