
import React, { useState } from 'react';
import { HomeworkConfig, Difficulty } from '../types';

interface Props {
  onGenerate: (config: HomeworkConfig) => void;
  isLoading: boolean;
}

const HomeworkConfigSection: React.FC<Props> = ({ onGenerate, isLoading }) => {
  const [config, setConfig] = useState<HomeworkConfig>({
    calculationCount: 3,
    wordProblemCount: 2,
    difficulty: '中' 
  });

  const difficulties: Difficulty[] = ['易', '中', '難'];

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mt-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            生成隨堂練習卷
          </h2>
          <p className="text-slate-500 font-bold">設定練習題數與難度：</p>
        </div>
        <div className="w-full md:w-auto flex flex-col gap-4 min-w-[300px]">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">計算題數</label>
              <input 
                type="number" 
                min="0" max="10"
                value={config.calculationCount}
                onChange={e => setConfig({...config, calculationCount: parseInt(e.target.value) || 0})}
                className="w-full bg-transparent border-none text-xl font-bold text-slate-900 focus:ring-0 p-0"
              />
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">應用題數</label>
              <input 
                type="number" 
                min="0" max="10"
                value={config.wordProblemCount}
                onChange={e => setConfig({...config, wordProblemCount: parseInt(e.target.value) || 0})}
                className="w-full bg-transparent border-none text-xl font-bold text-slate-900 focus:ring-0 p-0"
              />
            </div>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">難易度</label>
            <div className="flex gap-1 mt-1">
              {difficulties.map(d => (
                <button
                  key={d}
                  onClick={() => setConfig({...config, difficulty: d})}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${config.difficulty === d ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => onGenerate(config)}
            disabled={isLoading}
            className="w-full py-4 bg-slate-800 text-white text-lg font-bold rounded-xl hover:bg-slate-900 transition shadow-sm disabled:opacity-50"
          >
            {isLoading ? '正在生成練習卷...' : '生成練習卷'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeworkConfigSection;
