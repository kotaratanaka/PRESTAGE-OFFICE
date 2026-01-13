import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProjectStatus, CostCategory, EstimateItem } from '../types';
import { ArrowLeft, Box, LayoutTemplate, Calculator, CheckCircle2, ChevronRight, Download, Users, RefreshCw, Camera, XCircle, Aperture, ScanLine } from 'lucide-react';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'scan' | 'design' | 'estimate'>('scan');
  
  // Camera/Scan State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Mock data
  const project = {
    id: id || '1',
    name: '渋谷区S邸 リノベーション',
    clientName: '佐藤 様',
    address: '東京都渋谷区神宮前 1-1-1',
    status: ProjectStatus.Planning,
    date: '2023-10-25',
    description: '築20年のマンションリノベーション。LDKの拡張と、書斎の設置がメインの要望。北欧スタイルを希望。'
  };

  const estimates: EstimateItem[] = [
    {
      id: 'e1',
      category: CostCategory.Electrical,
      aiEstimate: 450000,
      vendorQuotes: [
        { vendorName: '株式会社エレテック', amount: 480000, selected: true },
        { vendorName: '渋谷電気工事', amount: 520000, selected: false },
      ]
    },
    {
      id: 'e2',
      category: CostCategory.HVAC,
      aiEstimate: 800000,
      vendorQuotes: [
        { vendorName: 'ビル管理空調サービス', amount: 750000, selected: true },
      ]
    },
    {
      id: 'e3',
      category: CostCategory.Partition,
      aiEstimate: 1200000,
      vendorQuotes: [
        { vendorName: 'コマニー代理店', amount: 1150000, selected: false },
        { vendorName: 'オカムラ施工', amount: 1250000, selected: true },
      ]
    },
     {
      id: 'e4',
      category: CostCategory.Network,
      aiEstimate: 300000,
      vendorQuotes: [] // まだ見積もりなし
    },
  ];

  const totalAiEstimate = estimates.reduce((sum, item) => sum + item.aiEstimate, 0);
  const totalSelectedQuote = estimates.reduce((sum, item) => {
    const selected = item.vendorQuotes.find(q => q.selected);
    return sum + (selected ? selected.amount : 0);
  }, 0);

  // Scan simulation
  useEffect(() => {
    let interval: number;
    if (isScanning) {
      interval = window.setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            setIsScanning(false);
            setHasScanned(true);
            setIsCameraActive(false);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const startScan = () => {
    setIsScanning(true);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden relative">
      
      {/* Camera Overlay */}
      {isCameraActive && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col">
          <div className="flex justify-between items-center p-6 text-white bg-gradient-to-b from-black/80 to-transparent">
             <button onClick={() => setIsCameraActive(false)} className="p-2 bg-white/10 rounded-full"><XCircle className="w-8 h-8" /></button>
             <span className="font-bold tracking-wider">{isScanning ? 'スキャン中...' : 'LiDAR スキャン待機'}</span>
             <div className="w-10"></div>
          </div>
          
          <div className="flex-1 relative overflow-hidden">
             {/* Fake Camera Feed Background */}
             <div className="absolute inset-0 bg-gray-800">
                <div className="w-full h-full opacity-50 bg-[radial-gradient(circle,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                {/* Simulated Room Edges */}
                <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-blue-500/50 transform perspective-1000 rotate-x-12"></div>
             </div>

             {/* Scanning Overlay */}
             {isScanning && (
                <div className="absolute inset-0 z-10">
                   <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_20px_rgba(0,255,0,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                   <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full text-green-400 font-mono">
                      {scanProgress}% - 点群データ取得中...
                   </div>
                   {/* Random Points appearing */}
                   <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75"></div>
                </div>
             )}
             
             {/* LiDAR Grid */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <ScanLine className="w-64 h-64 text-white/30 stroke-1" />
             </div>
          </div>

          <div className="h-32 bg-black flex items-center justify-center space-x-10">
             {!isScanning && (
               <button 
                 onClick={startScan}
                 className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:bg-white/10 transition-colors"
               >
                 <div className="w-16 h-16 bg-red-600 rounded-full"></div>
               </button>
             )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex-none">
        <div className="flex items-center justify-between mb-2">
          <Link to="/projects" className="inline-flex items-center text-gray-500 hover:text-gray-800 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            案件一覧
          </Link>
          <div className="flex items-center space-x-2">
             <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-medium">{project.status}</span>
             <span className="text-gray-400 text-xs">ID: #{project.id.padStart(4, '0')}</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{project.clientName} | {project.address}</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-8 flex-none">
        <div className="flex space-x-8">
          <button 
            onClick={() => setActiveTab('scan')}
            className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center ${activeTab === 'scan' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Box className="w-4 h-4 mr-2" />
            1. LiDARスキャン・3Dモデル
          </button>
          <button 
            onClick={() => setActiveTab('design')}
            className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center ${activeTab === 'design' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutTemplate className="w-4 h-4 mr-2" />
            2. レイアウト・パース
          </button>
          <button 
            onClick={() => setActiveTab('estimate')}
            className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center ${activeTab === 'estimate' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Calculator className="w-4 h-4 mr-2" />
            3. 見積もり・業者選定
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        
        {/* Tab 1: LiDAR & 3D Model */}
        {activeTab === 'scan' && (
          <div className="h-full flex flex-col">
            {!hasScanned ? (
               <div className="flex-1 flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-xl p-10">
                  <div className="max-w-md text-center">
                     <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Aperture className="w-12 h-12 text-blue-600" />
                     </div>
                     <h3 className="text-2xl font-bold text-gray-800 mb-2">LiDARスキャンを開始</h3>
                     <p className="text-gray-500 mb-8">
                        現地の各部屋をスキャンして3Dモデルを作成します。<br/>
                        カメラを起動して部屋全体をゆっくり見回してください。
                     </p>
                     <button 
                       onClick={() => setIsCameraActive(true)}
                       className="w-full bg-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center"
                     >
                        <Camera className="w-6 h-6 mr-3" />
                        カメラを起動してスキャン
                     </button>
                     <p className="mt-4 text-xs text-gray-400">※ LiDARセンサー搭載の端末を推奨</p>
                  </div>
               </div>
            ) : (
               <>
                <div className="bg-gray-900 rounded-xl flex-1 relative overflow-hidden shadow-inner border border-gray-700 group">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Mock 3D View */}
                    <div className="text-center opacity-50">
                        <Box className="w-24 h-24 text-blue-400 mx-auto mb-4 animate-pulse" />
                        <p className="text-blue-200 text-lg font-mono">3D POINT CLOUD PROCESSED</p>
                        <p className="text-gray-400 text-sm mt-2">生成された3Dモデルを表示中</p>
                    </div>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
                  </div>
                  
                  <div className="absolute bottom-6 left-6 flex space-x-4">
                    <div className="bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm text-sm border border-gray-700">
                        <span className="text-gray-400 text-xs block">ステータス</span>
                        <span className="font-bold text-green-400">生成完了</span>
                    </div>
                    <div className="bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm text-sm border border-gray-700">
                        <span className="text-gray-400 text-xs block">ポイント数</span>
                        2,450,100 pts
                    </div>
                  </div>
                  <div className="absolute top-6 right-6">
                     <button onClick={() => {setHasScanned(false); setScanProgress(0);}} className="text-white/50 hover:text-white text-xs flex items-center bg-black/50 px-3 py-1 rounded-full">
                        <RefreshCw className="w-3 h-3 mr-1" /> 再スキャン
                     </button>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => setActiveTab('design')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center shadow-lg transition-transform hover:-translate-y-0.5"
                  >
                    3Dモデルからレイアウト生成へ
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
               </>
            )}
          </div>
        )}

        {/* Tab 2: Layout & Perspective */}
        {activeTab === 'design' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                   <LayoutTemplate className="w-5 h-5 mr-2 text-blue-600" />
                   2D レイアウト図面 (自動生成)
                </h3>
                <div className="flex-1 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200 flex items-center justify-center relative">
                   <div className="text-center">
                      <LayoutTemplate className="w-16 h-16 text-blue-300 mx-auto mb-2" />
                      <p className="text-blue-800 font-bold">Generated Floor Plan</p>
                   </div>
                   {/* Mock drawing lines */}
                   <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100">
                      <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-900" />
                      <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-blue-900" />
                      <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" className="text-blue-900" />
                   </svg>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
                   <div className="flex items-center">
                      <Box className="w-5 h-5 mr-2 text-purple-600" />
                      3D パース (Gemini Pro生成)
                   </div>
                   <Link to="/ai-generate" className="text-purple-600 text-sm hover:underline flex items-center">
                      <RefreshCw className="w-3 h-3 mr-1" /> 再生成
                   </Link>
                </h3>
                <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden relative group">
                   <img 
                     src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                     alt="Interior Perspective" 
                     className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                   />
                   <div className="absolute bottom-4 right-4">
                      <button className="bg-white text-gray-800 px-3 py-1.5 rounded-lg shadow text-xs font-bold hover:bg-gray-100 flex items-center">
                         <Download className="w-3 h-3 mr-1" /> 保存
                      </button>
                   </div>
                </div>
                <div className="mt-4 flex justify-end">
                   <button 
                     onClick={() => setActiveTab('estimate')}
                     className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center shadow transition-colors"
                   >
                     見積もり算出へ
                     <ChevronRight className="w-4 h-4 ml-2" />
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* Tab 3: Estimates & Vendors */}
        {activeTab === 'estimate' && (
          <div className="flex flex-col h-full">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 flex-none">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">AI 概算総額</p>
                  <p className="text-3xl font-bold text-gray-400">¥{totalAiEstimate.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-2">過去の類似案件データに基づく算出</p>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 ring-2 ring-blue-50">
                  <p className="text-sm text-blue-600 font-bold mb-1">業者見積もり総額 (選択中)</p>
                  <p className="text-3xl font-bold text-gray-800">¥{totalSelectedQuote.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                     <span className={`text-xs font-bold px-2 py-0.5 rounded ${totalSelectedQuote > totalAiEstimate ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        AI概算比 {totalSelectedQuote > totalAiEstimate ? '+' : ''}{Math.round(((totalSelectedQuote - totalAiEstimate) / totalAiEstimate) * 100)}%
                     </span>
                  </div>
               </div>
               <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white">
                  <p className="text-sm text-green-100 mb-1">ステータス</p>
                  <p className="text-2xl font-bold mb-2">業者選定中</p>
                  <p className="text-xs text-green-100 opacity-90">
                     全7カテゴリー中、4カテゴリーの見積もりが提出されています。
                  </p>
               </div>
            </div>

            {/* Estimates Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1">
               <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 flex items-center">
                     <Users className="w-5 h-5 mr-2 text-gray-500" />
                     カテゴリー別 相見積もり状況
                  </h3>
                  <button className="text-blue-600 text-sm font-medium hover:underline">
                     全カテゴリー一括見積依頼
                  </button>
               </div>
               
               <div className="overflow-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase sticky top-0">
                       <tr>
                          <th className="px-6 py-4 font-medium border-b border-gray-200 w-1/5">工事区分</th>
                          <th className="px-6 py-4 font-medium border-b border-gray-200 w-1/5 bg-gray-50/50">AI 簡易算出額</th>
                          <th className="px-6 py-4 font-medium border-b border-gray-200 w-2/5">業者見積もり (選択)</th>
                          <th className="px-6 py-4 font-medium border-b border-gray-200 w-1/5 text-right">アクション</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {estimates.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                             <td className="px-6 py-4">
                                <span className="font-bold text-gray-800">{item.category}</span>
                             </td>
                             <td className="px-6 py-4 bg-gray-50/30">
                                <span className="text-gray-500">¥{item.aiEstimate.toLocaleString()}</span>
                             </td>
                             <td className="px-6 py-4">
                                {item.vendorQuotes.length > 0 ? (
                                   <div className="space-y-2">
                                      {item.vendorQuotes.map((quote, idx) => (
                                         <div 
                                           key={idx} 
                                           className={`flex items-center justify-between p-2 rounded-lg border ${quote.selected ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-gray-200 border-dashed opacity-70'}`}
                                         >
                                            <div className="flex items-center">
                                               {quote.selected && <CheckCircle2 className="w-4 h-4 text-blue-600 mr-2" />}
                                               <span className={`text-sm ${quote.selected ? 'font-bold text-gray-800' : 'text-gray-600'}`}>{quote.vendorName}</span>
                                            </div>
                                            <span className="font-mono text-sm">¥{quote.amount.toLocaleString()}</span>
                                         </div>
                                      ))}
                                   </div>
                                ) : (
                                   <span className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded">未提出</span>
                                )}
                             </td>
                             <td className="px-6 py-4 text-right">
                                <Link 
                                  to="/chat" 
                                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors"
                                >
                                   連絡・調整
                                </Link>
                             </td>
                          </tr>
                       ))}
                       {/* Mocking other categories */}
                       {[CostCategory.FireSafety, CostCategory.Moving, CostCategory.Furniture].map((cat, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors opacity-60">
                             <td className="px-6 py-4"><span className="font-bold text-gray-600">{cat}</span></td>
                             <td className="px-6 py-4 bg-gray-50/30"><span className="text-gray-400">算出中...</span></td>
                             <td className="px-6 py-4"><span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">見積依頼前</span></td>
                             <td className="px-6 py-4 text-right">
                                <button className="text-sm font-medium text-gray-400 cursor-not-allowed">
                                   連絡・調整
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProjectDetail;