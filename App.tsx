
import React, { useState, useCallback } from 'react';
import { BookOpen, FileText, ArrowLeft, Sparkles, LayoutDashboard } from 'lucide-react';
import { SelectionParams, Chapter, HandoutContent, HomeworkContent, HomeworkConfig } from './types';
import { fetchChapters, generateHandoutFromText, generateHomework } from './geminiService';
import SelectionForm from './SelectionForm';
import ChapterSelector from './ChapterSelector';
import ManualUnitInput from './ManualUnitInput';
import HandoutViewer from './HandoutViewer';
import HomeworkViewer from './HomeworkViewer';
import HomeworkConfigSection from './HomeworkConfigSection';

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
      alert('無法取得目錄，請檢查 API Key 權限。');
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
      alert('生成講義失敗。');
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
      alert('生成練習卷失敗。');
    } finally {
      setLoading(false);
    }
  }, [params, currentChapter]);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-80 bg-white border-r no-print p-6 flex flex-col gap-6 h-screen sticky top-0 overflow-y-auto">
        <div className="flex items-center gap-3 text-blue-600 mb-4">
          <BookOpen size={24} />
          <h1 className="text-xl font-black">特教數學助手</h1>
        </div>
        {view === 'welcome' ? (
          <>
            <SelectionForm initialParams={params} onSubmit={handleSearchChapters} isLoading={loading} />
            {chapters.length > 0 && <ChapterSelector chapters={chapters} onSelect={handleSelectUnit} isLoading={loading} />}
            <ManualUnitInput onGenerate={handleSelectUnit} isLoading={loading} />
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <button onClick={() => setView('welcome')} className="flex items-center gap-2 text-slate-500 font-bold py-2 hover:bg-slate-100 rounded-lg px-2 transition">
              <ArrowLeft size={18} /> 返回設定單元
            </button>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 font-bold text-sm text-blue-700">
              當前單元：{currentChapter?.title} - {currentChapter?.sub}
            </div>
            <nav className="flex flex-col gap-1 mt-4">
              <button onClick={() => setView('handout')} className={`px-4 py-3 rounded-xl font-bold transition text-left ${view === 'handout' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
                1. 教學講義
              </button>
              <button onClick={() => homework && setView('homework')} className={`px-4 py-3 rounded-xl font-bold transition text-left ${view === 'homework' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'} ${!homework ? 'opacity-50 cursor-not-allowed' : ''}`}>
                2. 練習卷
              </button>
            </nav>
          </div>
        )}
      </aside>
      <main className="flex-1 p-8 md:p-12 overflow-y-auto bg-slate-50">
        {loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-slate-600">AI 老師正在處理中，請稍候...</p>
          </div>
        )}
        {view === 'welcome' && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
            <LayoutDashboard size={80} className="mb-6" />
            <h2 className="text-3xl font-black italic">請於左側面板選擇「學年度、出版社、年級」開始</h2>
          </div>
        )}
        {view === 'handout' && handout && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <HandoutViewer content={handout} params={params} theme="default" />
            <HomeworkConfigSection onGenerate={handleGenerateHomework} isLoading={loading} />
          </div>
        )}
        {view === 'homework' && homework && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <HomeworkViewer content={homework} params={params} theme="default" />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
