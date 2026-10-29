import React, { useCallback, useEffect, useState } from 'react';
import {
  Check, EyeOff, MessageSquareText, RefreshCw, Search, ShieldCheck,
  Trash2, AlertCircle, Loader2
} from 'lucide-react';
import Pagination from '../components/Pagination';
import { deleteComment, fetchModerationComments, setCommentStatus } from '../api/comments';

const errorText = (error) => error?.message || 'Could not complete the request.';
const dateText = (value) => value ? new Date(value).toLocaleString('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
}) : 'Unknown date';

export default function CommentsModerationPage({ showToast }) {
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => { setQuery(search.trim()); setPage(1); }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchModerationComments({ status: status || undefined, search: query || undefined, page, limit });
      setComments(result?.comments || []);
      setTotal(result?.total || 0);
    } catch (err) {
      setComments([]);
      setTotal(0);
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }, [status, query, page, limit]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (comment, nextStatus) => {
    if (busyId) return;
    setBusyId(comment._id);
    try {
      await setCommentStatus(comment._id, nextStatus);
      showToast?.(nextStatus === 'APPROVED' ? 'Comment approved and visible to readers.' : 'Comment hidden from readers.', 'success');
      await load();
    } catch (err) {
      showToast?.(errorText(err), 'error');
    } finally {
      setBusyId('');
    }
  };

  const remove = async (comment) => {
    if (busyId || !window.confirm('Delete this comment and its replies? This cannot be undone.')) return;
    setBusyId(comment._id);
    try {
      await deleteComment(comment._id);
      showToast?.('Comment and its replies deleted.', 'success');
      await load();
    } catch (err) {
      showToast?.(errorText(err), 'error');
    } finally {
      setBusyId('');
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-red-500">
            <ShieldCheck className="h-4 w-4" /> Reader community
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">Comment moderation</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review reader conversations and control what appears on published articles.</p>
        </div>
        <button onClick={load} disabled={loading} className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:self-auto">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </header>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:p-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search comment, reader, or article" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-red-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        </div>
        <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
          <option value="">All comments</option>
          <option value="APPROVED">Visible</option>
          <option value="HIDDEN">Hidden</option>
        </select>
        <span className="px-1 text-xs font-medium text-slate-500">{total} {total === 1 ? 'comment' : 'comments'}</span>
      </div>

      {error && <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-sm text-slate-500"><Loader2 className="h-6 w-6 animate-spin text-red-500" />Loading comments…</div>
        ) : comments.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800"><MessageSquareText className="h-5 w-5" /></div>
            <h2 className="font-bold text-slate-900 dark:text-white">No comments found</h2>
            <p className="mt-1 max-w-sm text-sm text-slate-500">Try a different status or search. New reader comments will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {comments.map((comment) => {
              const hidden = comment.status === 'HIDDEN';
              const busy = busyId === comment._id;
              return (
                <article key={comment._id} className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{comment.user?.name || 'Reader'}</span>
                        {comment.parent && <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800">Reply</span>}
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${hidden ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'}`}>{hidden ? 'Hidden' : 'Visible'}</span>
                        <span className="text-xs text-slate-400">{dateText(comment.createdAt)}</span>
                      </div>
                      {comment.user?.email && <p className="mt-1 text-xs text-slate-500">{comment.user.email}</p>}
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 dark:text-slate-300">{comment.body}</p>
                      <p className="mt-3 text-xs text-slate-500">Article: <span className="font-semibold text-slate-700 dark:text-slate-300">{comment.article?.title || 'Article unavailable'}</span></p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {hidden ? (
                        <button disabled={busy} onClick={() => changeStatus(comment, 'APPROVED')} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"><Check className="h-3.5 w-3.5" /> Approve</button>
                      ) : (
                        <button disabled={busy} onClick={() => changeStatus(comment, 'HIDDEN')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><EyeOff className="h-3.5 w-3.5" /> Hide</button>
                      )}
                      <button disabled={busy} onClick={() => remove(comment)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        {!loading && comments.length > 0 && <div className="px-4 pb-4 sm:px-5"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={total} itemsPerPage={limit} onItemsPerPageChange={(value) => { setLimit(value); setPage(1); }} /></div>}
      </div>
    </section>
  );
}
