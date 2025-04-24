-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Completion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assignmentId" INTEGER NOT NULL,
    "studentName" TEXT NOT NULL,
    "dateCompleted" DATETIME NOT NULL,
    "notes" TEXT NOT NULL,
    CONSTRAINT "Completion_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Completion" ("assignmentId", "dateCompleted", "id", "notes", "studentName") SELECT "assignmentId", "dateCompleted", "id", "notes", "studentName" FROM "Completion";
DROP TABLE "Completion";
ALTER TABLE "new_Completion" RENAME TO "Completion";
CREATE TABLE "new_RSVP" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "userName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "attendance" TEXT NOT NULL DEFAULT 'MAYBE',
    CONSTRAINT "RSVP_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RSVP" ("attendance", "email", "eventId", "id", "userName") SELECT "attendance", "email", "eventId", "id", "userName" FROM "RSVP";
DROP TABLE "RSVP";
ALTER TABLE "new_RSVP" RENAME TO "RSVP";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
