import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { ImageSize } from '../types';
import { Wand2, Image as ImageIcon, Loader2, Download } from 'lucide-react';

const GenerateImagePage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>(ImageSize.Size1K);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateImage(prompt, size);
      setGeneratedImage(result);
    } catch (e) {
      setError("画像生成に失敗しました。APIキーを確認してください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Wand2 className="w-6 h-6 mr-2 text-purple-600" />
          AI パース・イメージ生成 (Gemini 3 Pro)
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Nano Banana Pro (gemini-3-pro-image-preview) を使用して、高品質なリノベーションイメージやパースを作成します。
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        {/* Controls */}
        <div className="w-full lg:w-1/3 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              プロンプト (指示出し)
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-40 resize-none"
              placeholder="例: モダンなリビングルーム、大きな窓、木目のフローリング、北欧風の家具、自然光が差し込む、4K解像度"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              画像サイズ
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(ImageSize).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                    size === s
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              ※ 高解像度 (4K) は生成に時間がかかる場合があります。
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt}
            className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center transition-all ${
              isLoading || !prompt
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                イメージを生成
              </>
            )}
          </button>
          
          {error && (
             <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
               {error}
             </div>
          )}
        </div>

        {/* Preview Area */}
        <div className="w-full lg:w-2/3 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative min-h-[400px]">
          {generatedImage ? (
            <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
              <img src={generatedImage} alt="Generated" className="max-w-full max-h-full object-contain shadow-2xl" />
              <a 
                href={generatedImage} 
                download={`generated-plan-${Date.now()}.png`}
                className="absolute bottom-4 right-4 bg-white/90 text-gray-800 px-4 py-2 rounded-lg shadow-lg hover:bg-white flex items-center text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                保存する
              </a>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              {isLoading ? (
                 <div className="flex flex-col items-center animate-pulse">
                    <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                    <p>AIがデザインを考案中...</p>
                 </div>
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium">プレビューエリア</p>
                  <p className="text-sm">左側のパネルから条件を入力して生成してください</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateImagePage;