import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   createChatWithMessage,
   deleteChat,
   getAllChats,
   getChatById,
} from "../actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useGetChats = () => {
   return useQuery({
      queryKey: ["chats"],
      queryFn: async () => {
         const res = await getAllChats();
         return res.success ? (res.data ?? []) : [];
      },
   });
};

export const useGetChatById = (chatId: string) => {
   return useQuery({
      queryKey: ["chats", chatId],
      queryFn: () => getChatById(chatId),
   });
};

export const useCreateChat = () => {
   const queryClient = useQueryClient();
   const router = useRouter();

   return useMutation({
      mutationFn: createChatWithMessage,
      onSuccess: (res: any) => {
         if (res.success && res.data) {
            queryClient.invalidateQueries({ queryKey: ["chats"] });
            router.push(`/chat/${res.data.id}?autoTrigger=true`);
         }
      },
      onError: (error: Error) => {
         console.error("Create chat error:", error);
         toast.error("Failed to create chat");
      },
   });
};

export const useDeleteChat = () => {
   const queryClient = useQueryClient();
   const router = useRouter();

   return useMutation({
      mutationFn: (chatId: string) => deleteChat(chatId),
      onSuccess: (_data, variables) => {
         // Invalidate both the single-chat and the chats list so UI refreshes
         if (variables) {
            queryClient.invalidateQueries({ queryKey: ["chats", variables as string] });
         }
         queryClient.invalidateQueries({ queryKey: ["chats"] });
      },
      onError: () => {
         toast.error("Failed to delete chat");
      },
   });
};
