/*
  Warnings:

  - You are about to drop the column `authorId` on the `Message` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VisaType" AS ENUM ('work', 'spouse', 'student', 'tourist', 'extension', 'asylum', 'other');

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_authorId_fkey";

-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "originCountry" TEXT,
ADD COLUMN     "visaType" "VisaType";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "authorId",
ADD COLUMN     "senderUserId" TEXT;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
