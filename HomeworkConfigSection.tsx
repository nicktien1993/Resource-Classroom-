
import React, { useState } from 'react';
import { HomeworkConfig, Difficulty } from './types';

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

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-slate-800">建立隨堂練習卷</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">計算題數量</label>
          <input type="number" value={config.calculationCount} onChange={e => setConfig({...config, calculationCount: parseInt(e.target.value) || 0})} className="w-full border rounded-xl p-2 font-bold" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">應用題數量</label>
          <input type="number" value={config.wordProblemCount} onChange={e => setConfig({...config, wordProblemCount: parseInt(e.target.value) || 0})} className="w-full border rounded-xl p-2 font-bold" />
        </div>
      </div>
      <button onClick={() => onGenerate(config)} disabled={isLoading} className="w-full bg-slate-800 text-white p-4 rounded-xl font-bold hover:bg-slate-900 transition shadow-lg">
        {isLoading ? '生成中...' : '立即生成練習卷'}
      </button>
    </div>
  );
};
export default HomeworkConfigSection;
