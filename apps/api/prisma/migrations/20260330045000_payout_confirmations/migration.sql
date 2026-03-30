CREATE TYPE "PayoutConfirmationStatus" AS ENUM (
  'PENDING_CREATOR',
  'PENDING_RECIPIENT',
  'DISPUTED',
  'CONFIRMED'
);

ALTER TABLE "Market"
ADD COLUMN "payoutsFinalizedAt" TIMESTAMP(3);

CREATE TABLE "MarketPayoutConfirmation" (
  "id" TEXT NOT NULL,
  "marketId" TEXT NOT NULL,
  "recipientUserId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "status" "PayoutConfirmationStatus" NOT NULL DEFAULT 'PENDING_CREATOR',
  "creatorMarkedAt" TIMESTAMP(3),
  "recipientRespondedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MarketPayoutConfirmation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MarketPayoutConfirmation_marketId_recipientUserId_key" ON "MarketPayoutConfirmation"("marketId", "recipientUserId");
CREATE INDEX "MarketPayoutConfirmation_marketId_idx" ON "MarketPayoutConfirmation"("marketId");
CREATE INDEX "MarketPayoutConfirmation_recipientUserId_idx" ON "MarketPayoutConfirmation"("recipientUserId");

ALTER TABLE "MarketPayoutConfirmation"
ADD CONSTRAINT "MarketPayoutConfirmation_marketId_fkey"
FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MarketPayoutConfirmation"
ADD CONSTRAINT "MarketPayoutConfirmation_recipientUserId_fkey"
FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
