/*
  Warnings:

  - You are about to drop the column `category` on the `FixedExpense` table. All the data in the column will be lost.
  - You are about to drop the column `dueDay` on the `FixedExpense` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `FixedExpense` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `expenseKind` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Transaction` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monthlySalary" REAL NOT NULL DEFAULT 0,
    "salaryDay" INTEGER NOT NULL DEFAULT 27,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FixedExpense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_FixedExpense" ("amount", "createdAt", "id", "name") SELECT "amount", "createdAt", "id", "name" FROM "FixedExpense";
DROP TABLE "FixedExpense";
ALTER TABLE "new_FixedExpense" RENAME TO "FixedExpense";
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Transaction" ("amount", "createdAt", "date", "id", "title") SELECT "amount", "createdAt", "date", "id", "title" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
