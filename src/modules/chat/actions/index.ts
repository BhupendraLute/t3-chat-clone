"use server";

import { MessageRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { currentUser } from "@/modules/authentication/actions";
import { revalidatePath } from "next/cache";

interface ICreateChatWithMessage {
   content: string;
   model: string;
}

export async function createChatWithMessage({
   content,
   model,
}: ICreateChatWithMessage) {
   try {
      const user = await currentUser();

      if (!user) {
         return { success: false, message: "Unauthoeized!" };
      }

      const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");

      const chat = await prisma.chat.create({
         data: {
            title,
            model,
            userId: user?.id,
            messages: {
               create: {
                  content,
                  model,
                  messageRole: MessageRole.USER,
                  messageType: "NORMAL",
               },
            },
         },
         include: {
            messages: true,
         },
      });

      revalidatePath("/", "page");
      return { success: true, data: chat };
   } catch (error) {
      console.log(error);
      return { success: false, message: "Failed to create chat!" };
   }
}

export async function getAllChats() {
   try {
      const user = await currentUser();

      if (!user) {
         return { success: false, message: "Unauthoeized!" };
      }

      const chats = await prisma.chat.findMany({
         where: {
            userId: user?.id,
         },
         include: {
            messages: true,
         },
         orderBy: {
            createdAt: "desc",
         },
      });

      if (!chats) return { success: false, message: "No chats found!" };

      return { success: true, data: chats };
   } catch (error) {
      console.log(error);
      return { success: false, message: "Failed to get chats!" };
   }
}

export async function getChatById(chatId: string) {
   try {
      const user = await currentUser();

      if (!user) {
         return { success: false, message: "Unauthoeized!" };
      }

      const chat = await prisma.chat.findUnique({
         where: {
            id: chatId,
         },
         include: {
            messages: true,
         },
      });

      if (!chat)
         return { success: false, message: "This chat does not exist!" };

      return { success: true, data: chat };
   } catch (error) {
      console.log(error);
      return { success: false, message: "Failed to get chat!" };
   }
}

export async function deleteChat(chatId: string) {
   try {
      const user = await currentUser();

      if (!user) {
         return { success: false, message: "Unauthoeized!" };
      }

      const chat = await prisma.chat.delete({
         where: {
            id: chatId,
            userId: user?.id,
         },
      });

      if (!chat)
         return {
            success: false,
            message: "This chat does not exist or already deleted!",
         };

      revalidatePath("/", "page");
      return { success: true };
   } catch (error) {
      console.log(error);
      return { success: false, message: "Failed to delete chat!" };
   }
}
