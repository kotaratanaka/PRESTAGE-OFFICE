import { GoogleGenAI } from "@google/genai";
import { ImageSize } from "../types";

// APIキーの取得（環境変数から）
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing. Please ensure process.env.API_KEY is available.");
    // デモ用にエラーを投げずにインスタンス作成を試みる（実際の環境では必須）
    return new GoogleGenAI({ apiKey: "DUMMY_KEY" }); 
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Gemini 3 Pro Image Preview を使用して画像を生成する
 * (Nano Banana Pro)
 */
export const generateImage = async (
  prompt: string,
  size: ImageSize
): Promise<string | null> => {
  try {
    const ai = getAIClient();
    
    // モデル: gemini-3-pro-image-preview
    // ユーザーはサイズ (1K, 2K, 4K) を指定可能
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          imageSize: size, // 1K, 2K, 4K
          aspectRatio: "16:9" // 建物のパース等に適した比率
        }
      }
    });

    // レスポンスから画像データを抽出
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64EncodeString = part.inlineData.data;
                return `data:image/png;base64,${base64EncodeString}`;
            }
        }
    }
    return null;
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};

/**
 * Gemini 3 Pro Image Preview を使用して画像を編集する
 * (ユーザーのリクエストによりFlashからProへアップグレード)
 */
export const editImage = async (
  base64Image: string,
  prompt: string
): Promise<string | null> => {
  try {
    const ai = getAIClient();

    // Base64ヘッダー除去 (data:image/png;base64,...)
    const cleanBase64 = base64Image.split(',')[1];
    const mimeType = base64Image.substring(base64Image.indexOf(':') + 1, base64Image.indexOf(';'));

    // モデル: gemini-3-pro-image-preview (高品質編集)
    // 画像 + テキストプロンプトで編集指示を送る
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        imageConfig: {
           // 編集時は元の比率を維持したい場合が多いが、Proモデルは指定が必要な場合があるため標準的な設定
           aspectRatio: "1:1", 
           imageSize: "1K"
        }
      }
    });

     // レスポンスから画像データを抽出
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64EncodeString = part.inlineData.data;
                return `data:image/png;base64,${base64EncodeString}`;
            }
        }
    }

    return null;

  } catch (error) {
    console.error("Image editing failed:", error);
    throw error;
  }
};
