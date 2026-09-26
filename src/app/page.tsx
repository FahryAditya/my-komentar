'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquarePlus,
  ShieldCheck,
  Send,
  EyeOff,
  User,
  Star,
  CheckCircle2,
  Lock,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Flame,
  Heart,
  FileText,
  AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  { id: 'Saran', label: 'Saran', icon: Lightbulb, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { id: 'Kritik', label: 'Kritik & Masukan', icon: Flame, color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
  { id: 'Pesan Rahasia', label: 'Pesan Rahasia', icon: EyeOff, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  { id: 'Pertanyaan', label: 'Pertanyaan', icon: HelpCircle, color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
  { id: 'Apresiasi', label: 'Apresiasi', icon: Heart, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  { id: 'Lainnya', label: 'Lainnya', icon: FileText, color: 'text-slate-300 border-slate-500/30 bg-slate-500/10' },
] as const;

export default function HomePage() {
  const [name, setName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [category, setCategory] = useState<string>('Saran');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!message.trim()) {
      setError('Harap tuliskan komentar atau pesan Anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: isAnonymous ? 'Anonim' : name,
          isAnonymous,
          category,
          rating,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim komentar.');
      }

      setSubmitted(true);
      setMessage('');
      if (!isAnonymous) setName('');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengirim pesan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setError(null);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-between max-w-4xl mx-auto">
      {/* Background ambient lights */}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-4 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>100% Privat & Rahasia</span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
          Kotak Pesan &amp; <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Komentar</span>
        </h1>
        <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Sampaikan saran, pesan rahasia, atau kritikmu dengan leluasa. Komentar ini tersimpan privat dan <span className="text-slate-200 font-medium underline decoration-indigo-400/50 underline-offset-4">hanya dapat dibaca oleh Admin</span>.
        </p>
      </header>

      {/* Main Container */}
      <main className="w-full">
        {submitted ? (
          /* Success Card */
          <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center border border-indigo-500/30 animate-in fade-in zoom-in duration-300 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Komentar Berhasil Terkirim!
            </h2>
            <p className="text-slate-300 max-w-md mx-auto mb-6 text-sm sm:text-base leading-relaxed">
              Terima kasih atas partisipasimu. Pesanmu telah diamankan dan langsung diteruskan ke inbox khusus Admin.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs sm:text-sm mb-8">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>Privasi Terjaga: Pengunjung lain tidak dapat melihat isi pesan ini.</span>
            </div>

            <div>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageSquarePlus className="w-4 h-4" />
                Kirim Pesan Lain
              </button>
            </div>
          </div>
        ) : (
          /* Form Card */
          <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm animate-in fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name & Anonymous Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="name-input" className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-400" />
                    Nama Kamu
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-400 hover:text-slate-200 transition">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
                    />
                    <span className="flex items-center gap-1 font-medium">
                      <EyeOff className="w-3.5 h-3.5 text-purple-400" />
                      Kirim Anonim
                    </span>
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="name-input"
                    type="text"
                    disabled={isAnonymous}
                    value={isAnonymous ? '🕶️ Mode Anonim Aktif' : name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama atau nama panggilan..."
                    className={`w-full px-4 py-3 rounded-xl glass-input text-sm ${
                      isAnonymous ? 'opacity-50 italic cursor-not-allowed bg-slate-900/50' : ''
                    }`}
                    maxLength={50}
                  />
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2.5">
                  Pilih Kategori Komentar
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all duration-200 ${
                          isSelected
                            ? `${cat.color} border-opacity-100 shadow-md scale-[1.02]`
                            : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating (Optional interactive touch) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Penilaian / Kepuasan (Opsional)
                  </label>
                  <span className="text-xs text-slate-400">
                    {rating === 5 && '⭐⭐⭐⭐⭐ Sangat Baik'}
                    {rating === 4 && '⭐⭐⭐⭐ Baik'}
                    {rating === 3 && '⭐⭐⭐ Cukup'}
                    {rating === 2 && '⭐⭐ Kurang'}
                    {rating === 1 && '⭐ Perlu Ditingkatkan'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/40 border border-slate-800/80 w-fit">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating !== null ? hoverRating : rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setRating(star)}
                        className="p-1 rounded-lg hover:scale-125 transition-transform"
                        title={`${star} Bintang`}
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            active
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="message-input" className="text-sm font-semibold text-slate-200">
                    Isi Komentar / Pesan <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-xs text-slate-500">
                    {message.length} / 2000 karakter
                  </span>
                </div>
                <textarea
                  id="message-input"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan masukan, uneg-uneg, pujian, atau pertanyaanmu di sini..."
                  maxLength={2000}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mengirim secara aman...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Komentar Privat</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 text-center flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80 pt-6 text-xs text-slate-500">
        <p className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Data komentar terlindungi &amp; terjaga kerahasiaannya.
        </p>

        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-slate-200 transition"
        >
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Akses Admin</span>
        </Link>
      </footer>
    </div>
  );
}
