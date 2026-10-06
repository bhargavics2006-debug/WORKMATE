import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Users,
  Search,
  Paperclip,
  Smile,
  AlertTriangle,
  Trash2,
  CheckCheck,
  ShieldAlert,
  Clock,
  Sparkles,
  Phone,
  FileText,
} from 'lucide-react';
import { useWorkmate } from '../../context/WorkmateContext';
import { ChatRoom, ChatMessage } from '../../types';

export const ChatView: React.FC = () => {
  const {
    chatRooms,
    chatMessages,
    activeChatRoomId,
    setActiveChatRoomId,
    sendChatMessage,
    clearChatRoom,
    startDirectChat,
    users,
    settings,
  } = useWorkmate();

  const [inputText, setInputText] = useState('');
  const [isEmergencyToggle, setIsEmergencyToggle] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeRoom = chatRooms.find(r => r.id === activeChatRoomId) || chatRooms[0];
  const roomMessages = chatMessages.filter(m => m.roomId === activeRoom?.id);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages.length, activeChatRoomId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    sendChatMessage(
      activeRoom.id,
      inputText,
      isEmergencyToggle,
      attachedFile || undefined
    );

    setInputText('');
    setIsEmergencyToggle(false);
    setAttachedFile(null);
    setShowEmojiPicker(false);
  };

  const handleAttachMockFile = () => {
    const mockFiles = [
      'Site_Safety_Inspection.pdf',
      'Structural_Column_Photo.jpg',
      'Delivery_Challan_4401.pdf',
      'Foundation_Grid_Drawing.dwg',
    ];
    const picked = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    setAttachedFile(picked);
  };

  const commonEmojis = ['👍', '👷', '🏗️', '✅', '⚠️', '🚨', '📦', '🔨', '⚡', '💧'];

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-20 lg:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-amber-400" />
            Team Operations Chat
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time crew messaging, shift coordination, and emergency safety alerts
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {users.filter(u => u.isOnline).length} Crew Online
          </span>
        </div>
      </div>

      {/* Main Chat Layout (Split screen on desktop, compact on mobile) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Sidebar: Channels & Users (4 cols) */}
        <div className="md:col-span-4 border-r border-slate-800 bg-slate-900/95 flex flex-col justify-between">
          <div>
            {/* Search Box */}
            <div className="p-3 border-b border-slate-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchUserQuery}
                  onChange={e => setSearchUserQuery(e.target.value)}
                  placeholder="Search crew or channels..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Channels & Chat Rooms */}
            <div className="p-2 space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Channels & Groups
              </div>
              {chatRooms.map(room => {
                const isActive = room.id === activeRoom.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => setActiveChatRoomId(room.id)}
                    className={`w-full text-left p-2.5 rounded-2xl transition flex items-center justify-between ${
                      isActive
                        ? 'bg-amber-500/20 border border-amber-500/40 text-white'
                        : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center space-x-1.5">
                        <Users className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                        <span className="font-extrabold text-xs truncate">{room.name}</span>
                      </div>
                      {room.lastMessage && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {room.lastMessage}
                        </p>
                      )}
                    </div>
                    {room.lastMessageTime && (
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {room.lastMessageTime}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Crew Members List with Online Status */}
            <div className="p-2 space-y-1 border-t border-slate-800/80">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Site Personnel
              </div>
              {filteredUsers.map(u => (
                <div
                  key={u.id}
                  className="p-2 rounded-xl hover:bg-slate-800/60 transition flex items-center justify-between text-xs group"
                >
                  <button
                    onClick={() => startDirectChat(u)}
                    className="flex items-center space-x-2.5 text-left flex-1 min-w-0"
                    title={`Start direct chat with ${u.name}`}
                  >
                    <div className="relative shrink-0">
                      <div className={`w-7 h-7 rounded-lg ${u.avatarColor} text-white font-black text-xs flex items-center justify-center`}>
                        {u.name.slice(0, 1)}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                          u.isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                        }`}
                      />
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-white leading-tight truncate group-hover:text-amber-400 transition">{u.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{u.role}</div>
                    </div>
                  </button>

                  <div className="flex items-center space-x-1 shrink-0 ml-2">
                    <button
                      onClick={() => startDirectChat(u)}
                      className="p-1 text-slate-400 hover:text-amber-400 transition"
                      title={`Message ${u.name}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={`tel:${u.phone}`}
                      className="p-1 text-slate-400 hover:text-emerald-400 transition"
                      title={`Call ${u.name}`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Signed in as: <b>{settings.currentUser?.name}</b></span>
            <span className="text-amber-400 font-bold">{settings.currentUser?.role}</span>
          </div>
        </div>

        {/* Right Area: Messages & Input (8 cols) */}
        <div className="md:col-span-8 flex flex-col justify-between bg-slate-950/60">
          {/* Channel Header */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                #
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">{activeRoom.name}</h3>
                <span className="text-[11px] text-slate-400">
                  {activeRoom.participantIds.length} members connected
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (confirm(`Clear messages in ${activeRoom.name}?`)) {
                  clearChatRoom(activeRoom.id);
                }
              }}
              className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition"
              title="Clear room history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          </div>

          {/* Messages Stream */}
          <div className="p-4 overflow-y-auto max-h-[460px] min-h-[380px] space-y-3 text-xs">
            {roomMessages.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
                <p>No messages yet in this channel. Send the first message below!</p>
              </div>
            ) : (
              roomMessages.map(msg => {
                const isMe = msg.senderId === (settings.currentUser?.id || 'usr-admin');
                const isEmergency = msg.isEmergency;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {/* Author & Timestamp */}
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 px-1 mb-1">
                      <span className="font-bold text-slate-300">{msg.senderName}</span>
                      <span>({msg.senderRole})</span>
                      <span>•</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl transition-all shadow-sm ${
                        isEmergency
                          ? 'bg-red-950 border border-red-500 text-red-100 font-bold animate-pulse'
                          : isMe
                          ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                          : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
                      }`}
                    >
                      {isEmergency && (
                        <div className="flex items-center space-x-1.5 text-red-300 text-[11px] font-black uppercase mb-1">
                          <ShieldAlert className="w-4 h-4 text-red-400" />
                          <span>Emergency Broadcast</span>
                        </div>
                      )}

                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                      {msg.attachmentName && (
                        <div className="mt-2 p-2 rounded-xl bg-black/20 flex items-center space-x-2 text-[11px] font-bold">
                          <FileText className="w-3.5 h-3.5" />
                          <span className="truncate">{msg.attachmentName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input & Action Bar */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
            {/* Attachment preview if active */}
            {attachedFile && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800 text-xs">
                <div className="flex items-center space-x-1.5 text-amber-400 font-semibold truncate">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span className="truncate">Attached: {attachedFile}</span>
                </div>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="text-slate-400 hover:text-white ml-2 text-xs"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Quick emoji strip */}
            {showEmojiPicker && (
              <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-800/80 overflow-x-auto text-base">
                {commonEmojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setInputText(prev => prev + emoji)}
                    className="hover:scale-125 transition p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition"
                title="Insert emoji"
              >
                <Smile className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleAttachMockFile}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition"
                title="Attach file / blueprint"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Emergency High-Priority Toggle */}
              <button
                type="button"
                onClick={() => setIsEmergencyToggle(!isEmergencyToggle)}
                className={`p-2 rounded-xl transition flex items-center space-x-1 text-xs font-bold ${
                  isEmergencyToggle
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-slate-800 text-slate-400 hover:text-red-400'
                }`}
                title="Tag as emergency safety alert"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">SOS</span>
              </button>

              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={isEmergencyToggle ? 'Type URGENT emergency message...' : 'Message crew...'}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              <button
                type="submit"
                disabled={!inputText.trim() && !attachedFile}
                className={`p-2 rounded-xl font-bold transition flex items-center justify-center shrink-0 ${
                  isEmergencyToggle
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
