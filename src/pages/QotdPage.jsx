import React, { useState, useEffect, useCallback } from 'react';
import {
  Lightbulb, Plus, Search, Trash2, Edit3, AlertCircle, Loader2, RefreshCw,
  CheckCircle2, X, CalendarClock, ListChecks, Eye, EyeOff, PlusCircle, MinusCircle
} from 'lucide-react';
import Pagination from '../components/Pagination';
import { fetchQuestions, createQuestion, updateQuestion, deleteQuestion } from '../api/qotd';

const errOf = (e) => e?.message || 'Something went wrong. Please try again.';

const fmtDate = (d) => {
  if (!d) return null;
  try {
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch { return null; }
};

// QOTD DTO requires strict ISO-8601 WITH timezone on create/update.
const toIso = (local) => (local ? new Date(local).toISOString() : null);

const toLocalInput = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const EMPTY_FORM = {
  question: '', options: ['', ''], correctAnswer: '',
  isActive: true
};

export default function QotdPage({ user, showToast }) {
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [categoryFilter, setCategoryFilter] = useState('');
  const [debouncedCategory, setDebouncedCategory] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [modal, setModal] = useState(null); // null | { mode:'create' } | { mode:'edit', question }
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(null); // soft delete
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedCategory(categoryFilter.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await fetchQuestions({
        isActive: activeFilter || undefined,
        category: debouncedCategory || undefined,
        page: currentPage,
        limit: itemsPerPage
      });
      setQuestions(data?.questions || data?.items || []);
      setTotal(data?.total || 0);
    } catch (err) {
      setQuestions([]);
      setTotal(0);
      setLoadError(errOf(err));
    } finally {
      setLoading(false);
    }
  }, [activeFilter, debouncedCategory, currentPage, itemsPerPage]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / itemsPerPage) || 1;

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModal({ mode: 'create' });
  };

  const openEdit = (q) => {
    setForm({
      question: q.question || '',
      options: (q.options && q.options.length ? q.options : ['', '']).map(String),
      correctAnswer: q.correctAnswer || '',
      isActive: q.isActive !== false,
    });
    setFormErrors({});
    setModal({ mode: 'edit', question: q });
  };

  const setOption = (idx, value) => {
    setForm(prev => {
      const options = [...prev.options];
      options[idx] = value;
      return { ...prev, options };
    });
  };

  const addOption = () => setForm(prev => {
  if (prev.options.length >= 3) return prev;
  return { ...prev, options: [...prev.options, ''] };
});

  const removeOption = (idx) => setForm(prev => {
    if (prev.options.length <= 2) return prev;
    return { ...prev, options: prev.options.filter((_, i) => i !== idx) };
  });

  const validate = () => {
    const next = {};
    if (!form.question.trim()) next.question = 'Question is required.';
    else if (form.question.trim().length > 500) next.question = 'Question must be 500 characters or fewer.';

    const opts = form.options.map(o => o.trim());
    const filled = opts.filter(Boolean);
    if (filled.length > 0 && filled.length < 2) next.options = 'Provide at least 2 options.';
    else if (filled.length > 3) next.options = 'Maximum 3 options allowed.';
    else if (filled.length !== opts.length) next.options = 'Remove or fill empty option rows.';

    if (!form.correctAnswer.trim()) next.correctAnswer = 'Correct answer is required.';
    else if (form.correctAnswer.trim().length > 200) next.correctAnswer = 'Correct answer must be 200 characters or fewer.';

// validation removed
    setFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (saving || !validate()) return;
    setSaving(true);
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const body = {
      question: form.question.trim(),
      options: form.options.map(o => o.trim()).filter(Boolean),
      correctAnswer: form.correctAnswer.trim(),
      isActive: form.isActive,
      startDate: now.toISOString(),
      endDate: twentyFourHoursLater.toISOString(),
    };
    try {
      if (modal?.mode === 'edit') {
        await updateQuestion(modal.question._id, body);
        showToast?.('Question updated.', 'success');
      } else {
        await createQuestion(body);
        showToast?.('Question of the Day created.', 'success');
      }
      setModal(null);
      load();
    } catch (err) {
      showToast?.(errOf(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (q) => {
    if (togglingId) return;
    setTogglingId(q._id);
    try {
      await updateQuestion(q._id, {
        question: q.question,
        options: (q.options || []).filter(Boolean),
        correctAnswer: q.correctAnswer,
        isActive: !q.isActive,
        startDate: q.startDate ? new Date(q.startDate).toISOString() : new Date().toISOString(),
        endDate: q.endDate ? new Date(q.endDate).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      showToast?.(q.isActive ? 'Question deactivated (hidden from readers).' : 'Question activated (visible on its date).', 'success');
      load();
    } catch (err) {
      showToast?.(errOf(err), 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // Delete = soft delete: backend flips isActive to false, keeps the record.
  const handleSoftDelete = async () => {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true);
    try {
      await deleteQuestion(deleting._id);
      showToast?.('Question deactivated. It is kept in the list as Inactive.', 'warning');
      setDeleting(null);
      load();
    } catch (err) {
      showToast?.(errOf(err), 'error');
    } finally {
      setDeleteBusy(false);
    }
  };

  const fieldCls = (bad) =>
    `w-full bg-slate-50 dark:bg-slate-950 border ${bad ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition`;

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm dark:shadow-xl transition-colors duration-300">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-500" /> Question of the Day
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Daily trivia for readers — options and correct answer.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition duration-200 active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>New Question</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-lg grid grid-cols-1 sm:grid-cols-12 gap-3 items-center transition-colors duration-300">
        <div className="sm:col-span-7 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            placeholder="Filter by category (e.g. Sports, Bollywood)..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition"
          />
        </div>
        <div className="sm:col-span-5">
          <select
            value={activeFilter}
            onChange={(e) => { setActiveFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 outline-none transition"
          >
            <option value="">All Questions</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Total Questions: <strong className="text-slate-900 dark:text-white">{total}</strong></span>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {loadError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs font-bold">
            <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> {loadError}</span>
            <button onClick={load} className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shrink-0">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <span className="text-xs">Loading questions...</span>
          </div>
        ) : questions.length === 0 && !loadError ? (
          <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <Lightbulb className="w-8 h-8" />
            <span>No questions found. Create your first Question of the Day.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => {
              const expanded = expandedId === q._id;
              const correctIdx = (q.options || []).findIndex(o => o === q.correctAnswer);
              return (
                <div
                  key={q._id}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <button
                          onClick={() => handleToggleActive(q)}
                          disabled={togglingId === q._id}
                          className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition disabled:opacity-50 ${
                            q.isActive
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                          title="Click to toggle active status"
                        >
                          {togglingId === q._id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <span className={`w-1.5 h-1.5 rounded-full ${q.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />}
                          {q.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <ListChecks className="w-3 h-3" /> {(q.options || []).length} options
                        </span>
                      </div>

                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{q.question}</p>

                      {expanded && (
                        <div className="mt-2.5 space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            {(q.options || []).map((opt, i) => (
                              <span
                                key={i}
                                className={`text-[11px] px-2 py-1 rounded-lg border ${
                                  opt === q.correctAnswer
                                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {String.fromCharCode(65 + i)}. {opt}
                                {opt === q.correctAnswer && ' ✓'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-400">
                        <button
                          onClick={() => setExpandedId(expanded ? null : q._id)}
                          className="flex items-center gap-1 text-blue-500 hover:underline font-semibold"
                        >
                          {expanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {expanded ? 'Hide answer' : 'Show answer & options'}
                        </button>
                        {q.createdBy?.name && <span>by {q.createdBy.name}</span>}
                        <span>{fmtDate(q.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEdit(q)}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <button
                        onClick={() => setDeleting(q)}
                        className="text-red-600 dark:text-red-400 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Deactivate
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !loadError && total > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
          />
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                {modal.mode === 'edit' ? 'Edit Question' : 'New Question of the Day'}
              </h3>
              <button onClick={() => !saving && setModal(null)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Question *</label>
                <textarea
                  rows="2"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  maxLength={500}
                  placeholder="e.g. Who won the 2024 T20 World Cup?"
                  className={fieldCls(formErrors.question)}
                />
                <div className="flex justify-between">
                  {formErrors.question
                    ? <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.question}</p>
                    : <span />}
                  <span className="text-[10px] text-slate-400">{form.question.length}/500</span>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Options * (min 2, max 3)</label>
                <div className="space-y-2">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-7 h-7 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black flex items-center justify-center">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => setOption(i, e.target.value)}
                        maxLength={200}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className={fieldCls(false)}
                      />
                      <button
                        onClick={() => removeOption(i)}
                        disabled={form.options.length <= 2}
                        className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400 transition"
                        title="Remove option"
                      >
                        <MinusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => form.options.length < 3 && addOption()}
                  className={form.options.length >= 3 ? "hidden" : "flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline mt-1"}
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add option
                </button>
                {formErrors.options && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.options}</p>}
              </div>

              {/* Correct answer + explanation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Correct Answer *</label>
                <input
                  type="text"
                  list="correct-answer-options"
                  value={form.correctAnswer}
                  onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
                  maxLength={200}
                  placeholder="Type or pick one of the options above"
                  className={fieldCls(formErrors.correctAnswer)}
                />
                <datalist id="correct-answer-options">
                  {form.options.filter(o => o.trim()).map((o, i) => <option key={i} value={o} />)}
                </datalist>
                <p className="text-[10px] text-slate-400">Must match one of the options exactly (case-sensitive) so readers see it marked as correct.</p>
                {formErrors.correctAnswer && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.correctAnswer}</p>}
              </div>

              <div className="space-y-1.5">
                {/* Explanation field removed */}
{/* removed */}
{/* removed */}
              </div>

<div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Active</label>
                  <select
                    value={form.isActive ? 'true' : 'false'}
                    onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                    className={fieldCls(false)}
                  >
                    <option value="true">Active (eligible for readers)</option>
                    <option value="false">Inactive (hidden)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setModal(null)}
                disabled={saving}
                className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-lg shadow-red-900/30 flex items-center gap-2 transition active:scale-95 disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {saving ? 'Saving...' : modal.mode === 'edit' ? 'Save Changes' : 'Create Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Soft-Delete Confirmation */}
      {deleting && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Deactivate this question?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              “{deleting.question}” will be hidden from readers immediately. The record is kept as Inactive — you can reactivate it anytime from this list.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleting(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSoftDelete}
                disabled={deleteBusy}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white flex items-center gap-2 disabled:opacity-60"
              >
                {deleteBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Deactivate Question
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
