
import React, { useState, useCallback } from 'react';
import { 
  BookOpen, FileText, ArrowLeft, Sparkles, LayoutDashboard
} from 'lucide-react';
import { 
  SelectionParams, Chapter, HandoutContent, HomeworkContent, HomeworkConfig 
} from './types';
import { fetchChapters, generateHandoutFromText, generateHomework } from './geminiService';
import SelectionForm from './components/SelectionForm';
import ChapterSelector from './components/ChapterSelector';
import ManualUnitInput from './components/ManualUnitInput';
import HandoutViewer from './components/HandoutViewer';
import HomeworkViewer from './components/HomeworkViewer';
import HomeworkConfigSection from './components/HomeworkConfigSection';

// Main Application Component
const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'welcome' | 'handout' | 'homework'>('welcome');
  const [params, setParams] = useState<SelectionParams>({
    year: '113',
    publisher: '康軒',
    semester: '上',
    grade: '四年級',
    difficulty: '中',
    showBopomofo: false
  });
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<{ title: string; sub: string } | null>(null);
  const [handout, setHandout] = useState<HandoutContent | null>(null);
  const [homework, setHomework] = useState<HomeworkContent | null>(null);

  const handleSearchChapters = useCallback(async (newParams: SelectionParams) => {
    setParams(newParams);
    setLoading(true);
    try {
      const data = await fetchChapters(newParams);
      setChapters(data);
    } catch (error) {
      console.error(error);
      alert('無法取得課程目錄，請確認連線或稍後再試。');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectUnit = useCallback(async (chapter: string, sub: string) => {
    setCurrentChapter({ title: chapter, sub });
    setLoading(true);
    try {
      const data = await generateHandoutFromText(params, chapter, sub);
      setHandout(data);
      setView('handout');
    } catch (error) {
      console.error(error);
      alert('生成講義失敗，請稍後再試。');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const handleGenerateHomework = useCallback(async (config: HomeworkConfig) => {
    if (!currentChapter) return;
    setLoading(true);
    try {
      const data = await generateHomework(params, currentChapter.title, currentChapter.sub, config);
      setHomework(data);
      setView('homework');
    } catch (error) {
      console.error(error);
      alert('生成練習卷失敗，請稍後再試。');
    } finally {
      setLoading(false);
    }
  }, [params, currentChapter]);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Sidebar - Navigation and Controls */}
      <aside className="w-80 bg-white border-r no-print p-6 flex flex-col gap-6 h-screen sticky top-0 overflow-y-auto shadow-sm">
        <div className="flex items-center gap-3 text-blue-600 mb-2">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <BookOpen size={24} />
          </div>
          <h1 className="text-xl font-black tracking-tighter">特教數學 AI 助手</h1>
        </div>

        {view === 'welcome' ? (
          <>
            <SelectionForm 
              initialParams={params} 
              onSubmit={handleSearchChapters} 
              isLoading={loading} 
            />
            
            {chapters.length > 0 && (
              <ChapterSelector 
                chapters={chapters} 
                onSelect={handleSelectUnit} 
                isLoading={loading} 
              />
            )}

            <ManualUnitInput 
              onGenerate={handleSelectUnit} 
              isLoading={loading} 
            />
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setView('welcome')}
              className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition py-2"
            >
              <ArrowLeft size={18} /> 返回目錄搜尋
            </button>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">正在編輯</div>
              <div className="font-bold text-slate-900 leading-tight">
                {currentChapter?.title} - {currentChapter?.sub}
              </div>
            </div>

            <nav className="flex flex-col gap-1 mt-4">
              <button 
                onClick={() => setView('handout')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${view === 'handout' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <FileText size={20} /> 教學講義
              </button>
              <button 
                onClick={() => {
                  if (homework) setView('homework');
                  else alert('請先從講義下方設定並生成練習卷');
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${view === 'homework' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'} ${!homework ? 'opacity-50' : ''}`}
              >
                <Sparkles size={20} /> 隨堂練習卷
              </button>
            </nav>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        {loading && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-center items-center justify-center flex-col gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-slate-600 animate-pulse">AI 老師正在努力製作教材中...</p>
          </div>
        )}

        {view === 'welcome' && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-20">
            <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mb-8">
              <LayoutDashboard size={48} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4">歡迎使用特教數學講義產生器</h2>
            <p className="text-xl text-slate-500 font-bold leading-relaxed mb-8">
              專為資源班學生設計，將數學觀念微步化、拆解步驟，並自動生成輔助圖示。請從左側開始設定教學單元。
            </p>
          </div>
        )}

        {view === 'handout' && handout && (
          <div className="max-w-4xl mx-auto space-y-8">
            <HandoutViewer content={handout} params={params} theme="default" />
            <HomeworkConfigSection onGenerate={handleGenerateHomework} isLoading={loading} />
          </div>
        )}

        {view === 'homework' && homework && (
          <div className="max-w-4xl mx-auto">
            <HomeworkViewer content={homework} params={params} theme="default" />
          </div>
        )}
      </main>
    </div>
  );
};

// Fix: Ensure App is the default export
export default App;
