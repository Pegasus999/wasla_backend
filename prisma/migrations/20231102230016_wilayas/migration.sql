/*
  Warnings:

  - Changed the type of `wilaya` on the `Driver` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "wilaya",
ADD COLUMN     "wilaya" INTEGER NOT NULL;
