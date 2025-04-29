/*
  Warnings:

  - You are about to drop the `_StudentAssignments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_StudentAssignments";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "StudentAssignment" (
    "studentId" INTEGER NOT NULL,
    "assignmentId" INTEGER NOT NULL,

    PRIMARY KEY ("studentId", "assignmentId"),
    CONSTRAINT "StudentAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentAssignment_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
