-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "memberCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipantCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "responses" TEXT,
    "scores" TEXT,
    "submittedAt" TIMESTAMP(3),
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "assessmentId" TEXT NOT NULL,

    CONSTRAINT "ParticipantCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamReport" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "teamScore" DOUBLE PRECISION NOT NULL,
    "baseScore" DOUBLE PRECISION NOT NULL,
    "consistencyFactor" DOUBLE PRECISION NOT NULL,
    "penaltyFactor" DOUBLE PRECISION NOT NULL,
    "standardDeviation" DOUBLE PRECISION NOT NULL,
    "dimensionScores" TEXT NOT NULL,
    "participationCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "leaderName" TEXT NOT NULL,
    "leaderEmail" TEXT NOT NULL,
    "leaderPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SummaryReport" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "leaderName" TEXT NOT NULL,
    "leaderEmail" TEXT NOT NULL,
    "reportPeriod" TEXT,
    "totalTeams" INTEGER NOT NULL,
    "completedTeams" INTEGER NOT NULL,
    "pendingTeams" INTEGER NOT NULL,
    "averageTeamScore" DOUBLE PRECISION NOT NULL,
    "highestScore" DOUBLE PRECISION NOT NULL,
    "lowestScore" DOUBLE PRECISION NOT NULL,
    "scoreStdDev" DOUBLE PRECISION NOT NULL,
    "dimensionAverages" TEXT NOT NULL,
    "teamComparisons" TEXT NOT NULL,
    "insights" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "generatedBy" TEXT NOT NULL,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),

    CONSTRAINT "SummaryReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParticipantCode_code_key" ON "ParticipantCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TeamReport_assessmentId_key" ON "TeamReport"("assessmentId");

-- CreateIndex
CREATE INDEX "Organization_parentId_idx" ON "Organization"("parentId");

-- CreateIndex
CREATE INDEX "Organization_leaderEmail_idx" ON "Organization"("leaderEmail");

-- CreateIndex
CREATE UNIQUE INDEX "SummaryReport_organizationId_key" ON "SummaryReport"("organizationId");

-- CreateIndex
CREATE INDEX "SummaryReport_organizationId_idx" ON "SummaryReport"("organizationId");

-- CreateIndex
CREATE INDEX "SummaryReport_createdAt_idx" ON "SummaryReport"("createdAt");

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantCode" ADD CONSTRAINT "ParticipantCode_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamReport" ADD CONSTRAINT "TeamReport_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SummaryReport" ADD CONSTRAINT "SummaryReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
