/*
  Warnings:

  - A unique constraint covering the columns `[eventId,email]` on the table `RSVP` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RSVP_eventId_email_key" ON "RSVP"("eventId", "email");
