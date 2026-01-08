
import React, { useState, useEffect, useCallback } from 'react';
import { SelectionParams, Chapter, HandoutContent, HomeworkContent, HomeworkConfig, ThemeMode } from './types';
import { fetchChapters, generateHandoutFromText, generateHomework } from './geminiService';
import SelectionForm from './SelectionForm';
import ChapterSelector from './ChapterSelector';
import HandoutViewer from './HandoutViewer';
import HomeworkViewer from './HomeworkViewer';
import HomeworkConfigSection from './HomeworkConfigSection';
import ManualUnitInput from './ManualUnitInput';

type AppStep = 'IDLE' | 'SEARCHING' | 'CHAPTER_LIST' | 'GENERATING_CONTENT' | 'VIEW_HANDOUT' | 'VIEW_HOMEWORK';

const LOADING_MESSAGES = [
  "正在召喚數學小精靈...",
  "正在把數學變得很簡單...",
  "老師辛苦了，教材馬上好！",
  "正在繪製最好懂的圖示...",
  "正在計算有趣的練習題..."
];

const FLOATING_SYMBOLS = ['+', '-', '×', '÷', '1', '2', '3', 'π', '=', '>', '<', '½'];

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('IDLE');
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  
  const [params, setParams] = useState<SelectionParams>({
    year: '114',
    publisher: '康軒',
    grade: '四年級',
    semester: '上',
    difficulty: '中',
    showBopomofo: false
  });
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [handout, setHandout] = useState<HandoutContent | null>(null);
  const [homework, setHomework] = useState<HomeworkContent | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<{chapter: string, sub: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [theme, setTheme] = useState<ThemeMode>('default');

  useEffect(() => {
    const checkKey = async () => {
      if (!process.env.API_KEY) {
        if (window.aistudio) {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(selected);
        } else {
          setHasApiKey(false);
        }
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        setError(null);
        setHasApiKey(true);
      }
    } catch (e) {
      console.error("金鑰選擇失敗", e);
    }
  };

  useEffect(() => {
    let msgInterval: number;
    let progressInterval: number;

    if (step === 'SEARCHING' || step === 'GENERATING_CONTENT') {
      setLoadingProgress(0);
      msgInterval = window.setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
      progressInterval = window.setInterval(() => {
        setLoadingProgress(prev => {
          if (prev < 50) return prev + 1;
          if (prev < 85) return prev + 0.3;
          if (prev < 95) return prev + 0.1;
          return prev;
        });
      }, 150);
    }
    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, [step]);

  const handleApiError = (err: any, fallbackMessage: string) => {
    const msg = err?.message?.toString() || "";
    if (msg.includes('Requested entity was not found.')) {
      setError("金鑰失效，請點擊下方按鈕重新選擇。");
      setHasApiKey(false);
      setStep('IDLE');
      return;
    }
    setError(`${fallbackMessage} (錯誤: ${msg.substring(0, 50)})`);
    setStep('IDLE');
  };

  const performSearch = useCallback(async (searchParams: SelectionParams) => {
    if (!hasApiKey) {
      setError("請先點擊上方按鈕選擇金鑰專案。");
      return;
    }
    setParams(searchParams);
    setError(null);
    setStep('SEARCHING');
    try {
      const data = await fetchChapters(searchParams);
      setChapters(data || []);
      setStep('CHAPTER_LIST');
    } catch (err) {
      handleApiError(err, "查詢目錄失敗");
    }
  }, [hasApiKey]);

  const handleGenerateHandout = async (chapterTitle: string, subChapter: string) => {
    if (!hasApiKey) return;
    setError(null);
    setSelectedUnit({ chapter: chapterTitle, sub: subChapter });
    setStep('GENERATING_CONTENT');
    try {
      const content = await generateHandoutFromText(params, chapterTitle, subChapter);
      setHandout(content);
      setStep('VIEW_HANDOUT');
    } catch (err) {
      handleApiError(err, "講義生成失敗");
    }
  };

  const handleGenerateHomework = async (config: HomeworkConfig) => {
    if (!selectedUnit || !hasApiKey) return;
    setError(null);
    setStep('GENERATING_CONTENT');
    try {
      const hw = await generateHomework(params, selectedUnit.chapter, selectedUnit.sub, config);
      setHomework(hw);
      setStep('VIEW_HOMEWORK');
    } catch (err) {
      handleApiError(err, "練習卷生成失敗");
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'warm' ? 'bg-orange-50/50' : theme === 'cold' ? 'bg-cyan-50/50' : 'bg-slate-50'}`}>
      {(step === 'SEARCHING' || step === 'GENERATING_CONTENT') && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 pointer-events-none opacity-5">
            {FLOATING_SYMBOLS.map((sym, i) => (
              <div key={i} className="absolute text-5xl font-black text-slate-500" style={{ left: `${(i * 17) % 100}%`, top: `${(i * 23) % 100}%`, animation: `float-slow ${6 + (i % 4)}s infinite ease-in-out` }}>{sym}</div>
            ))}
          </div>
          <div className="relative z-10 bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 w-full max-w-2xl text-center">
            <h3 className="text-slate-800 font-black text-4xl mb-8">{LOADING_MESSAGES[loadingMsgIdx]}</h3>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-8"><div className="h-full bg-slate-800 transition-all duration-300" style={{ width: `${loadingProgress}%` }} /></div>
            <button onClick={() => setStep('IDLE')} className="px-10 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black">取消</button>
          </div>
        </div>
      )}

      <div className={`mx-auto px-4 py-8 transition-all duration-500 ${isSidebarVisible ? 'max-w-6xl' : 'max-w-[95%]'}`}>
        <header className="mb-10 no-print flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="text-left">
            <h1 className="text-4xl font-black text-slate-900 mb-1">資源班數學教室</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Mathematics Resource Class</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {!hasApiKey ? (
              <button onClick={handleSelectKey} className="bg-rose-600 text-white px-6 py-2.5 rounded-full font-black text-sm shadow-lg animate-bounce">🔑 啟動 AI 教學助手</button>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-xs font-bold border border-emerald-100">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>AI 助理已就緒
              </div>
            )}
          </div>
        </header>

        <div className={`grid grid-cols-1 ${isSidebarVisible ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-8 no-print`}>
          {isSidebarVisible && (
            <div className="lg:col-span-4 space-y-6">
              <SelectionForm onSubmit={performSearch} initialParams={params} isLoading={step === 'SEARCHING'} />
              {chapters.length > 0 && <ChapterSelector chapters={chapters} onSelect={handleGenerateHandout} isLoading={step === 'GENERATING_CONTENT'} />}
              <ManualUnitInput onGenerate={handleGenerateHandout} isLoading={step === 'GENERATING_CONTENT'} />
              {error && (
                <div className="p-6 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100">
                  <p className="font-black mb-2">發生錯誤：</p>
                  <p className="text-sm font-bold opacity-80 mb-4">{error}</p>
                </div>
              )}
            </div>
          )}
          <div className={`${isSidebarVisible ? 'lg:col-span-8' : 'w-full'} flex flex-col`}>
            <main className="flex-1 bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
              {step === 'IDLE' && (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                  <div className="text-[120px] mb-8">🍎</div>
                  <h3 className="text-4xl font-black text-slate-900 mb-6">老師您好！</h3>
                  <p className="text-slate-500 font-bold text-xl max-w-sm">請從左側設定版本，讓我們開始製作講義吧！</p>
                </div>
              )}
              {step === 'VIEW_HANDOUT' && handout && (
                <div className="p-1">
                  <HandoutViewer content={handout} params={params} theme={theme} />
                  <div className="p-8 border-t bg-slate-50/50 no-print">
                    <HomeworkConfigSection onGenerate={handleGenerateHomework} isLoading={step === 'GENERATING_CONTENT'} />
                  </div>
                </div>
              )}
              {step === 'VIEW_HOMEWORK' && homework && (
                <div className="p-1">
                  <HomeworkViewer content={homework} params={params} theme={theme} />
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};
export default App;
