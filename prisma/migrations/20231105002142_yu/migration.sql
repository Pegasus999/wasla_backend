/*
  Warnings:

  - Changed the type of `latitudee` on the `Shop` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `longtitude` on the `Shop` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "latitudee",
ADD COLUMN     "latitudee" DOUBLE PRECISION NOT NULL,
DROP COLUMN "longtitude",
ADD COLUMN     "longtitude" DOUBLE PRECISION NOT NULL;
