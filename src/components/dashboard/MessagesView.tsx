"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User as UserIcon, Loader, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Message {
  _id: string;
  content: string;
  sender: { _id: string; name: string };
  receiver: { _id: string; name: string };
  property: { _id: string; title: string };
  createdAt: string;
}

export function MessagesView({ currentUserId }: { currentUserId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeUser]);

  useEffect(() => {
    if (!activeUser) return;
    const relatedMsg = messages.find(m => m.sender?._id === activeUser || m.receiver?._id === activeUser);
    if (!relatedMsg || !relatedMsg.property) return;

    fetch("/api/messages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: activeUser,
        propertyId: relatedMsg.property._id,
      }),
    }).then(res => {
      if (res.ok) {
        // Silently decrement count or refresh messages to update UI
      }
    }).catch(err => console.error("Error marking messages as read:", err));
  }, [activeUser, messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages.reverse());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeUser) return;
    
    const relatedMsg = messages.find(m => m.sender._id === activeUser || m.receiver._id === activeUser);
    if (!relatedMsg) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: relatedMsg.property._id,
          receiverId: activeUser,
          content: replyText
        })
      });

      if (res.ok) {
        setReplyText("");
        await fetchMessages();
      } else {
         alert("Message could not be sent.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><Loader className="mx-auto animate-spin" /></div>;
  }

  const conversations = new Map<string, { user: { _id: string, name: string }, msgs: Message[] }>();
  
  messages.forEach(msg => {
    if (!msg.sender || !msg.receiver || !msg.property) return;
    const otherUser = msg.sender._id === currentUserId ? msg.receiver : msg.sender;
    if (!otherUser || !otherUser._id) return;
    if (!conversations.has(otherUser._id)) {
      conversations.set(otherUser._id, { user: otherUser, msgs: [] });
    }
    conversations.get(otherUser._id)!.msgs.push(msg);
  });

  const conversationList = Array.from(conversations.values()).sort((a, b) => {
    const lastA = new Date(a.msgs[a.msgs.length - 1].createdAt).getTime();
    const lastB = new Date(b.msgs[b.msgs.length - 1].createdAt).getTime();
    return lastB - lastA;
  });

  if (conversationList.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500">
        <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-4" />
        <p>You have no messages at this time.</p>
      </div>
    );
  }

  const activeThread = activeUser ? conversations.get(activeUser)?.msgs || [] : [];

  return (
    <div className="flex h-[calc(100vh-140px)] rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="w-1/3 border-r border-slate-200 overflow-y-auto bg-slate-50">
        {conversationList.map(({ user, msgs }) => {
          const lastMsg = msgs[msgs.length - 1];
          return (
            <button
              key={user._id}
              onClick={() => setActiveUser(user._id)}
              className={`w-full text-left p-4 flex items-center gap-3 border-b border-slate-100 transition ${
                activeUser === user._id ? "bg-sky-100" : "hover:bg-slate-100"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0c3d6e] text-white font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-sm truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{lastMsg.property.title}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col bg-white">
        {activeUser ? (
          <>
            <div className="p-4 border-b border-slate-200 bg-white flex items-center gap-3 shadow-sm z-10">
               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0c3d6e] text-white font-bold">
                  {conversations.get(activeUser)?.user.name.charAt(0).toUpperCase()}
                </div>
               <p className="font-semibold">{conversations.get(activeUser)?.user.name}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {activeThread.map(msg => {
                const isMe = msg.sender._id === currentUserId;
                return (
                  <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isMe ? "bg-[#0c3d6e] text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? "text-sky-200" : "text-slate-400"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-[#0c3d6e]"
              />
              <Button type="submit" disabled={!replyText.trim() || sending} className="px-4">
                {sending ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            Please select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
