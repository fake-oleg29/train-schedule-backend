/*
  Warnings:

  - A unique constraint covering the columns `[trainNumber]` on the table `Train` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Train_trainNumber_key" ON "Train"("trainNumber");
