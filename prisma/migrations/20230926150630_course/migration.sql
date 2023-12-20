/*
  Warnings:

  - Added the required column `curso` to the `person` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "person" ADD COLUMN     "curso" TEXT NOT NULL;
