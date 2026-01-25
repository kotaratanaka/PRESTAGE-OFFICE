import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Send, Building2, Search, MoreVertical, Paperclip, ChevronDown, ChevronRight, Hash, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { ChatChannel, CostCategory, VendorQuote } from '../types';

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

// Mock Data Linked to Estimates
const mockEstimatesData: Record<string, VendorQuote> = {
  'c1': { 
    vendorName: '株式会社エレテック', 
    amount: 480000, 
    selected: true, 
    isSubmitted: true, 
    submissionDate: '2023/10/26',
    fileName: 'estimate_eletech_v2.pdf',
    details: [
       { name: '配線工事一式', amount: 250000 },
       { name: 'スイッチ・コンセント器具', amount: 150000 },
       { name: '諸経費', amount: 80000 }
    ]
  },
  'c2': { 
    vendorName: 'ビル管理空調サービス', 
    amount: 750000, 
    selected: true, 
    isSubmitted: true,
    submissionDate: '2023/10/27',
    fileName: 'estimate_hvac.pdf',
    details: [
       { name: '業務用エアコン本体', amount: 450000 },
       { name: '設置工事費', amount: 200000 },
       { name: '配管部材', amount: 100000 }
    ]
  },
  'c3': { 
    vendorName: 'オカムラ施工', 
    amount: 1250000, 
    selected: true, 
    isSubmitted: true,
    submissionDate: '2023/10/25',
    fileName: 'okamura_partition.pdf',
    details: [
       { name: 'ガラスパーティション', amount: 800000 },
       { name: '施工費（夜間）', amount: 350000 },
       { name: '運搬費', amount: 100000 }
    ]
  },
  'c4': { 
    vendorName: 'ネットワンシステムズ', 
    amount: 0, 
    selected: false, 
    isSubmitted: false // 未提出
  },
  'c5': { 
    vendorName: 'アート引越センター', 
    amount: 0, 
    selected: false, 
    isSubmitted: false // 未提出
  }
};

const mockProjectGroups: ProjectGroup[] = [
  {
    id: 'p1',
    name: '渋谷区S邸 リノベーション',
    channels: [
      { id: 'c1', category: CostCategory.Electrical, vendorName: '株式会社エレテック', lastMessage: '見積書の修正版をお送りします。', unreadCount: 2, estimateId: 'c1' },
      { id: 'c2', category: CostCategory.HVAC, vendorName: 'ビル管理空調サービス', lastMessage: '現場調査の日程について', unreadCount: 0, estimateId: 'c2' },
    ]
  },
  {
    id: 'p2',
    name: '港区オフィス改修',
    channels: [
      { id: 'c3', category: CostCategory.Partition, vendorName: 'オカムラ施工', lastMessage: '承知いたしました。', unreadCount: 0, estimateId: 'c3' },
      { id: 'c4', category: CostCategory.Network, vendorName: 'ネットワンシステムズ', lastMessage: 'LAN配線図の確認をお願いします', unreadCount: 3, estimateId: 'c4' },
    ]
  },
  {
    id: 'p3',
    name: '横浜K邸 キッチン改装',
    channels: [
      { id: 'c5', category: CostCategory.Moving, vendorName: 'アート引越センター', lastMessage: '廃棄物の量について教えてください', unreadCount: 0, estimateId: 'c5' },
    ]
  }
];

const ChatPage: React.FC = () => {
  const [activeChannelId, setActiveChannelId] = useState<string>('c1');
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({'p1': true, 'p2': true, 'p3': false});
  const [input, setInput] = useState('');
  const [showEstimatePanel, setShowEstimatePanel] = useState(true); // Right sidebar toggle
  
  // Flatten mock messages for demo
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    'c1': [
      { role: 'model', text: 'お世話になっております。株式会社エレテックの田中です。\n先日ご依頼いただいた渋谷区S邸の電気工事見積もりについてご連絡いたしました。', timestamp: '10:00' },
      { role: 'user', text: '田中様\nお世話になります。見積もり拝見しました。コンセント増設の箇所ですが、図面のB案でお願いできますでしょうか？', timestamp: '10:05' },
      { role: 'model', text: '承知いたしました。B案（書斎側へ2箇所追加）で再計算し、本日中に再提出いたします。', timestamp: '10:15' },
      { role: 'model', text: '修正した見積書をアップロードしました。ご確認ください。', timestamp: '10:30' }
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
  const activeEstimate = activeChannel?.estimateId ? mockEstimatesData[activeChannel.estimateId] : null;

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
      
      {/* Left Sidebar (Project > Channels) */}
      <div className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col text-gray-300 flex-shrink-0">
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
      <div className="flex-1 flex flex-col bg-white min-w-0">
         {/* Chat Header */}
         <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shadow-sm z-10 flex-shrink-0">
            <div className="flex items-center truncate">
               <div className="mr-4 text-right hidden lg:block">
                  <p className="text-xs text-gray-400">プロジェクト</p>
                  <p className="text-sm font-bold text-gray-800 truncate max-w-[200px]">{activeGroup?.name}</p>
               </div>
               <div className="h-8 w-px bg-gray-200 mx-2 hidden lg:block"></div>
               <div className="flex items-center">
                   <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <Building2 className="w-5 h-5" />
                   </div>
                   <div>
                      <h2 className="font-bold text-gray-800 truncate">{activeChannel?.vendorName}</h2>
                      <p className="text-xs text-gray-500 badge badge-ghost">{activeChannel?.category}</p>
                   </div>
               </div>
            </div>
            <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowEstimatePanel(!showEstimatePanel)}
                  className={`p-2 rounded-lg transition-colors ${showEstimatePanel ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
                  title="見積もり詳細を表示"
                >
                   <FileText className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-gray-600 p-2">
                   <MoreVertical className="w-5 h-5" />
                </button>
            </div>
         </div>

         {/* Messages */}
         <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
            {currentMessages.map((msg, idx) => (
               <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[85%] sm:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
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
         <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
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

      {/* Right Sidebar: Estimate & Contract Status */}
      {showEstimatePanel && (
        <div className="w-80 bg-white border-l border-gray-200 shadow-xl overflow-y-auto flex-shrink-0 animate-slideInRight">
           <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-700 flex items-center">
                 <FileText className="w-4 h-4 mr-2 text-blue-600" />
                 見積・契約ステータス
              </h3>
              <button onClick={() => setShowEstimatePanel(false)} className="text-gray-400 hover:text-gray-600">
                 <X className="w-4 h-4" />
              </button>
           </div>
           
           <div className="p-4">
              {activeEstimate ? (
                 <div className="space-y-6">
                    {/* Status Card */}
                    <div className={`p-4 rounded-xl border ${
                       activeEstimate.isSubmitted 
                       ? activeEstimate.selected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                       : 'bg-orange-50 border-orange-200'
                    }`}>
                       <p className="text-xs text-gray-500 mb-1">現在のステータス</p>
                       <div className="flex items-center space-x-2">
                          {activeEstimate.isSubmitted ? (
                             activeEstimate.selected ? (
                                <>
                                   <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                   <span className="font-bold text-blue-700">採用・契約済</span>
                                </>
                             ) : (
                                <>
                                   <FileText className="w-5 h-5 text-gray-600" />
                                   <span className="font-bold text-gray-700">提出済み・検討中</span>
                                </>
                             )
                          ) : (
                             <>
                                <AlertCircle className="w-5 h-5 text-orange-500" />
                                <span className="font-bold text-orange-600">見積提出待ち</span>
                             </>
                          )}
                       </div>
                       
                       {activeEstimate.isSubmitted && (
                          <div className="mt-4 pt-4 border-t border-gray-200/50">
                             <p className="text-xs text-gray-500">見積総額 (税抜)</p>
                             <p className="text-2xl font-bold text-gray-900">¥{activeEstimate.amount.toLocaleString()}</p>
                             <div className="mt-2 text-xs flex items-center text-blue-600 cursor-pointer hover:underline">
                                <Paperclip className="w-3 h-3 mr-1" />
                                {activeEstimate.fileName}
                             </div>
                          </div>
                       )}
                    </div>

                    {/* Breakdown Details */}
                    {activeEstimate.isSubmitted && activeEstimate.details && (
                       <div>
                          <h4 className="text-sm font-bold text-gray-800 mb-3">見積内訳</h4>
                          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                             {activeEstimate.details.map((item, idx) => (
                                <div key={idx} className="flex justify-between px-3 py-2 text-sm border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                   <span className="text-gray-600">{item.name}</span>
                                   <span className="font-mono text-gray-800">¥{item.amount.toLocaleString()}</span>
                                </div>
                             ))}
                          </div>
                       </div>
                    )}
                    
                    {/* Actions */}
                    <div className="space-y-2">
                       {activeEstimate.isSubmitted && !activeEstimate.selected && (
                          <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm">
                             この見積もりを採用する
                          </button>
                       )}
                       <button className="w-full py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50">
                          詳細画面で開く
                       </button>
                    </div>
                 </div>
              ) : (
                 <div className="text-center py-10 text-gray-400">
                    <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>関連する見積もり情報がありません</p>
                 </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;