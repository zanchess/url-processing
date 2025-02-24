-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('NEW', 'PROCESSING', 'DONE', 'ERROR');

-- CreateTable
CREATE TABLE "url_processing" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL,
    "http_code" INTEGER,

    CONSTRAINT "url_processing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "url_processing_status_idx" ON "url_processing"("status");

-- CreateIndex
CREATE INDEX "url_processing_http_code_idx" ON "url_processing"("http_code");

COMMIT;

INSERT INTO "url_processing" ("url", "status", "http_code") VALUES
('https://google.com', 'NEW', NULL),
('https://reddit.com', 'NEW', NULL);
