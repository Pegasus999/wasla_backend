/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_taxiId_fkey";

-- AlterTable
ALTER TABLE "Trip" ALTER COLUMN "duration" DROP NOT NULL,
ALTER COLUMN "taxiId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Driver_phoneNumber_key" ON "Driver"("phoneNumber");

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_taxiId_fkey" FOREIGN KEY ("taxiId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
