
import React, { useState } from 'react';
import { SelectionParams, Publisher, Grade, Semester } from './types';

interface Props {
  onSubmit: (params: SelectionParams) => void;
  isLoading: boolean;
  initialParams: SelectionParams;
}

const SelectionForm: React.FC<Props> = ({ onSubmit, isLoading, initialParams }) => {
  const [form, setForm] = useState<SelectionParams>(initialParams);
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">1. 課程篩選</h2>
      <div>
        <label className="block text-xs font-bold text-slate-400 mb-1">版本</label>
        <select value={form.publisher} onChange={e => setForm({...form, publisher: e.target.value as Publisher})} className="w-full border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-900 bg-white">
          <option value="康軒">康軒</option>
          <option value="南一">南一</option>
          <option value="翰林">翰林</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">年級</label>
          <select value={form.grade} onChange={e => setForm({...form, grade: e.target.value as Grade})} className="w-full border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-900 bg-white">
            {['一年級', '二年級', '三年級', '四年級', '五年級', '六年級'].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">學期</label>
          <select value={form.semester} onChange={e => setForm({...form, semester: e.target.value as Semester})} className="w-full border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-900 bg-white">
            <option value="上">上學期</option>
            <option value="下">下學期</option>
          </select>
        </div>
      </div>
      <button onClick={() => onSubmit(form)} disabled={isLoading} className="w-full bg-slate-800 text-white p-3 rounded-xl font-bold hover:bg-slate-900 transition disabled:opacity-50">
        {isLoading ? '搜尋中...' : '查詢課程目錄'}
      </button>
    </div>
  );
};
export default SelectionForm;
