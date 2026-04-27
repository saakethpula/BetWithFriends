ALTER TABLE "FamilyGroup"
ADD COLUMN "minBet" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "maxBet" INTEGER NOT NULL DEFAULT 100000;

ALTER TABLE "Market"
ADD COLUMN "resolutionOutcomeId" TEXT;

CREATE TABLE "MarketOutcome" (
  "id" TEXT NOT NULL,
  "marketId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MarketOutcome_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MarketOutcome_marketId_sortOrder_key"
ON "MarketOutcome"("marketId", "sortOrder");

CREATE INDEX "MarketOutcome_marketId_idx"
ON "MarketOutcome"("marketId");

ALTER TABLE "MarketOutcome"
ADD CONSTRAINT "MarketOutcome_marketId_fkey"
FOREIGN KEY ("marketId") REFERENCES "Market"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Position"
ADD COLUMN "outcomeId" TEXT;

ALTER TABLE "Position"
ALTER COLUMN "side" DROP NOT NULL;

CREATE INDEX "Position_outcomeId_idx"
ON "Position"("outcomeId");

ALTER TABLE "Position"
ADD CONSTRAINT "Position_outcomeId_fkey"
FOREIGN KEY ("outcomeId") REFERENCES "MarketOutcome"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Market"
ADD CONSTRAINT "Market_resolutionOutcomeId_fkey"
FOREIGN KEY ("resolutionOutcomeId") REFERENCES "MarketOutcome"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "MarketOutcome" ("id", "marketId", "label", "sortOrder")
SELECT 'legacy_yes_' || "id", "id", 'YES', 0
FROM "Market";

INSERT INTO "MarketOutcome" ("id", "marketId", "label", "sortOrder")
SELECT 'legacy_no_' || "id", "id", 'NO', 1
FROM "Market";

UPDATE "Position"
SET "outcomeId" = CASE
  WHEN "side" = 'YES' THEN 'legacy_yes_' || "marketId"
  WHEN "side" = 'NO' THEN 'legacy_no_' || "marketId"
  ELSE NULL
END;

UPDATE "Market"
SET "resolutionOutcomeId" = CASE
  WHEN "resolution" = true THEN 'legacy_yes_' || "id"
  WHEN "resolution" = false THEN 'legacy_no_' || "id"
  ELSE NULL
END;
