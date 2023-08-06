-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "i_createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "i_updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "shortcode" TEXT,
    "description" TEXT,
    "comments" INTEGER,
    "likes" INTEGER,
    "attachmentIds" TEXT[],
    "authorId" TEXT,
    "i_createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "i_updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "handle" TEXT,
    "username" TEXT,
    "avatarUrl" TEXT,
    "i_createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "i_updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_shortcode_idx" ON "Post"("shortcode");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
