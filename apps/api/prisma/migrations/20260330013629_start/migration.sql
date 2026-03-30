-- CreateEnum
CREATE TYPE "GroupRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "MarketStatus" AS ENUM ('OPEN', 'CLOSED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "PositionSide" AS ENUM ('YES', 'NO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "auth0UserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "joinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "role" "GroupRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Market" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "description" TEXT,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "resolvesAt" TIMESTAMP(3),
    "status" "MarketStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" BOOLEAN,
    "liquidityPool" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Market_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "side" "PositionSide" NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_auth0UserId_key" ON "User"("auth0UserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyGroup_joinCode_key" ON "FamilyGroup"("joinCode");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMembership_userId_groupId_key" ON "GroupMembership"("userId", "groupId");

-- CreateIndex
CREATE INDEX "Position_marketId_idx" ON "Position"("marketId");

-- CreateIndex
CREATE INDEX "Position_userId_idx" ON "Position"("userId");

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "FamilyGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "FamilyGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
