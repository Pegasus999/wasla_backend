/*
  Warnings:

  - Changed the type of `pickUpLocationLatitude` on the `Trip` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `pickUpLocationLongtitude` on the `Trip` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `destinationLatitude` on the `Trip` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `destinationLongtitude` on the `Trip` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "pickUpLocationLatitude",
ADD COLUMN     "pickUpLocationLatitude" DOUBLE PRECISION NOT NULL,
DROP COLUMN "pickUpLocationLongtitude",
ADD COLUMN     "pickUpLocationLongtitude" DOUBLE PRECISION NOT NULL,
DROP COLUMN "destinationLatitude",
ADD COLUMN     "destinationLatitude" DOUBLE PRECISION NOT NULL,
DROP COLUMN "destinationLongtitude",
ADD COLUMN     "destinationLongtitude" DOUBLE PRECISION NOT NULL;
