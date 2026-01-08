
import React from 'react';
import { Chapter } from './types';

interface Props {
  chapters: Chapter[];
  onSelect: (chapterTitle: string, subChapter: string) => void;
  isLoading: boolean;
}

const ChapterSelector: React.FC<Props> = ({ chapters, onSelect, isLoading }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">2. 選擇章節</h2>
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {chapters.map((chapter, i) => (
          <div key={i} className="border-l-4 border-slate-200 pl-4 py-1">
            <h3 className="font-bold text-slate-900 mb-2">{chapter.title}</h3>
            <div className="grid gap-1">
              {chapter.subChapters.map((sub, j) => (
                <button 
                  key={j}
                  onClick={() => onSelect(chapter.title, sub)}
                  disabled={isLoading}
                  className="text-left text-sm font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition"
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ChapterSelector;
