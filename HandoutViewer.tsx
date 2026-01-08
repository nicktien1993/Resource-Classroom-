
import React, { useState, useMemo, useRef } from 'react';
import { HandoutContent, SelectionParams, ThemeMode } from '../types';
import DrawingCanvas from './DrawingCanvas';

interface Props {
  content: HandoutContent;
  params: SelectionParams;
  theme: ThemeMode;
}

declare var html2pdf: any;

export const renderMathContent = (text: string, colorCoding: boolean = true) => {
  if (!text) return null;
  
  let processed = text.replace(/\\n/g, '').trim();
  const hasTags = /<[a-z][\s\S]*>/i.test(processed);

  if (hasTags) {
    if (colorCoding) {
      processed = processed.replace(/(<[^>]+>)|([\+\-×÷=><])/gi, (match, tag, symbol) => {
        if (tag) return tag;
        return `<span class="text-rose-600 font-black mx-1">${symbol}</span>`;
      });
    }
    processed = processed.replace(/<svg[\s\S]*?<\/svg>/gi, (svgMatch) => {
      return `<div class="visual-aid-container">${svgMatch}</div>`;
    });
    return <span className="inline-block w-full" dangerouslySetInnerHTML={{ __html: processed }} />;
  }

  const fracRegex = /(\d+)\s*又\s*(\d+)\/(\d+)|(\d+)\/(\d+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  const highlight = (s: string) => {
    if (!colorCoding) return s;
    const res: React.ReactNode[] = [];
    let l = 0;
    const reg = /([\+\-×÷=><])/g;
    let m;
    while ((m = reg.exec(s)) !== null) {
      if (m.index > l) res.push(s.substring(l, m.index));
      res.push(<span key={m.index} className="text-rose-600 font-black mx-1">${m[1]}</span>);
      l = reg.lastIndex;
    }
    if (l < s.length) res.push(s.substring(l));
    return res;
  };

  while ((match = fracRegex.exec(processed)) !== null) {
    if (match.index > lastIndex) parts.push(highlight(processed.substring(lastIndex, match.index)));
    if (match[1]) {
      parts.push(
        <span key={match.index} className="fraction-container">
          <span className="flex items-center">
            <span className="fraction-whole">{match[1]}</span>
            <span className="flex flex-col items-center">
              <span className="fraction-num">{match[2]}</span>
              <span className="fraction-den">{match[3]}</span>
            </span>
          </span>
        </span>
      );
    } else {
      parts.push(
        <span key={match.index} className="fraction-container">
          <span className="fraction-num">{match[4]}</span>
          <span className="fraction-den">{match[5]}</span>
        </span>
      );
    }
    lastIndex = fracRegex.lastIndex;
  }
  if (lastIndex < processed.length) parts.push(highlight(processed.substring(lastIndex)));
  return <span>{parts}</span>;
};

const HandoutViewer: React.FC<Props> = ({ content, params, theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSteps, setActiveSteps] = useState<Record<number, number>>({});
  const [visibleCanvas, setVisibleCanvas] = useState<Record<string, boolean>>({});
  
  if (!content) return <div className="p-20 text-center font-bold text-slate-400">講義內容載入中...</div>;

  const themeColors = useMemo(() => {
    switch (theme) {
      case 'warm': return { primary: 'text-amber-900', bg: 'bg-orange-50', border: 'border-orange-200' };
      case 'cold': return { primary: 'text-indigo-900', bg: 'bg-cyan-50', border: 'border-cyan-200' };
      default: return { primary: 'text-slate-900', bg: 'bg-slate-100', border: 'border-slate-200' };
    }
  }, [theme]);

  const fontSizeClass = 'text-3xl leading-[3.6]';

  const handleExportPDF = () => {
    const opt = {
      margin: 10,
      filename: `講義_${content.title || '無標題'}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(containerRef.current).save();
  };

  const structuredConcepts = useMemo(() => {
    const rawConcept = content.concept || "";
    const normalized = rawConcept.replace(/\\n/g, '\n').trim();
    const segments = normalized.split(/(?=重點[一二三四五六七八九十\d]+)/g);
    const results: { text: string; isPoint: boolean; label?: string; id: number }[] = [];
    segments.forEach((segment, idx) => {
      const trimmed = segment.trim();
      if (!trimmed) return;
      if (trimmed.startsWith('重點')) {
        const splitIndex = trimmed.indexOf('：') !== -1 ? trimmed.indexOf('：') : trimmed.indexOf(':');
        if (splitIndex !== -1) {
          const labelPart = trimmed.substring(0, splitIndex).trim();
          const contentPart = trimmed.substring(splitIndex + 1).trim();
          results.push({ text: contentPart, isPoint: true, label: labelPart, id: idx });
          return;
        }
      }
      results.push({ text: trimmed, isPoint: false, id: idx });
    });
    return results;
  }, [content.concept]);

  const examples = content.examples || [];
  const exercises = content.exercises || [];

  return (
    <div ref={containerRef} className="bg-white rounded-[2.5rem]">
      <div className="no-print p-6 border-b flex justify-end gap-3 sticky top-0 bg-white/90 backdrop-blur z-30">
        <button onClick={handleExportPDF} className="bg-rose-500 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-rose-600 transition">下載 PDF</button>
        <button onClick={() => window.print()} className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold shadow-md">列印</button>
      </div>

      <div className="p-10 md:p-16">
        <header className="mb-20">
          <div className="flex gap-2 mb-4">
            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[12px] font-bold uppercase tracking-wider">{params.publisher}</span>
          </div>
          <h1 className={`text-6xl font-black ${themeColors.primary} tracking-tight`}>{renderMathContent(content.title || "數學單元講義", false)}</h1>
        </header>

        <section className="mb-20">
          <h2 className="text-4xl font-black mb-12 flex items-center gap-4 text-slate-800">
            <span className="w-2 h-10 bg-amber-500 rounded-full"></span> 核心觀念
          </h2>

          {content.visualAidSvg && (
            <div className="visual-aid-container mb-14" dangerouslySetInnerHTML={{ __html: content.visualAidSvg }} />
          )}

          <div className={`${fontSizeClass} font-bold text-slate-700`}>
            {structuredConcepts.length > 0 ? structuredConcepts.map((item) => (
              <div key={item.id} className={item.isPoint ? 'premium-point-card' : 'pl-14 pr-4 border-l-4 border-slate-100 mb-8 block'}>
                {item.isPoint && item.label && <div className="point-badge">{item.label}</div>}
                <div className={item.isPoint ? 'mt-4 block' : ''}>{renderMathContent(item.text, true)}</div>
              </div>
            )) : <p>觀念整理中...</p>}
          </div>
        </section>

        <section className="practice-section">
          <h2 className="text-4xl font-black mb-12 flex items-center gap-4 text-blue-900">
            <span className="w-3 h-12 bg-blue-600 rounded-full"></span> 實戰練習
          </h2>
          
          <div className="space-y-32">
            {examples.map((ex, i) => (
              <div key={`ex-${i}`} className="example-block">
                <div className="flex justify-between items-center mb-10">
                  <span className="bg-blue-600 text-white px-8 py-2 rounded-xl font-black text-sm shadow-lg">例題 {i+1}</span>
                  <button onClick={() => setVisibleCanvas(p => ({...p, [`ex-${i}`]: !p[`ex-${i}`]}))} className="no-print bg-white border border-slate-200 text-slate-500 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all">
                    {visibleCanvas[`ex-${i}`] ? '關閉寫字區' : '開啟寫字區'}
                  </button>
                </div>
                
                {ex.visualAidSvg && (
                  <div className="mb-8" dangerouslySetInnerHTML={{ __html: ex.visualAidSvg }} />
                )}

                <div className={`${fontSizeClass} font-black text-slate-800 mb-12`}>{renderMathContent(ex.question)}</div>
                
                {visibleCanvas[`ex-${i}`] && (
                  <div className="mb-12 no-print">
                    <DrawingCanvas id={`ex-canvas-${i}`} height={500} isVisible={true} />
                  </div>
                )}

                <div className="space-y-8 mb-12">
                  {(ex.stepByStep || []).map((s, si) => (
                    <div key={si} className={`flex gap-6 items-start ${si < (activeSteps[i] || 0) || window.location.search.includes('print') ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden print:h-auto print:opacity-100 transition-all duration-500'}`}>
                      <span className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black shrink-0 border border-blue-100 text-xl">{si+1}</span>
                      <div className={`${fontSizeClass} font-bold text-slate-600 flex-1 pt-1`}>{renderMathContent(s)}</div>
                    </div>
                  ))}
                </div>

                <div className="no-print mt-12 flex justify-center">
                  {(activeSteps[i] || 0) < (ex.stepByStep || []).length ? (
                    <button onClick={() => setActiveSteps(p => ({...p, [i]: (p[i] || 0) + 1}))} className="bg-blue-600 text-white px-14 py-5 rounded-full font-black text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">下一步 ➜</button>
                  ) : (
                    <div className="bg-emerald-50 text-emerald-700 p-10 rounded-3xl border-2 border-emerald-100 text-center w-full shadow-inner animate-in zoom-in-95">
                      <div className="text-sm font-black uppercase tracking-widest mb-4 opacity-40">正確解答</div>
                      <div className="text-5xl font-black tracking-tight">{renderMathContent(ex.answer, false)}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {exercises.map((exe, i) => (
              <div key={`exe-${i}`} className="example-block border-indigo-100">
                <div className="flex justify-between items-center mb-10">
                  <span className="bg-indigo-600 text-white px-8 py-2 rounded-xl font-black text-sm shadow-lg">自主練習 {i+1}</span>
                  <button onClick={() => setVisibleCanvas(p => ({...p, [`exe-${i}`]: !p[`exe-${i}`]}))} className="no-print bg-white border border-slate-200 text-slate-500 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all">
                    {visibleCanvas[`exe-${i}`] ? '關閉寫字區' : '開啟寫字區'}
                  </button>
                </div>
                <div className={`${fontSizeClass} font-black text-slate-800 mb-12`}>{renderMathContent(exe.question)}</div>
                {visibleCanvas[`exe-${i}`] && (
                  <div className="mb-8 no-print">
                    <DrawingCanvas id={`exe-canvas-${i}`} height={500} isVisible={true} />
                  </div>
                )}
                <div className="hidden print:block w-full h-[20rem] border-2 border-dashed border-slate-200 rounded-3xl mt-10 opacity-30"></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HandoutViewer;
