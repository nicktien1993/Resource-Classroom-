
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
    
    // 解析輸入，支援 "單元名稱-子單元" 格式
    const parts = inputValue.split(/[之\-]/);
    const chapter = parts.length > 1 ? parts[0].trim() : '自訂單元';
    const sub = parts.length > 1 ? parts.slice(1).join('之').trim() : parts[0].trim();
    
    onGenerate(chapter, sub);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
        3. 手動輸入單元
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" 
          placeholder="例如：分數的加法"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none"
          disabled={isLoading}
        />
        <button 
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 disabled:opacity-50 transition"
        >
          {isLoading ? '正在建立...' : '建立教學單元'}
        </button>
      </form>
    </div>
  );
};

export default ManualUnitInput;
