import React from 'react';
import { Project, ProjectStatus } from '../types';
import { ArrowUpRight, ArrowDownRight, Users, Activity, CheckCircle2, DollarSign, Box, Layers } from 'lucide-react';

// Mock data
const mockProjects: Project[] = [
  { id: '1', name: '渋谷区S邸 リノベーション', clientName: '佐藤 様', address: '東京都渋谷区...', status: ProjectStatus.Planning, date: '2023-10-25', totalBudget: 15000000 },
  { id: '2', name: '港区オフィス改修', clientName: 'Tech Corp', address: '東京都港区...', status: ProjectStatus.Survey, date: '2023-10-28', totalBudget: 32000000 },
  { id: '3', name: '横浜K邸 キッチン改装', clientName: '加藤 様', address: '神奈川県横浜市...', status: ProjectStatus.Construction, date: '2023-10-15', totalBudget: 5000000 },
  { id: '4', name: '目黒区M邸 フルリノベ', clientName: '松本 様', address: '東京都目黒区...', status: ProjectStatus.Completed, date: '2023-09-10', totalBudget: 22000000 },
];

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  subValue?: string;
  icon: React.ReactNode; 
  trend?: string; 
  trendUp?: boolean 
}> = ({ title, value, subValue, icon, trend, trendUp }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-gray-50 rounded-lg text-gray-700">
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trendUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {trend}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 tracking-tight">{value}</p>
      {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">プラットフォーム概況</h2>
          <p className="text-gray-500 text-sm mt-1">全加盟店の稼働状況・流通額モニタリング</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">最終更新: 2023-10-29 14:30</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="稼働プロジェクト数" 
          value="48 件" 
          subValue="前月比 +12件"
          icon={<Activity className="w-6 h-6 text-blue-600" />} 
          trend="+15%" 
          trendUp={true} 
        />
        <StatCard 
          title="月間LiDARスキャン実施" 
          value="156 回" 
          subValue="平均 3.2回/日"
          icon={<Box className="w-6 h-6 text-purple-600" />} 
          trend="+24%" 
          trendUp={true} 
        />
        <StatCard 
          title="流通見積総額 (GMV)" 
          value="¥1.24億" 
          subValue="今月成約見込含む"
          icon={<DollarSign className="w-6 h-6 text-green-600" />} 
          trend="+8.5%" 
          trendUp={true} 
        />
        <StatCard 
          title="参加施工業者数" 
          value="1,203 社" 
          subValue="アクティブ: 840社"
          icon={<Users className="w-6 h-6 text-orange-600" />} 
          trend="+5社" 
          trendUp={true} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center">
              <Layers className="w-5 h-5 mr-2 text-gray-400" />
              進行中の主要案件
            </h3>
            <button className="text-blue-600 text-sm font-medium hover:underline">全件表示</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">案件名 / 顧客</th>
                  <th className="px-6 py-3 font-medium">ステータス</th>
                  <th className="px-6 py-3 font-medium">予算規模</th>
                  <th className="px-6 py-3 font-medium text-right">進捗率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800 text-sm">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.clientName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium
                        ${p.status === ProjectStatus.Survey ? 'bg-purple-100 text-purple-700' :
                          p.status === ProjectStatus.Planning ? 'bg-blue-100 text-blue-700' :
                          p.status === ProjectStatus.Construction ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">
                      ¥{(p.totalBudget || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end">
                        <div className="w-24 bg-gray-200 rounded-full h-1.5 mr-2">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: p.status === ProjectStatus.Completed ? '100%' : p.status === ProjectStatus.Construction ? '60%' : '20%' }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {p.status === ProjectStatus.Completed ? '100%' : p.status === ProjectStatus.Construction ? '60%' : '20%'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
           <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">最新アクティビティ</h3>
          </div>
          <div className="p-6 overflow-y-auto flex-1">
             <ol className="relative border-l border-gray-200 ml-2 space-y-6">
                <li className="ml-6">
                   <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-4 ring-white">
                      <Activity className="w-3 h-3 text-blue-600" />
                   </span>
                   <p className="text-sm font-semibold text-gray-900">見積もり承認完了</p>
                   <p className="text-xs text-gray-500">港区オフィス改修にて、空調設備の見積もりが承認されました。</p>
                   <time className="mb-1 text-xs font-normal text-gray-400">10分前</time>
                </li>
                <li className="ml-6">
                   <span className="absolute flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full -left-3 ring-4 ring-white">
                      <Box className="w-3 h-3 text-purple-600" />
                   </span>
                   <p className="text-sm font-semibold text-gray-900">3Dスキャンデータ処理完了</p>
                   <p className="text-xs text-gray-500">目黒区M邸のデータ処理が完了し、パース生成の準備が整いました。</p>
                   <time className="mb-1 text-xs font-normal text-gray-400">2時間前</time>
                </li>
                <li className="ml-6">
                   <span className="absolute flex items-center justify-center w-6 h-6 bg-green-100 rounded-full -left-3 ring-4 ring-white">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                   </span>
                   <p className="text-sm font-semibold text-gray-900">工事完了報告</p>
                   <p className="text-xs text-gray-500">新宿テナント工事の引き渡しが完了しました。</p>
                   <time className="mb-1 text-xs font-normal text-gray-400">昨日</time>
                </li>
             </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;