
import React, { useState, useEffect } from 'react';
import { SelectionParams, Publisher, Grade, Semester, Difficulty } from '../types';

interface Props {
  onSubmit: (params: SelectionParams) => void;
  isLoading: boolean;
  initialParams: SelectionParams;
}

const publishers: Publisher[] = ['康軒', '南一', '翰林'];
const grades: Grade[] = ['一年級', '二年級', '三年級', '四年級', '五年級', '六年級'];
const semesters: Semester[] = ['上', '下'];
const difficulties: Difficulty[] = ['易', '中', '難'];

const SelectionForm: React.FC<Props> = ({ onSubmit, isLoading, initialParams }) => {
  const [form, setForm] = useState<SelectionParams>(initialParams);

  useEffect(() => {
    setForm(initialParams);
  }, [initialParams]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-bold text-slate-800 mb-6">
        1. 設定教學條件
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-tighter">學年度</label>
          <input 
            type="text" 
            value={form.year}
            onChange={e => setForm({...form, year: e.target.value})}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-slate-100 focus:border-slate-800 transition-all outline-none bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-tighter">教科書版本</label>
          <select 
            value={form.publisher}
            onChange={e => setForm({...form, publisher: e.target.value as Publisher})}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-slate-100 focus:border-slate-800 transition-all outline-none bg-white"
          >
            {publishers.map(p => <option key={p} value={p} className="text-slate-900">{p}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-tighter">年級</label>
            <select 
              value={form.grade}
              onChange={e => setForm({...form, grade: e.target.value as Grade})}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-slate-100 focus:border-slate-800 transition-all outline-none bg-white"
            >
              {grades.map(g => <option key={g} value={g} className="text-slate-900">{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-tighter">學期</label>
            <select 
              value={form.semester}
              onChange={e => setForm({...form, semester: e.target.value as Semester})}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-slate-100 focus:border-slate-800 transition-all outline-none bg-white"
            >
              {semesters.map(s => <option key={s} value={s} className="text-slate-900">{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-tighter">難易度</label>
          <div className="flex gap-2">
            {difficulties.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setForm({...form, difficulty: d})}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all border ${form.difficulty === d ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => onSubmit(form)}
          disabled={isLoading}
          className="w-full py-4 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-900 disabled:opacity-50 transition active:scale-95 mt-4 shadow-lg"
        >
          {isLoading ? '正在搜尋目錄...' : '查詢課程目錄'}
        </button>
      </div>
    </div>
  );
};

export default SelectionForm;
