/*
  Warnings:

  - Added the required column `date` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "date" TEXT NOT NULL;