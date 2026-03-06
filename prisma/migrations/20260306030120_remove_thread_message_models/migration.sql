/*
  Warnings:

  - You are about to drop the `message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `thread` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_threadId_fkey";

-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_userId_fkey";

-- DropForeignKey
ALTER TABLE "thread" DROP CONSTRAINT "thread_createdById_fkey";

-- DropTable
DROP TABLE "message";

-- DropTable
DROP TABLE "thread";

-- DropEnum
DROP TYPE "MessageRole";
