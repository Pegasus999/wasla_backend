/*
  Warnings:

  - Added the required column `latitude` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longtitude` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Driver` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "iDriver" AS ENUM ('taxi', 'tow');

-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longtitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "type" "iDriver" NOT NULL;
