/*
  Warnings:

  - You are about to drop the column `taxiId` on the `Trip` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_taxiId_fkey";

-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "taxiId",
ADD COLUMN     "driverId" TEXT;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
