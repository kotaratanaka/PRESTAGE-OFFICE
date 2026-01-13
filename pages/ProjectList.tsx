import React, { useState } from 'react';
import { Project, ProjectStatus } from '../types';
import { Search, Filter, Plus, ArrowRight, Box, LayoutTemplate, Calculator, Save, X, FilePlus } from 'lucide-react';
import { Link } from 'react-router-dom';

// データ永続化のためにコンポーネント外に変数を定義（モックDB）
let persistentProjects: Project[] = [
  { id: '1', name: '渋谷区S邸 リノベーション', clientName: '佐藤 様', address: '東京都渋谷区神宮前 1-1-1', status: ProjectStatus.Planning, date: '2023-10-25' },
  { id: '2', name: '港区オフィス改修', clientName: 'Tech Corp', address: '東京都港区六本木 6-10-1', status: ProjectStatus.Survey, date: '2023-10-28' },
  { id: '3', name: '横浜K邸 キッチン改装', clientName: '加藤 様', address: '神奈川県横浜市中区 3-2', status: ProjectStatus.Construction, date: '2023-10-15' },
  { id: '4', name: '目黒区M邸 フルリノベ', clientName: '松本 様', address: '東京都目黒区青葉台 2-5', status: ProjectStatus.Completed, date: '2023-09-10' },
  { id: '5', name: '新宿テナント工事', clientName: 'Dining Bar X', address: '東京都新宿区歌舞伎町 1-1', status: ProjectStatus.Estimation, date: '2023-10-20' },
];

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(persistentProjects);
  const [isCreating, setIsCreating] = useState(false);

  // New Project Form State
  const [newName, setNewName] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const handleCreateProject = () => {
    if (!newName || !newClient) return;

    const newId = (projects.length + 1).toString();
    const today = new Date().toISOString().split('T')[0];

    const newProject: Project = {
      id: newId,
      name: newName,
      clientName: newClient,
      address: newAddress,
      status: ProjectStatus.Survey, // 初期ステータス
      date: today
    };

    // Update persistent store and local state
    persistentProjects = [newProject, ...persistentProjects];
    setProjects(persistentProjects);
    
    // Reset and close form
    setNewName('');
    setNewClient('');
    setNewAddress('');
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="mb-6">
           <h2 className="text-2xl font-bold text-gray-800">新規案件登録</h2>
           <p className="text-gray-500 text-sm mt-1">新しいプロジェクトの基本情報を入力してください。</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
           <div className="space-y-6">
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">案件名 <span className="text-red-500">*</span></label>
                 <input 
                   type="text" 
                   value={newName}
                   onChange={(e) => setNewName(e.target.value)}
                   placeholder="例: 世田谷区T邸 リノベーション工事"
                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                 />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">顧客名 (施主) <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={newClient}
                      onChange={(e) => setNewClient(e.target.value)}
                      placeholder="例: 田中 太郎 様"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">所在地</label>
                    <input 
                      type="text" 
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="例: 東京都世田谷区..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                 </div>
              </div>

              <div className="pt-6 flex justify-end space-x-4 border-t border-gray-100 mt-6">
                 <button 
                   onClick={() => setIsCreating(false)}
                   className="px-6 py-3 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors flex items-center"
                 >
                   <X className="w-5 h-5 mr-2" />
                   キャンセル
                 </button>
                 <button 
                   onClick={handleCreateProject}
                   disabled={!newName || !newClient}
                   className="px-6 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <Save className="w-5 h-5 mr-2" />
                   登録して一覧へ戻る
                 </button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">案件一覧</h2>
          <p className="text-gray-500 text-sm mt-1">管理中の全プロジェクトリスト</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          新規案件作成
        </button>
      </div>

      {/* Workflow Guidance Box */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-xl border border-blue-100 mb-8 relative overflow-hidden">
         <div className="relative z-10">
            <h3 className="text-sm font-bold text-blue-800 mb-4 flex items-center">
               <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2">i</span>
               プロジェクト進行の流れ
            </h3>
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 text-sm text-gray-600">
               
               {/* Step 1 */}
               <div className="flex-1 flex flex-col items-center text-center px-2">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 mb-2 text-blue-600">
                     <FilePlus className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-gray-800">1. 新規案件作成</p>
                  <p className="text-xs mt-1 text-gray-500">「＋新規案件作成」ボタンから基本情報を登録してスタート</p>
               </div>

               <ArrowRight className="hidden md:block w-5 h-5 text-gray-300 mt-4 flex-shrink-0" />
               <div className="transform rotate-90 md:rotate-0 text-gray-300 my-2 md:my-0 md:hidden">↓</div>

               {/* Step 2 */}
               <div className="flex-1 flex flex-col items-center text-center px-2">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 mb-2 text-indigo-600">
                     <Box className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-gray-800">2. 現地スキャン</p>
                  <p className="text-xs mt-1 text-gray-500">案件を開き、LiDARで各部屋をスキャンして3Dモデルを作成</p>
               </div>

               <ArrowRight className="hidden md:block w-5 h-5 text-gray-300 mt-4 flex-shrink-0" />
               <div className="transform rotate-90 md:rotate-0 text-gray-300 my-2 md:my-0 md:hidden">↓</div>

               {/* Step 3 */}
               <div className="flex-1 flex flex-col items-center text-center px-2">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 mb-2 text-purple-600">
                     <LayoutTemplate className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-gray-800">3. レイアウト・パース</p>
                  <p className="text-xs mt-1 text-gray-500">3Dモデルから図面とパースイメージを自動生成</p>
               </div>

               <ArrowRight className="hidden md:block w-5 h-5 text-gray-300 mt-4 flex-shrink-0" />
               <div className="transform rotate-90 md:rotate-0 text-gray-300 my-2 md:my-0 md:hidden">↓</div>

               {/* Step 4 */}
               <div className="flex-1 flex flex-col items-center text-center px-2">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 mb-2 text-green-600">
                     <Calculator className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-gray-800">4. 見積・業者選定</p>
                  <p className="text-xs mt-1 text-gray-500">AI概算算出と業者への一括見積もり依頼・調整</p>
               </div>
            </div>
            <div className="mt-6 text-center">
               <span className="text-xs bg-white/60 px-4 py-1.5 rounded-full text-blue-900 font-medium border border-blue-100 shadow-sm">
                  まずは右上の「新規案件作成」から始めましょう
               </span>
            </div>
         </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="案件名、顧客名で検索..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 bg-white">
            <Filter className="w-4 h-4 mr-2" />
            フィルター
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">ID</th>
              <th className="px-6 py-4 font-medium">案件名</th>
              <th className="px-6 py-4 font-medium">顧客</th>
              <th className="px-6 py-4 font-medium">所在地</th>
              <th className="px-6 py-4 font-medium">ステータス</th>
              <th className="px-6 py-4 font-medium">最終更新</th>
              <th className="px-6 py-4 font-medium">アクション</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-400 text-sm">#{p.id.padStart(4, '0')}</td>
                <td className="px-6 py-4 font-medium text-gray-800">{p.name}</td>
                <td className="px-6 py-4 text-gray-600">{p.clientName}</td>
                <td className="px-6 py-4 text-gray-500 text-sm">{p.address}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                    ${p.status === ProjectStatus.Survey ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      p.status === ProjectStatus.Planning ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      p.status === ProjectStatus.Construction ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      p.status === ProjectStatus.Completed ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">{p.date}</td>
                <td className="px-6 py-4">
                  <Link to={`/projects/${p.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline">
                    開く
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectList;