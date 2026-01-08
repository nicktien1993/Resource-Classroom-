
import React from 'react';
import { HomeworkContent, SelectionParams, ThemeMode } from './types';
import { renderMathContent } from './HandoutViewer';

interface Props {
  content: HomeworkContent;
  params: SelectionParams;
  theme: ThemeMode;
}

const HomeworkViewer: React.FC<Props> = ({ content, params, theme }) => {
  if (!content) return null;
  const questions = Array.isArray(content.questions) ? content.questions : [];

  return (
    <div className="bg-white p-12 md:p-20 rounded-[3rem] shadow-xl border border-slate-200 min-h-screen print:p-0 print:shadow-none print:border-none">
      <div className="text-center border-b-4 border-slate-800 pb-12 mb-16">
        <h1 className="text-4xl font-black text-slate-900 mb-8">{content.title || '練習卷'}</h1>
        <div className="flex justify-center gap-12 text-2xl font-bold text-slate-500">
          <span>年級：{params.grade}</span>
          <span>姓名：_______________</span>
          <span>得分：_______________</span>
        </div>
      </div>

      <div className="space-y-32">
        {questions.map((q, i) => (
          <div key={i} className="relative">
            <div className="flex gap-8 items-start">
              <span className="bg-slate-800 text-white w-12 h-12 flex items-center justify-center rounded-xl font-black text-2xl shrink-0 shadow-lg">{i + 1}</span>
              <div className="flex-1">
                <div className="text-3xl font-bold text-slate-800 mb-12 leading-relaxed">
                  {renderMathContent(q.content)}
                </div>
                <div className="w-full h-[30rem] border-4 border-dashed border-slate-100 rounded-[3rem] flex items-center justify-center">
                  <span className="text-slate-200 font-bold text-xl no-print">作答區</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {questions.length === 0 && (
          <div className="text-center py-20 text-slate-400 font-bold">
            暫無題目內容
          </div>
        )}
      </div>

      <div className="mt-20 no-print flex justify-center gap-4">
        <button onClick={() => window.print()} className="bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition">🖨️ 列印此卷</button>
      </div>
    </div>
  );
};

export default HomeworkViewer;
