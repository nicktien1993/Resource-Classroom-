
import { GoogleGenAI } from "@google/genai";
import { SelectionParams, Chapter, HandoutContent, HomeworkConfig, HomeworkContent } from './types';

const SYSTEM_INSTRUCTION = `你是一位專業的國小資源班特教老師。
請注意：
1. 講義包含：核心觀念(concept)、3個例題(examples)、3個自主練習(exercises)。
2. 練習卷包含：僅題目(questions)與檢查表(checklist)，不准有答案。
3. 禁止使用 $ 符號，數學算式直接寫純文字。
4. 針對例題，請提供 stepByStep 微步化解法。
回傳格式：純 JSON 物件，不包含任何 Markdown 標記。`;

const cleanAndParse = (text: string) => {
  try {
    if (!text) return null;
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error("Failed to parse JSON from AI response", e);
    return null;
  }
};

export const fetchChapters = async (params: SelectionParams): Promise<Chapter[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `請列出 ${params.publisher}版 國小數學 ${params.grade}${params.semester}學期 的單元目錄。JSON 格式包含 id, title, subChapters 陣列。`,
    config: { responseMimeType: "application/json" }
  });
  const data = cleanAndParse(response.text);
  return Array.isArray(data) ? data : (data?.chapters || []);
};

export const generateHandoutFromText = async (params: SelectionParams, chapter: string, sub: string): Promise<HandoutContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `生成「${chapter}-${sub}」的教學講義。`,
    config: { 
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json" 
    }
  });
  const data = cleanAndParse(response.text);
  return {
    title: data?.title || `${chapter}-${sub}`,
    concept: data?.concept || '',
    examples: data?.examples || [],
    exercises: data?.exercises || [],
    tips: data?.tips || '',
    checklist: data?.checklist || []
  };
};

export const generateHomework = async (params: SelectionParams, chapter: string, sub: string, config: HomeworkConfig): Promise<HomeworkContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `生成「${chapter}-${sub}」的練習卷，包含 ${config.calculationCount} 題計算與 ${config.wordProblemCount} 題應用。`,
    config: { 
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json" 
    }
  });
  const data = cleanAndParse(response.text);
  return {
    title: data?.title || `${chapter}-${sub} 練習卷`,
    questions: data?.questions || [],
    checklist: data?.checklist || []
  };
};
