-- CreateTable
CREATE TABLE "public"."todos" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);
