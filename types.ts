// プロジェクトのステータス定義
export enum ProjectStatus {
  Survey = '現地調査',
  Planning = 'プラン作成',
  Estimation = '見積中',
  Construction = '工事中',
  Completed = '完了'
}

// 案件（プロジェクト）情報
export interface Project {
  id: string;
  name: string; // 案件名
  clientName: string; // 施主名
  address: string; // 住所
  status: ProjectStatus;
  date: string; // 登録日
  imageUrl?: string; // サムネイル
  description?: string;
  totalBudget?: number;
}

// 画像生成のサイズオプション
export enum ImageSize {
  Size1K = '1K',
  Size2K = '2K',
  Size4K = '4K'
}

// 見積もりのカテゴリー
export enum CostCategory {
  Electrical = '電気設備',
  HVAC = '空調設備',
  FireSafety = '防災設備',
  Partition = 'パーティション',
  Furniture = '什器・家具',
  Network = 'ネットワーク',
  Moving = '引越し'
}

// 見積もりアイテム
export interface EstimateItem {
  id: string;
  category: CostCategory;
  aiEstimate: number; // AIによる概算
  vendorQuotes: {
    vendorName: string;
    amount: number;
    selected: boolean;
  }[];
}

// チャットチャンネル
export interface ChatChannel {
  id: string;
  category: CostCategory;
  vendorName: string;
  lastMessage: string;
  unreadCount: number;
}
