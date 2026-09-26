'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Search,
  Trash2,
  Star,
  CheckCircle,
  Clock,
  Download,
  Key,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Copy,
  Check,
  Filter,
  Eye,
  EyeOff,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  Inbox,
  UserCheck
} from 'lucide-react';

interface Comment {
  id: string;
  name: string;
  message: string;
  category: 'Saran' | 'Kritik' | 'Pesan Rahasia' | 'Pertanyaan' | 'Apresiasi' | 'Lainnya';
  rating?: number;
  isAnonymous: boolean;
  isRead: boolean;
  isStarred: boolean;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data states
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'starred'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Settings states
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [settingsMsg, setSettingsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/check');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        fetchComments();
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Autentikasi gagal.');
      }

      setIsAuthenticated(true);
      setPin('');
      fetchComments();
    } catch (err: any) {
      setAuthError(err.message || 'PIN salah. Silakan coba lagi.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      setIsAuthenticated(false);
      setComments([]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/comments');
      const data = await res.json();
      if (res.ok) {
        setComments(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReadStatus = async (comment: Comment) => {
    try {
      const res = await fetch(`/api/admin/comments/${comment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !comment.isRead }),
      });
      if (res.ok) {
        setComments(comments.map(c => c.id === comment.id ? { ...c, isRead: !c.isRead } : c));
      }
    } catch (err) {
      console.error('Failed to update read status:', err);
    }
  };

  const toggleStarStatus = async (comment: Comment) => {
    try {
      const res = await fetch(`/api/admin/comments/${comment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isStarred: !comment.isStarred }),
      });
      if (res.ok) {
        setComments(comments.map(c => c.id === comment.id ? { ...c, isStarred: !c.isStarred } : c));
      }
    } catch (err) {
      console.error('Failed to update star status:', err);
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setComments(comments.filter(c => c.id !== id));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg(null);

    if (newPin !== confirmNewPin) {
      setSettingsMsg({ type: 'error', text: 'Konfirmasi PIN baru tidak cocok.' });
      return;
    }

    if (newPin.trim().length < 4) {
      setSettingsMsg({ type: 'error', text: 'PIN minimal 4 karakter.' });
      return;
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPin }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengubah PIN.');
      }

      setSettingsMsg({ type: 'success', text: 'PIN berhasil diperbarui!' });
      setNewPin('');
      setConfirmNewPin('');
      setTimeout(() => {
        setShowSettingsModal(false);
        setSettingsMsg(null);
      }, 1500);
    } catch (err: any) {
      setSettingsMsg({ type: 'error', text: err.message || 'Terjadi kesalahan.' });
    }
  };

  const exportData = (format: 'json' | 'csv') => {
    if (comments.length === 0) return;

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(comments, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `komentar-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    } else {
      const headers = ['ID', 'Nama', 'Anonim', 'Kategori', 'Rating', 'Status Dibaca', 'Berbintang', 'Tanggal', 'Pesan'];
      const rows = comments.map(c => [
        `"${c.id}"`,
        `"${c.name.replace(/"/g, '""')}"`,
        c.isAnonymous ? 'Ya' : 'Tidak',
        `"${c.category}"`,
        c.rating || '-',
        c.isRead ? 'Sudah' : 'Belum',
        c.isStarred ? 'Ya' : 'Tidak',
        `"${new Date(c.createdAt).toLocaleString('id-ID')}"`,
        `"${c.message.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `komentar-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    }
  };

  // Filtered comments
  const filteredComments = comments.filter(c => {
    // Search query filter
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.message.toLowerCase().includes(searchQuery.toLowerCase());

    // Tab filter
    const matchesTab =
      filterTab === 'all' ? true :
      filterTab === 'unread' ? !c.isRead :
      filterTab === 'starred' ? c.isStarred : true;

    // Category filter
    const matchesCategory =
      categoryFilter === 'all' ? true : c.category === categoryFilter;

    return matchesSearch && matchesTab && matchesCategory;
  });

  const totalUnread = comments.filter(c => !c.isRead).length;
  const totalStarred = comments.filter(c => c.isStarred).length;
  const ratingsList = comments.filter(c => typeof c.rating === 'number').map(c => c.rating as number);
  const avgRating = ratingsList.length > 0 ? (ratingsList.reduce((a, b) => a + b, 0) / ratingsList.length).toFixed(1) : '-';

  const formatTime = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Memuat Dashboard Admin...</p>
        </div>
      </div>
    );
  }

  /* Admin Login View */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative">
        <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-between items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Form Publik
            </Link>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Admin Area
            </span>
          </div>

          <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-6 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-bold text-center text-white mb-2">
              Akses Admin Dashboard
            </h1>
            <p className="text-xs text-center text-slate-400 mb-6">
              Masukkan PIN Admin untuk melihat dan mengelola semua komentar masuk.
            </p>

            {authError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  PIN / Password Admin
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Masukkan PIN..."
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm pr-11 tracking-wider"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Default PIN awal: <code className="text-indigo-300 bg-slate-800/80 px-1.5 py-0.5 rounded">admin123</code> (dapat diubah setelah login).
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Masuk Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* Admin Dashboard Main View */
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
      {/* Top Navbar */}
      <nav className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Admin Inbox Komentar
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                Privat
              </span>
            </h1>
            <p className="text-xs text-slate-400">Kelola dan pantau pesan rahasia &amp; masukan pengunjung</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Lihat Form Publik</span>
          </Link>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ganti PIN</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </nav>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Komentar</span>
            <Inbox className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">{comments.length}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Belum Dibaca</span>
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <p className="text-2xl font-bold text-rose-400">{totalUnread}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Favorit / Berbintang</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-300">{totalStarred}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Rata-rata Rating</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-300">{avgRating} <span className="text-xs text-slate-500">/ 5.0</span></p>
        </div>
      </div>

      {/* Control Bar: Search, Filters, Export */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 mb-6 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau pesan..."
              className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/60 rounded-xl border border-slate-800 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterTab === 'all'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua ({comments.length})
            </button>
            <button
              onClick={() => setFilterTab('unread')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterTab === 'unread'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Belum Dibaca ({totalUnread})
            </button>
            <button
              onClick={() => setFilterTab('starred')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterTab === 'starred'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⭐ Berbintang ({totalStarred})
            </button>
          </div>

          {/* Category Dropdown & Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl glass-input text-xs cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">Semua Kategori</option>
              <option value="Saran" className="bg-slate-900 text-white">💡 Saran</option>
              <option value="Kritik" className="bg-slate-900 text-white">🔥 Kritik</option>
              <option value="Pesan Rahasia" className="bg-slate-900 text-white">💌 Pesan Rahasia</option>
              <option value="Pertanyaan" className="bg-slate-900 text-white">❓ Pertanyaan</option>
              <option value="Apresiasi" className="bg-slate-900 text-white">⭐ Apresiasi</option>
              <option value="Lainnya" className="bg-slate-900 text-white">💭 Lainnya</option>
            </select>

            <button
              onClick={fetchComments}
              disabled={isLoading}
              title="Muat Ulang"
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <div className="relative group">
              <button
                className="px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
              <div className="absolute right-0 top-full mt-1.5 hidden group-hover:flex flex-col bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-xl z-20 w-32">
                <button
                  onClick={() => exportData('csv')}
                  className="px-3 py-1.5 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                >
                  Format CSV
                </button>
                <button
                  onClick={() => exportData('json')}
                  className="px-3 py-1.5 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                >
                  Format JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comment List Grid */}
      {isLoading && comments.length === 0 ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Mengambil komentar...</p>
        </div>
      ) : filteredComments.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mx-auto mb-4">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">Tidak ada komentar ditemukan</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || filterTab !== 'all' || categoryFilter !== 'all'
              ? 'Tidak ada komentar yang cocok dengan filter atau kata kunci pencarian Anda.'
              : 'Belum ada komentar yang dikirim oleh pengunjung.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredComments.map((c) => {
            const isUnread = !c.isRead;
            return (
              <div
                key={c.id}
                className={`glass-panel rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                  isUnread
                    ? 'border-indigo-500/40 bg-slate-900/90 shadow-lg shadow-indigo-500/5'
                    : 'border-white/5 opacity-90 hover:opacity-100'
                }`}
              >
                {/* Unread indicator ribbon */}
                {isUnread && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                )}

                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          c.isAnonymous
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {c.isAnonymous ? '🕶️' : c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white">
                            {c.name}
                          </h4>
                          {c.isAnonymous && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                              Anonim
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {formatTime(c.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Category Badge */}
                      <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-300 font-medium">
                        {c.category}
                      </span>

                      {/* Star Button */}
                      <button
                        onClick={() => toggleStarStatus(c)}
                        title={c.isStarred ? 'Hapus dari favorit' : 'Tandai favorit'}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            c.isStarred ? 'text-amber-400 fill-amber-400' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Rating Stars if provided */}
                  {c.rating && (
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= (c.rating || 0)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Message Body */}
                  <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80 text-slate-200 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed mb-4">
                    {c.message}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleReadStatus(c)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition flex items-center gap-1.5 ${
                        c.isRead
                          ? 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                      }`}
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>{c.isRead ? 'Tandai Belum Dibaca' : 'Tandai Sudah Dibaca'}</span>
                    </button>

                    <button
                      onClick={() => copyToClipboard(c.message, c.id)}
                      title="Salin teks pesan"
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition flex items-center gap-1"
                    >
                      {copiedId === c.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Delete with confirmation */}
                  {deleteConfirmId === c.id ? (
                    <div className="flex items-center gap-1.5 animate-in fade-in">
                      <span className="text-[11px] text-rose-400">Yakin hapus?</span>
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-medium"
                      >
                        Ya
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(c.id)}
                      title="Hapus komentar"
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Change PIN */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-md w-full border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-400" />
                Ganti PIN Admin
              </h3>
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setSettingsMsg(null);
                }}
                className="text-slate-400 hover:text-slate-200 text-sm p-1"
              >
                ✕
              </button>
            </div>

            {settingsMsg && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  settingsMsg.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}
              >
                {settingsMsg.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                )}
                <span>{settingsMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  PIN Baru (Minimal 4 karakter)
                </label>
                <input
                  type="password"
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Masukkan PIN baru..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Konfirmasi PIN Baru
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value)}
                  placeholder="Ulangi PIN baru..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(false);
                    setSettingsMsg(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md"
                >
                  Simpan PIN Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
