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
    "phoneNumber" TEXT NOT NULL,
    "driverLicense" TEXT NOT NULL,
    "registeration" TEXT NOT NULL,
    "wilaya" TEXT NOT NULL,
    "carBrand" TEXT NOT NULL,
    "carName" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "pickUpLocationLatitude" TEXT NOT NULL,
    "pickUpLocationLongtitude" TEXT NOT NULL,
    "destinationLatitude" TEXT NOT NULL,
    "destinationLongtitude" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "taxiId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitudee" TEXT NOT NULL,
    "longtitude" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL,
    "ownerFullName" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "type" "ShopType" NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Places" ADD CONSTRAINT "Places_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_taxiId_fkey" FOREIGN KEY ("taxiId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
