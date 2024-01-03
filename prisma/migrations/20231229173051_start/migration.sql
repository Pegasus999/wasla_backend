-- CreateEnum
CREATE TYPE "iDriver" AS ENUM ('taxi', 'tow');

-- CreateEnum
CREATE TYPE "State" AS ENUM ('complete', 'canceled', 'ongoing');

-- CreateEnum
CREATE TYPE "ShopType" AS ENUM ('carwash', 'mechanic', 'tollier');

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Places" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" TEXT NOT NULL,
    "longtitude" TEXT NOT NULL,
    "clientId" TEXT,

    CONSTRAINT "Places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longtitude" DOUBLE PRECISION NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "driverLicense" TEXT NOT NULL,
    "registeration" TEXT NOT NULL,
    "wilaya" INTEGER NOT NULL,
    "carBrand" TEXT NOT NULL,
    "carName" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "type" "iDriver" NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "duration" TEXT,
    "pickUpLocationLatitude" DOUBLE PRECISION NOT NULL,
    "pickUpLocationLongtitude" DOUBLE PRECISION NOT NULL,
    "date" TEXT NOT NULL,
    "destinationLatitude" DOUBLE PRECISION NOT NULL,
    "destinationLongtitude" DOUBLE PRECISION NOT NULL,
    "cost" INTEGER NOT NULL,
    "canceledBy" TEXT,
    "state" "State" NOT NULL DEFAULT 'ongoing',
    "driverId" TEXT,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longtitude" DOUBLE PRECISION NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL,
    "ownerFullName" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "wilaya" INTEGER NOT NULL,
    "type" "ShopType" NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_phoneNumber_key" ON "Client"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_phoneNumber_key" ON "Driver"("phoneNumber");

-- AddForeignKey
ALTER TABLE "Places" ADD CONSTRAINT "Places_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
