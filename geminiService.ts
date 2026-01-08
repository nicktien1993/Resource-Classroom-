
import { GoogleGenAI, Type } from "@google/genai";
import { SelectionParams, Chapter, HandoutContent, HomeworkConfig, HomeworkContent } from '../types';

const SYSTEM_INSTRUCTION = `你是一位專業的國小資源班特教老師，負責編寫數學講義與練習卷。

【最高準則：內容與解法徹底分離】
1. **講義 (Handout)**：
   - 「題目 (question)」：僅限問題描述（如：84 / 21 = ?）。**絕對禁止**在題目內描述「第一步、第二步」等解法。
   - 「步驟 (stepByStep)」：解題過程必須放在此陣列中，每一步都要微步化且簡單。
2. **練習卷 (Homework)**：
   - 「題目 (content)」：**絕對純淨**。禁止出現算式引導、解題暗示或答案。
   - 「提示 (hint)」：所有的提示內容必須且只能放在此欄位。
   - **題數嚴格執行**：若設定「計算題 X 題、應用題 Y 題」，你產出的總題數必須剛好是 X + Y，且類型必須完全對應，不得遺漏或合併。

【教學排版規範】
- 圖示 (SVG) 永遠在文字說明之前。
- 禁止使用 $ 符號。直接寫純文字數學式。
- 除了講義的「核心觀念」區，其他地方禁止使用「重點一、重點二」等標籤。
- 語氣親切，但內容架構必須嚴謹拆分。

格式要求：僅回傳 JSON，不包含任何 Markdown 標記或解釋文字。`;

const cleanJsonResponse = (text: string) => {
  if (!text) return "";
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

/**
 * 具備自動重試機名的 API 調用函式
 */
async function callWithRetry(fn: () => Promise<any>, retries = 3, delay = 2000): Promise<any> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message?.toString() || "";
    const isQuotaError = errorMsg.includes('quota') || errorMsg.includes('429');
    
    if (isQuotaError && retries > 0) {
      console.warn(`流量限制，嘗試重試... (剩餘次數: ${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const fetchChapters = async (params: SelectionParams): Promise<Chapter[]> => {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `請列出 ${params.publisher}版 國小數學 ${params.grade}${params.semester}學期 的 108 課綱單元目錄。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              subChapters: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["id", "title", "subChapters"]
          }
        }
      }
    });
    const text = cleanJsonResponse(response.text || "[]");
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("JSON 解析失敗", e);
      return [];
    }
  });
};

export const generateHandoutFromText = async (params: SelectionParams, chapter: string, subChapter: string): Promise<HandoutContent> => {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `針對「${chapter}-${subChapter}」生成講義。`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            concept: { type: Type.STRING },
            visualAidSvg: { type: Type.STRING },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  stepByStep: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.STRING },
                  visualAidSvg: { type: Type.STRING }
                },
                required: ["question", "stepByStep", "answer"]
              }
            },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { question: { type: Type.STRING }, answer: { type: Type.STRING } },
                required: ["question", "answer"]
              }
            },
            tips: { type: Type.STRING },
            checklist: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "concept", "examples", "exercises", "tips", "checklist"]
        }
      }
    });
    const text = cleanJsonResponse(response.text || "{}");
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error("無法解析 AI 生成的講義內容，請再試一次。");
    }
  });
};

export const generateHomework = async (params: SelectionParams, chapter: string, subChapter: string, config: HomeworkConfig): Promise<HomeworkContent> => {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `生成隨堂練習：${config.calculationCount}題計算，${config.wordProblemCount}題應用。單元：${chapter}-${subChapter}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  content: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  visualAidSvg: { type: Type.STRING }
                },
                required: ["type", "content", "answer"]
              }
            },
            checklist: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "questions", "checklist"]
        }
      }
    });
    const text = cleanJsonResponse(response.text || "{}");
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error("無法解析 AI 生成的練習卷，請嘗試減少題數。");
    }
  });
};
