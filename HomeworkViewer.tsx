
import React, { useRef, useState, useMemo } from 'react';
import { HomeworkContent, SelectionParams, ThemeMode } from '../types';
import DrawingCanvas from './DrawingCanvas';
import { renderMathContent } from './HandoutViewer';

interface Props {
  content: HomeworkContent;
  params: SelectionParams;
  theme: ThemeMode;
}

declare var html2pdf: any;

const HomeworkViewer: React.FC<Props> = ({ content, params, theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleAnswers, setVisibleAnswers] = useState<Record<number, boolean>>({});
  const [visibleCanvas, setVisibleCanvas] = useState<Record<number, boolean>>({});
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const questions = content.questions || [];
  const checklist = content.checklist || [];

  const themeColors = useMemo(() => {
    switch (theme) {
      case 'warm': return { primary: 'bg-amber-600', primaryText: 'text-amber-900', secondaryBg: 'bg-orange-50', border: 'border-orange-200', btn: 'bg-amber-700' };
      case 'cold': return { primary: 'bg-indigo-600', primaryText: 'text-indigo-900', secondaryBg: 'bg-cyan-50', border: 'border-cyan-200', btn: 'bg-indigo-700' };
      default: return { primary: 'bg-slate-800', primaryText: 'text-slate-900', secondaryBg: 'bg-slate-100', border: 'border-slate-200', btn: 'bg-slate-800' };
    }
  }, [theme]);

  const fontSizeClass = 'text-3xl leading-[3.6]';

  const handleExportPDF = () => {
    if (!containerRef.current) return;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${params.year}學年度_${params.publisher}_隨堂練習_${content.title}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(containerRef.current).save();
  };

  /**
   * 簡化渲染：移除重點標籤邏輯，僅保留數學格式渲染
   */
  const processQuestionContent = (text: string) => {
    const normalized = text.replace(/\\n/g, '\n').trim();
    return <div className="mb-4 last:mb-0">{renderMathContent(normalized)}</div>;
  };

  return (
    <div ref={containerRef} className={`bg-white p-6 md:p-14 rounded-[3rem] shadow-sm border ${themeColors.border} min-h-[600px] transition-colors duration-500 homework-container`}>
      <div className={`no-print mb-8 p-6 ${themeColors.secondaryBg} rounded-2xl flex items-center justify-between border-2 border-dashed ${themeColors.border}`}>
        <h3 className={`font-bold ${themeColors.primaryText}`}>練習卷準備就緒</h3>
        <div className="flex gap-3">
          <button onClick={handleExportPDF} className="bg-rose-600 text-white px-8 py-3 rounded-full font-black shadow-lg">📂 下載 PDF</button>
          <button onClick={() => window.print()} className={`${themeColors.btn} text-white px-8 py-3 rounded-full font-black shadow-lg`}>🖨️ 列印此卷</button>
        </div>
      </div>

      <div>
        <div className={`border-b-4 ${theme === 'warm' ? 'border-amber-700' : theme === 'cold' ? 'border-indigo-700' : 'border-slate-800'} pb-12 mb-16 text-center`}>
          <h1 className="text-4xl font-black text-slate-900 mb-6">{renderMathContent(content.title, false)}</h1>
          <div className="flex justify-center gap-12 text-2xl font-bold pt-8 border-t border-slate-100">
            <span className="text-slate-400">年 級：{params.grade}</span>
            <span>姓 名：_______________</span>
            <span>得分：_______________</span>
          </div>
        </div>

        <div className="space-y-48">
          {questions.map((q, i) => (
            <div key={i} className="relative page-break-inside-avoid">
              <div className="flex items-start gap-10">
                <span className={`${themeColors.primary} text-white font-black rounded-2xl w-14 h-14 flex items-center justify-center shrink-0 text-3xl shadow-lg`}>{i + 1}</span>
                <div className="flex-1">
                  {q.visualAidSvg && (
                    <div className="visual-aid-container mb-12" dangerouslySetInnerHTML={{ __html: q.visualAidSvg }} />
                  )}

                  <div className="flex justify-between items-start mb-10">
                    <div className={`${fontSizeClass} font-bold text-slate-800 flex-1 mr-6`}>
                      {processQuestionContent(q.content)}
                    </div>
                    <button onClick={() => setVisibleCanvas(p => ({...p, [i]: !p[i]}))} className="no-print shrink-0 bg-white border border-slate-200 text-slate-500 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all">
                      {visibleCanvas[i] ? '關閉寫字區' : '開啟寫字區'}
                    </button>
                  </div>
                  
                  {visibleCanvas[i] && (
                    <div className="mt-8 no-print">
                      <DrawingCanvas id={`hw-canvas-${i}`} height={600} isVisible={true} />
                    </div>
                  )}
                  
                  <div className="hidden print:block w-full h-[40rem] border-4 border-dashed border-slate-200 rounded-[3rem] mt-10 opacity-30"></div>
                </div>
              </div>

              <div className="mt-12 flex flex-col items-end gap-4 no-print">
                <button 
                  onClick={() => setVisibleAnswers(p => ({...p, [i]: !p[i]}))} 
                  className={`text-sm font-black transition-all px-6 py-2.5 rounded-xl border-2 ${visibleAnswers[i] ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                >
                  {visibleAnswers[i] ? '隱藏提示與答案' : '查看提示與答案'}
                </button>
                {visibleAnswers[i] && (
                  <div className="w-full bg-emerald-50 text-emerald-900 p-8 rounded-[2.5rem] border-2 border-emerald-100 shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] animate-in zoom-in-95 duration-300">
                    {q.hint && (
                      <div className="mb-6 flex items-start gap-4 p-6 bg-white/60 rounded-3xl border border-emerald-50">
                        <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-black shrink-0 tracking-widest uppercase">提示</span>
                        <div className="text-2xl font-bold leading-relaxed text-emerald-800">{renderMathContent(q.hint)}</div>
                      </div>
                    )}
                    <div className="flex flex-col items-center justify-center py-8 bg-white/90 rounded-[2rem] border-2 border-emerald-200 shadow-inner">
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4">正確解答</span>
                      <div className="text-6xl font-black tracking-tight text-emerald-900">{renderMathContent(q.answer || "", false)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {checklist.length > 0 && (
          <section className={`mt-48 p-12 ${themeColors.secondaryBg} rounded-[4rem] border-4 border-dashed ${themeColors.border} page-break-inside-avoid`}>
            <h3 className={`text-2xl font-black ${themeColors.primaryText} mb-8`}>🎯 寫完後檢查一下：</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {checklist.map((item, idx) => (
                <label key={idx} className="flex items-center gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 cursor-pointer shadow-sm transition-all hover:bg-slate-50">
                  <input type="checkbox" checked={!!checkedItems[idx]} onChange={() => setCheckedItems(prev => ({...prev, [idx]: !prev[idx]}))} className="w-10 h-10 rounded-xl" />
                  <span className={`text-2xl font-bold ${checkedItems[idx] ? 'text-slate-300 line-through' : 'text-slate-800'}`}>{renderMathContent(item)}</span>
                </label>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default HomeworkViewer;
