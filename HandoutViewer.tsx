
import React, { useState } from 'react';
import { HandoutContent, SelectionParams, ThemeMode } from './types';
import DrawingCanvas from './DrawingCanvas';

interface Props {
  content: HandoutContent;
  params: SelectionParams;
  theme: ThemeMode;
}

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
      return `<div class="p-6 bg-slate-50 rounded-2xl my-6 flex justify-center border border-slate-100">${svgMatch}</div>`;
    });
    return <span className="inline-block w-full" dangerouslySetInnerHTML={{ __html: processed }} />;
  }
  return <span className="math-text">{text}</span>;
};

const HandoutViewer: React.FC<Props> = ({ content, params, theme }) => {
  const [visibleCanvas, setVisibleCanvas] = useState<Record<string, boolean>>({});
  
  if (!content) return null;

  const examples = Array.isArray(content.examples) ? content.examples : [];

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden print:shadow-none print:rounded-none">
      <div className="bg-slate-800 p-10 flex justify-between items-center text-white no-print">
        <div>
          <h1 className="text-4xl font-black mb-2">{content.title || '數學講義'}</h1>
          <p className="opacity-70 font-bold">{params.publisher}版 - {params.grade}</p>
        </div>
        <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg">🖨️ 列印講義</button>
      </div>

      <div className="p-10 md:p-16 space-y-16">
        <section className="bg-blue-50/50 p-10 rounded-[2rem] border-2 border-blue-100">
          <h2 className="text-blue-600 font-black mb-6 text-xl tracking-widest flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span> 核心觀念
          </h2>
          <div className="text-3xl leading-[3] font-bold text-slate-700">
            {renderMathContent(content.concept || '載入中...')}
          </div>
        </section>

        <section className="space-y-20">
          {examples.map((ex, i) => (
            <div key={i} className="relative">
              <div className="flex items-center gap-4 mb-8">
                <span className="bg-blue-600 text-white px-6 py-2 rounded-xl font-black text-sm uppercase tracking-wider">例題 {i+1}</span>
                <button onClick={() => setVisibleCanvas(p => ({...p, [`ex-${i}`]: !p[`ex-${i}`]}))} className="no-print text-xs font-bold text-slate-400 hover:text-blue-600 transition">
                  {visibleCanvas[`ex-${i}`] ? '✕ 關閉手寫板' : '✎ 開啟手寫板'}
                </button>
              </div>
              
              <div className="text-4xl font-black mb-10 text-slate-800 leading-relaxed">
                {renderMathContent(ex.question)}
              </div>

              {visibleCanvas[`ex-${i}`] && (
                <div className="mb-10 no-print animate-in zoom-in-95 duration-300">
                  <DrawingCanvas id={`ex-${i}`} height={400} />
                </div>
              )}

              <div className="space-y-6 bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">解題步驟：</p>
                {(ex.stepByStep || []).map((s, si) => (
                  <div key={si} className="flex gap-6 items-start">
                    <span className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center font-black text-slate-400 shrink-0 shadow-sm">{si+1}</span>
                    <div className="text-2xl font-bold text-slate-600 pt-1 leading-relaxed">{renderMathContent(s)}</div>
                  </div>
                ))}
                <div className="mt-8 pt-8 border-t-2 border-slate-200 text-4xl font-black text-emerald-600 flex items-center gap-4">
                  <span className="text-lg text-emerald-400">答：</span>
                  {renderMathContent(ex.answer, false)}
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default HandoutViewer;
