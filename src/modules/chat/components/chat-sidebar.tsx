"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import UserButton from "@/modules/authentication/components/user-button";
import { PlusIcon, SearchIcon, EllipsisIcon, Trash } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, type MouseEvent } from "react";
import { isToday, isYesterday, isWithinInterval, subDays } from "date-fns";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { useGetChats, useDeleteChat } from "../hooks/use-chats";
import { Spinner } from "@/components/ui/spinner";

type ChatGroupKey = "today" | "yesterday" | "lastWeek" | "older";

type ChatMessageSummary = {
   content?: string | null;
};

type SidebarChat = {
   id: string;
   title: string;
   createdAt: Date | string;
   messages?: ChatMessageSummary[];
};

type ChatGroups = Record<ChatGroupKey, SidebarChat[]>;

interface ChatItemProps {
   chat: SidebarChat;
   isActive: boolean;
   onDelete: (event: MouseEvent<HTMLElement>, chatId: string) => void;
}

interface ChatGroupProps {
   label: string;
   chats: SidebarChat[];
   activeChatId: string | null;
   onDelete: (event: MouseEvent<HTMLElement>, chatId: string) => void;
}

interface ChatSidebarProps {
   user: {
      email: string;
   };
   chats?: SidebarChat[] | null;
}

function groupChatsByDate(chats?: SidebarChat[] | null): ChatGroups {
   const groups: ChatGroups = { today: [], yesterday: [], lastWeek: [], older: [] };
   const now = new Date();

   if (!chats || !Array.isArray(chats)) return groups;

   chats.forEach((chat: SidebarChat) => {
      try {
         const chatDate = chat.createdAt;
         const date =
            typeof chatDate === "string" ? new Date(chatDate) : chatDate;

         console.log(
            "Processing chat:",
            chat.id,
            "Date:",
            date,
            "createdAt:",
            chatDate,
         );

         if (isToday(date)) {
            groups.today.push(chat);
         } else if (isYesterday(date)) {
            groups.yesterday.push(chat);
         } else if (
            isWithinInterval(date, { start: subDays(now, 7), end: now })
         ) {
            groups.lastWeek.push(chat);
         } else {
            groups.older.push(chat);
         }
      } catch (error) {
         console.error("Error processing chat date:", error, chat);
         groups.older.push(chat);
      }
   });

   return groups;
}

const DATE_GROUPS: Array<{ key: ChatGroupKey; label: string }> = [
   { key: "today", label: "Today" },
   { key: "yesterday", label: "Yesterday" },
   { key: "lastWeek", label: "Last 7 Days" },
   { key: "older", label: "Older" },
];

function ChatItem({ chat, isActive, onDelete }: ChatItemProps) {
   return (
      <Link
         href={`/chat/${chat.id}`}
         className={cn(
            "flex items-center justify-between rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
            isActive && "bg-sidebar-accent",
         )}
      >
         <span className="truncate flex-1">{chat.title}</span>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 hover:bg-sidebar-accent-foreground/10"
                  onClick={(e) => e.preventDefault()}
               >
                  <EllipsisIcon className="h-4 w-4" />
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               <DropdownMenuItem
                  className="text-red-500 cursor-pointer"
                  onClick={(e) => onDelete(e, chat.id)}
               >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
               </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      </Link>
   );
}

function ChatGroup({ label, chats, activeChatId, onDelete }: ChatGroupProps) {
   if (chats.length === 0) return null;

   return (
      <div className="mb-4">
         <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
            {label}
         </div>
         {chats.map((chat) => (
            <ChatItem
               key={chat.id}
               chat={chat}
               isActive={chat.id === activeChatId}
               onDelete={onDelete}
            />
         ))}
      </div>
   );
}

const ChatSidebar = ({ user, chats: initialChats }: ChatSidebarProps) => {
   const { data: fetchedChats, isPending } = useGetChats();

   const normalizedChats = useMemo<SidebarChat[]>(() => {
      const sourceChats = initialChats ?? fetchedChats;
      if (!Array.isArray(sourceChats)) return [];
      return sourceChats as SidebarChat[];
   }, [initialChats, fetchedChats]);

   console.log("Fetched chats:", fetchedChats);
   const pathname = usePathname();
   const activeChatId = pathname?.startsWith("/chat/")
      ? pathname.split("/")[2]
      : null;
   const router = useRouter();
   const [searchQuery, setSearchQuery] = useState("");
   const deleteMutation = useDeleteChat();

   const filteredChats = useMemo<SidebarChat[]>(() => {
      if (!searchQuery) return normalizedChats;
      const query = searchQuery.toLowerCase();

      return normalizedChats.filter(
         (chat: SidebarChat) =>
            chat.title?.toLowerCase().includes(query) ||
            chat.messages?.some((msg: ChatMessageSummary) =>
               msg.content?.toLowerCase().includes(query),
            ),
      );
   }, [searchQuery, normalizedChats]);

   const groupedChats = useMemo(() => {
      const result = groupChatsByDate(filteredChats);
      console.log("Filtered chats:", filteredChats);
      console.log("Grouped chats:", result);
      return result;
   }, [filteredChats]);

   const handleDelete = (e: React.MouseEvent, chatId: string) => {
      e.preventDefault();
      e.stopPropagation();
      deleteMutation.mutate(chatId, {
         onSuccess: () => {
            if (activeChatId === chatId) {
               router.push("/");
            }
         },
      });
   };

   return (
      <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
         {/* Header */}
         <div className="flex items-center border-b border-sidebar-border px-4 py-3">
            <Image src="/logo.svg" alt="Logo" width={100} height={100} />
         </div>

         <div className="p-4">
            <Button asChild className="w-full">
               <Link href="/">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Chat
               </Link>
            </Button>
         </div>

         <div className="px-4 pb-4">
            <div className="relative">
               <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
               <Input
                  placeholder="Search your threads..."
                  className="pl-9 pr-8 bg-sidebar-accent border-sidebar-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />

               {searchQuery && (
                  <button
                     onClick={() => setSearchQuery("")}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                     ×
                  </button>
               )}
            </div>
         </div>

         <div className="flex-1 overflow-y-auto px-2">
            {isPending ? (
               <Spinner className="m-auto mt-8" />
            ) : filteredChats.length === 0 ? (
               <div className="text-center text-sm text-muted-foreground py-8">
                  {searchQuery ? "No chats found" : "No chats yet"}
               </div>
            ) : (
               DATE_GROUPS.map((group) => (
                  <ChatGroup
                     key={group.key}
                     label={group.label}
                     chats={groupedChats[group.key]}
                     activeChatId={activeChatId}
                     onDelete={handleDelete}
                  />
               ))
            )}
         </div>

         {/* Footer */}

         <div className="p-4 flex items-center gap-3 border-t border-sidebar-border">
            <UserButton user={user} />
            <span className="flex-1 text-sm text-sidebar-foreground truncate">
               {user.email}
            </span>
         </div>
      </div>
   );
};

export default ChatSidebar;
