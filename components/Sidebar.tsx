import React from 'react';
import { LayoutDashboard, FolderKanban, Image, MessageSquare, LogOut, HardHat } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600' : 'text-gray-500 hover:bg-gray-100';
  };

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-200 flex flex-col z-10">
      <div className="p-6 flex items-center justify-center border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-800 tracking-wider">Prestage<span className="text-blue-600">Office</span></h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          <li>
            <Link to="/" className={`flex items-center px-6 py-3 transition-colors ${isActive('/')}`}>
              <LayoutDashboard className="w-5 h-5 mr-3" />
              <span className="font-medium">ダッシュボード</span>
            </Link>
          </li>
          <li>
            <Link to="/projects" className={`flex items-center px-6 py-3 transition-colors ${isActive('/projects')}`}>
              <FolderKanban className="w-5 h-5 mr-3" />
              <span className="font-medium">案件一覧</span>
            </Link>
          </li>
          
          <li className="px-6 py-2 mt-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            施工業者連携
          </li>
          
          <li>
            <Link to="/chat" className={`flex items-center px-6 py-3 transition-colors ${isActive('/chat')}`}>
              <MessageSquare className="w-5 h-5 mr-3" />
              <span className="font-medium">業者連絡チャット</span>
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">5</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center px-4 py-2 mb-2 bg-gray-50 rounded-lg">
          <HardHat className="w-8 h-8 text-gray-400 mr-3" />
          <div>
            <p className="text-xs text-gray-500">ログイン中</p>
            <p className="text-sm font-bold text-gray-700">現場管理者 A</p>
          </div>
        </div>
        <button className="flex items-center w-full px-4 py-2 text-gray-600 hover:text-red-600 transition-colors">
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">ログアウト</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;