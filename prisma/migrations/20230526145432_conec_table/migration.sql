-- CreateTable
CREATE TABLE "conec" (
    "id" SERIAL NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,


    CONSTRAINT "conec_pkey" PRIMARY KEY ("id")
);
