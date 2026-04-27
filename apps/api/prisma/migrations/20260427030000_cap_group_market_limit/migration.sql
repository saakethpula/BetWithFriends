UPDATE "FamilyGroup"
SET "maxBet" = 15
WHERE "maxBet" > 15;

ALTER TABLE "FamilyGroup"
ALTER COLUMN "maxBet" SET DEFAULT 15;
