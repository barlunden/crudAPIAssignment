/*
  Warnings:

  - You are about to drop the `_AssignmentToStudent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `assignedToStudent` on the `Assignment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[eventName]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[songName]` on the table `Song` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_AssignmentToStudent_B_index";

-- DropIndex
DROP INDEX "_AssignmentToStudent_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_AssignmentToStudent";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_StudentAssignments" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_StudentAssignments_A_fkey" FOREIGN KEY ("A") REFERENCES "Assignment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_StudentAssignments_B_fkey" FOREIGN KEY ("B") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Assignment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL
);
INSERT INTO "new_Assignment" ("description", "dueDate", "id", "title") SELECT "description", "dueDate", "id", "title" FROM "Assignment";
DROP TABLE "Assignment";
ALTER TABLE "new_Assignment" RENAME TO "Assignment";
CREATE TABLE "new_Completion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "assignmentId" INTEGER NOT NULL,
    "dateCompleted" DATETIME NOT NULL,
    "notes" TEXT NOT NULL,
    CONSTRAINT "Completion_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Completion_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Completion" ("assignmentId", "dateCompleted", "id", "notes", "studentId") SELECT "assignmentId", "dateCompleted", "id", "notes", "studentId" FROM "Completion";
DROP TABLE "Completion";
ALTER TABLE "new_Completion" RENAME TO "Completion";
CREATE UNIQUE INDEX "Completion_studentId_assignmentId_key" ON "Completion"("studentId", "assignmentId");
CREATE TABLE "new_Student" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL
);
INSERT INTO "new_Student" ("id", "name") SELECT "id", "name" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_StudentAssignments_AB_unique" ON "_StudentAssignments"("A", "B");

-- CreateIndex
CREATE INDEX "_StudentAssignments_B_index" ON "_StudentAssignments"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Event_eventName_key" ON "Event"("eventName");

-- CreateIndex
CREATE UNIQUE INDEX "Song_songName_key" ON "Song"("songName");
