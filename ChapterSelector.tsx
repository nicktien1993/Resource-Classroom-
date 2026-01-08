
import React from 'react';
import { Chapter } from '../types';

interface Props {
  chapters: Chapter[];
  onSelect: (chapterTitle: string, subChapter: string) => void;
  isLoading: boolean;
}

const ChapterSelector: React.FC<Props> = ({ chapters, onSelect, isLoading }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-bold text-slate-800 mb-6">
        2. 選擇單元章節
      </h2>
      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {chapters.map(chapter => (
          <div key={chapter.id} className="border-l-4 border-slate-400 pl-4 py-1">
            <h3 className="font-bold text-slate-900 text-lg mb-3 tracking-tight">{chapter.title}</h3>
            <ul className="grid grid-cols-1 gap-2">
              {chapter.subChapters.map((sub, idx) => (
                <li key={idx}>
                  <button 
                    onClick={() => onSelect(chapter.title, sub)}
                    disabled={isLoading}
                    className="w-full text-left text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-4 py-3 rounded-xl transition-all border border-transparent hover:border-slate-200 disabled:opacity-50 flex items-center justify-between group"
                  >
                    <span>{sub}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChapterSelector;
