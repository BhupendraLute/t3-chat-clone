"use client";
import Modal from "@/components/ui/modal";
import { useDeleteChat } from "@/modules/chat/hooks/use-chats";

import React from "react";
import { toast } from "sonner";

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  chatId?: string | null;
  onDeleted?: (chatId: string) => void;
};

const DeleteChatModel: React.FC<Props> = ({
  isModalOpen,
  setIsModalOpen,
  chatId,
  onDeleted,
}) => {
  const { mutateAsync, isPending } = useDeleteChat();

  const handleDelete = async () => {
    if (!chatId) {
      toast.error("No chat selected");
      return;
    }

    try {
      await mutateAsync(chatId);
      toast.success("Chat deleted successfully");
      setIsModalOpen(false);
      onDeleted?.(chatId);
    } catch (error) {
      toast.error("Failed to delete Chat");
      console.error("Failed to delete Chat:", error);
    }
  };

  return (
    <Modal
      title="Delete Chat"
      description="Are you sure you want to delete this Chat? This action cannot be undone."
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSubmit={handleDelete}
      submitText={isPending ? "Deleting..." : "Delete"}
      submitVariant="destructive"
    >
      <p className="text-sm text-zinc-500">
        Once deleted, all requests and data in this Chat will be permanently removed.
      </p>
    </Modal>
  );
};

export default DeleteChatModel;