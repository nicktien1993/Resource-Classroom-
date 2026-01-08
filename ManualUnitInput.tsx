
import React, { useState } from 'react';

interface Props {
  onGenerate: (chapter: string, sub: string) => void;
  isLoading: boolean;
}

const ManualUnitInput: React.FC<Props> = ({ onGenerate, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const parts = inputValue.split(/[之\-]/);
    const chapter = parts.length > 1 ? parts[0].trim() : '自訂單元';
    const sub = parts.length > 1 ? parts.slice(1).join('之').trim() : parts[0].trim();
    
    onGenerate(chapter, sub);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-bold text-slate-800 mb-6">
        3. 手動建立教學單元
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" 
          placeholder="請輸入單元名稱或教學目標..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-slate-100 focus:border-slate-800 transition-all outline-none"
          disabled={isLoading}
        />
        <button 
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="w-full py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 disabled:opacity-50 transition shadow-sm"
        >
          {isLoading ? '正在建立...' : '建立教學單元'}
        </button>
      </form>
    </div>
  );
};

export default ManualUnitInput;
