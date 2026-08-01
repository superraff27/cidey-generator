'use client';

import { useState } from 'react';

export default function HomePage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResultUrl('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Gagal generate link');

      setResultUrl(data.generatedUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-2 text-indigo-400">Cidey Generator</h1>
        <p className="text-sm text-slate-400 text-center mb-6">
          Tempelkan URL video publik (.mp4) untuk membuat link pemutar instan.
        </p>

        <form onSubmit={handleGenerate} className="flex flex-col gap-4">
          <input
            type="url"
            placeholder="https://.../video.mp4"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition"
          >
            {loading ? 'Sabar, lagi di-generate...' : 'Generate Link'}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-red-400 text-center bg-red-950/50 py-2 rounded border border-red-800">
            {error}
          </p>
        )}

        {resultUrl && (
          <div className="mt-6 p-4 bg-slate-800/80 border border-indigo-500/30 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">Hasil Link Cidey Kamu:</p>
            <a
              href={resultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:underline font-mono text-sm break-all"
            >
              {resultUrl}
            </a>
          </div>
        )}
      </div>
    </main>
  );
}