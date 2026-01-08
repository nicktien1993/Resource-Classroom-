
import { GoogleGenAI } from "@google/genai";
import { SelectionParams, Chapter, HandoutContent, HomeworkConfig, HomeworkContent } from './types';

const SYSTEM_INSTRUCTION = `你是一位專業的國小資源班特教老師。
請注意：
1. 講義包含：核心觀念、3個例題(含解法)、3個練習。
2. 練習卷包含：僅題目與老師提示，不准有解法或答案。
3. 禁止使用 $ 符號，數學算式直接寫純文字。
4. 回傳格式：純 JSON，不包含任何 Markdown 標記。`;

const cleanJson = (text: string) => {
  if (!text) return "{}";
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const fetchChapters = async (params: SelectionParams): Promise<Chapter[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `請列出 ${params.publisher}版 國小數學 ${params.grade}${params.semester}學期 的單元目錄。格式為 JSON 陣列，包含 title 和 subChapters。`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanJson(response.text));
};

export const generateHandoutFromText = async (params: SelectionParams, chapter: string, sub: string): Promise<HandoutContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `針對單元「${chapter}-${sub}」為 ${params.grade} 資源班學生生成適合的教學講義。`,
    config: { 
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json" 
    }
  });
  return JSON.parse(cleanJson(response.text));
};

export const generateHomework = async (params: SelectionParams, chapter: string, sub: string, config: HomeworkConfig): Promise<HomeworkContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `針對單元「${chapter}-${sub}」生成練習卷，包含 ${config.calculationCount} 題計算與 ${config.wordProblemCount} 題應用。`,
    config: { 
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json" 
    }
  });
  return JSON.parse(cleanJson(response.text));
};
