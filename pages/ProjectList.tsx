import React from 'react';
import { Project, ProjectStatus } from '../types';
import { Search, Filter, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockProjects: Project[] = [
  { id: '1', name: '渋谷区S邸 リノベーション', clientName: '佐藤 様', address: '東京都渋谷区...', status: ProjectStatus.Planning, date: '2023-10-25' },
  { id: '2', name: '港区オフィス改修', clientName: 'Tech Corp', address: '東京都港区...', status: ProjectStatus.Survey, date: '2023-10-28' },
  { id: '3', name: '横浜K邸 キッチン改装', clientName: '加藤 様', address: '神奈川県横浜市...', status: ProjectStatus.Construction, date: '2023-10-15' },
  { id: '4', name: '目黒区M邸 フルリノベ', clientName: '松本 様', address: '東京都目黒区...', status: ProjectStatus.Completed, date: '2023-09-10' },
  { id: '5', name: '新宿テナント工事', clientName: 'Dining Bar X', address: '東京都新宿区...', status: ProjectStatus.Estimation, date: '2023-10-20' },
];

const ProjectList: React.FC = () => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">案件一覧</h2>
          <p className="text-gray-500 text-sm mt-1">管理中の全プロジェクトリスト</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          新規案件作成
        </button>
      </div>

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
            {mockProjects.map((p) => (
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