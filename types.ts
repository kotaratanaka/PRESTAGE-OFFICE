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

// 見積もりの内訳明細
export interface QuoteDetailItem {
  name: string; // 項目名（例：材料費）
  amount: number; // 金額
}

// 業者ごとの見積もり情報
export interface VendorQuote {
  vendorName: string;
  amount: number;
  selected: boolean;
  isSubmitted: boolean; // 見積書が提出されたかどうか
  submissionDate?: string; // 提出日
  fileName?: string; // 添付ファイル名
  details?: QuoteDetailItem[]; // 内訳
}

// 見積もりアイテム（カテゴリーごとのまとめ）
export interface EstimateItem {
  id: string;
  category: CostCategory;
  aiEstimate: number; // AIによる概算
  vendorQuotes: VendorQuote[];
}

// チャットチャンネル
export interface ChatChannel {
  id: string;
  category: CostCategory;
  vendorName: string;
  lastMessage: string;
  unreadCount: number;
  // チャット画面で参照するための見積り情報へのリンク
  estimateId?: string;
}