import Header from "@/components/header";
import { requireAuth } from "@/modules/authentication/actions";
import ChatSidebar from "@/modules/chat/components/chat-sidebar";
import React from "react";
import { getAllChats } from "../../modules/chat/actions";

const Layout = async ({ children }: { children: React.ReactNode }) => {
   const session = await requireAuth();

   const { data: chats } = await getAllChats();

   return (
      <div className="flex h-screen overflow-hidden">
         <ChatSidebar user={session?.user} chats={chats} />
         <main className="flex-1 overflow-hidden">
            <Header />
            {children}
         </main>
      </div>
   );
};

export default Layout;
