/*
  Warnings:

  - You are about to drop the column `catalogId` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the `Catalog` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `catalogueId` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_catalogId_fkey";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "catalogId",
ADD COLUMN     "catalogueId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Catalog";

-- CreateTable
CREATE TABLE "Catalogue" (
    "id" SERIAL NOT NULL,
    "piece" TEXT NOT NULL,

    CONSTRAINT "Catalogue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Catalogue_piece_key" ON "Catalogue"("piece");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_catalogueId_fkey" FOREIGN KEY ("catalogueId") REFERENCES "Catalogue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
