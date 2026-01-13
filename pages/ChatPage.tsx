import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Send, Building2, Search, MoreVertical, Paperclip, ChevronDown, ChevronRight, Hash } from 'lucide-react';
import { ChatChannel, CostCategory } from '../types';

interface Message {
  role: 'user' | 'model'; 
  text: string;
  timestamp: string;
}

// Mock Project Group structure
interface ProjectGroup {
  id: string;
  name: string;
  channels: ChatChannel[];
}

const mockProjectGroups: ProjectGroup[] = [
  {
    id: 'p1',
    name: '渋谷区S邸 リノベーション',
    channels: [
      { id: 'c1', category: CostCategory.Electrical, vendorName: '株式会社エレテック', lastMessage: '見積書の修正版をお送りします。', unreadCount: 2 },
      { id: 'c2', category: CostCategory.HVAC, vendorName: 'ビル管理空調サービス', lastMessage: '現場調査の日程について', unreadCount: 0 },
    ]
  },
  {
    id: 'p2',
    name: '港区オフィス改修',
    channels: [
      { id: 'c3', category: CostCategory.Partition, vendorName: 'オカムラ施工', lastMessage: '承知いたしました。', unreadCount: 0 },
      { id: 'c4', category: CostCategory.Network, vendorName: 'ネットワンシステムズ', lastMessage: 'LAN配線図の確認をお願いします', unreadCount: 3 },
    ]
  },
  {
    id: 'p3',
    name: '横浜K邸 キッチン改装',
    channels: [
      { id: 'c5', category: CostCategory.Moving, vendorName: 'アート引越センター', lastMessage: '廃棄物の量について教えてください', unreadCount: 0 },
    ]
  }
];

const ChatPage: React.FC = () => {
  const [activeChannelId, setActiveChannelId] = useState<string>('c1');
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({'p1': true, 'p2': true, 'p3': false});
  const [input, setInput] = useState('');
  
  // Flatten mock messages for demo
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    'c1': [
      { role: 'model', text: 'お世話になっております。株式会社エレテックの田中です。\n先日ご依頼いただいた渋谷区S邸の電気工事見積もりについてご連絡いたしました。', timestamp: '10:00' },
      { role: 'user', text: '田中様\nお世話になります。見積もり拝見しました。コンセント増設の箇所ですが、図面のB案でお願いできますでしょうか？', timestamp: '10:05' },
      { role: 'model', text: '承知いたしました。B案（書斎側へ2箇所追加）で再計算し、本日中に再提出いたします。', timestamp: '10:15' }
    ],
  });
  
  // Helper to find current channel info
  const findActiveChannelInfo = () => {
    for (const group of mockProjectGroups) {
      const channel = group.channels.find(c => c.id === activeChannelId);
      if (channel) return { group, channel };
    }
    return { group: mockProjectGroups[0], channel: mockProjectGroups[0].channels[0] };
  };
  
  const { group: activeGroup, channel: activeChannel } = findActiveChannelInfo();
  const currentMessages = messages[activeChannelId] || [];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  const chatSessionRef = useRef<Chat | null>(null);

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => ({...prev, [projectId]: !prev[projectId]}));
  };

  const getChatSession = () => {
    if (!chatSessionRef.current) {
        const apiKey = process.env.API_KEY || '';
        const ai = new GoogleGenAI({ apiKey });
        chatSessionRef.current = ai.chats.create({
            model: 'gemini-3-flash-preview', 
            config: {
                systemInstruction: `あなたは建設プロジェクトの協力会社（${activeChannel?.category}担当の${activeChannel?.vendorName}）の担当者です。`,
            }
        });
    }
    return chatSessionRef.current;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    chatSessionRef.current = null; 
  }, [activeChannelId, messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    const now = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    setInput('');
    setMessages(prev => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), { role: 'user', text: userMessage, timestamp: now }]
    }));
    
    setIsTyping(true);

    try {
      const chat = getChatSession();
      const resultStream = await chat.sendMessageStream({ message: userMessage });
      
      let fullResponseText = '';
      setMessages(prev => ({
        ...prev,
        [activeChannelId]: [...(prev[activeChannelId] || []), { role: 'model', text: '', timestamp: '...' }]
      }));

      for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
             fullResponseText += c.text;
             setMessages(prev => {
                const msgs = [...(prev[activeChannelId] || [])];
                const lastMsg = msgs[msgs.length - 1];
                if (lastMsg.role === 'model') {
                    lastMsg.text = fullResponseText;
                    lastMsg.timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                }
                return { ...prev, [activeChannelId]: msgs };
             });
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* Sidebar (Project > Channels) */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col text-gray-300">
        <div className="p-4 border-b border-gray-800 bg-gray-900">
          <h2 className="text-lg font-bold text-white mb-4">プロジェクト連絡</h2>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
             <input 
               type="text" 
               placeholder="案件、業者名で検索" 
               className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
             />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
           {mockProjectGroups.map((project) => (
             <div key={project.id} className="border-b border-gray-800/50">
               <button 
                 onClick={() => toggleProject(project.id)}
                 className="w-full flex items-center justify-between p-3 hover:bg-gray-800 transition-colors text-left"
               >
                 <div className="flex items-center overflow-hidden">
                    {expandedProjects[project.id] ? <ChevronDown className="w-4 h-4 mr-2 text-gray-500" /> : <ChevronRight className="w-4 h-4 mr-2 text-gray-500" />}
                    <span className="font-bold text-sm text-gray-200 truncate">{project.name}</span>
                 </div>
               </button>
               
               {expandedProjects[project.id] && (
                 <div className="bg-gray-800/30 pb-2">
                   {project.channels.map(channel => (
                     <div 
                       key={channel.id}
                       onClick={() => setActiveChannelId(channel.id)}
                       className={`pl-9 pr-4 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-800 transition-colors ${activeChannelId === channel.id ? 'bg-blue-900/30 text-blue-400 border-r-2 border-blue-500' : 'text-gray-400'}`}
                     >
                       <div className="flex items-center overflow-hidden">
                          <Hash className="w-3 h-3 mr-2 opacity-50 flex-shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-medium truncate">{channel.vendorName}</p>
                            <p className="text-[10px] opacity-70 truncate">{channel.category}</p>
                          </div>
                       </div>
                       {channel.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 rounded-full">{channel.unreadCount}</span>
                       )}
                     </div>
                   ))}
                 </div>
               )}
             </div>
           ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
         {/* Chat Header */}
         <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shadow-sm z-10">
            <div className="flex items-center">
               <div className="mr-4 text-right hidden sm:block">
                  <p className="text-xs text-gray-400">プロジェクト</p>
                  <p className="text-sm font-bold text-gray-800">{activeGroup?.name}</p>
               </div>
               <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>
               <div className="flex items-center">
                   <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-3">
                      <Building2 className="w-5 h-5" />
                   </div>
                   <div>
                      <h2 className="font-bold text-gray-800">{activeChannel?.vendorName}</h2>
                      <p className="text-xs text-gray-500 badge badge-ghost">{activeChannel?.category}</p>
                   </div>
               </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
               <MoreVertical className="w-5 h-5" />
            </button>
         </div>

         {/* Messages */}
         <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
            {currentMessages.map((msg, idx) => (
               <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                     {msg.role !== 'user' && (
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                           <Building2 className="w-4 h-4 text-gray-600" />
                        </div>
                     )}
                     <div>
                        <div className={`px-4 py-2 rounded-2xl shadow-sm whitespace-pre-wrap text-sm ${
                           msg.role === 'user' 
                           ? 'bg-blue-600 text-white rounded-br-none' 
                           : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                        }`}>
                           {msg.text}
                        </div>
                        <p className={`text-[10px] text-gray-400 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                           {msg.timestamp}
                        </p>
                     </div>
                  </div>
               </div>
            ))}
            {isTyping && (
               <div className="flex justify-start">
                   <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-200 ml-10">
                       <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                       </div>
                   </div>
               </div>
            )}
            <div ref={messagesEndRef} />
         </div>

         {/* Input Area */}
         <div className="p-4 bg-white border-t border-gray-200">
            <div className="relative flex items-center">
               <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Paperclip className="w-5 h-5" />
               </button>
               <textarea
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyDown={handleKeyDown}
                   placeholder="メッセージを入力..."
                   className="flex-1 mx-2 p-3 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none text-sm"
                   rows={1}
               />
               <button 
                   onClick={handleSend}
                   disabled={!input.trim() || isTyping}
                   className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                   <Send className="w-5 h-5" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ChatPage;