-- CreateTable
CREATE TABLE "Listings" (
    "id" SERIAL NOT NULL,
    "jsonData" JSONB NOT NULL,

    CONSTRAINT "Listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agents" (
    "id" SERIAL NOT NULL,
    "jsonData" JSONB NOT NULL,

    CONSTRAINT "Agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offices" (
    "id" SERIAL NOT NULL,
    "jsonData" JSONB NOT NULL,

    CONSTRAINT "Offices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Openhouses" (
    "id" SERIAL NOT NULL,
    "jsonData" JSONB NOT NULL,

    CONSTRAINT "Openhouses_pkey" PRIMARY KEY ("id")
);
