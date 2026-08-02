'use client';

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [videoUrlsInput, setVideoUrlsInput] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [popunderCode, setPopunderCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultUrls, setResultUrls] = useState([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('cidey_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    // Pisahkan URL berdasarkan baris baru (enter)
    const urlsArray = videoUrlsInput.split('\n').filter(url => url.trim() !== '');
    if (urlsArray.length === 0) {
      setError('Masukkan setidaknya satu URL video');
      return;
    }

    setLoading(true);
    setError('');
    setResultUrls([]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrls: urlsArray, // Mengirimkan dalam bentuk array
          redirectUrl: redirectUrl.trim(),
          popunderCode: popunderCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses link');
      }

      setResultUrls(data.results);

      const newItems = data.results.map(item => ({
        id: item.id,
        url: item.generatedUrl,
        originalUrl: item.originalUrl,
        redirectUrl: redirectUrl.trim() || 'Default Link',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));

      // Tambahkan sekaligus ke riwayat (simpan batas 20 item)
      const updatedHistory = [...newItems, ...history].slice(0, 20);
      setHistory(updatedHistory);
      localStorage.setItem('cidey_history', JSON.stringify(updatedHistory));

    } catch (err) {
      setError(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = () => {
    const textToCopy = resultUrls.map(r => r.generatedUrl).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('cidey_history');
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black antialiased relative overflow-hidden">
      
      {/* Background Subtle Glow & Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293712_1px,transparent_1px),linear-gradient(to_bottom,#1f293712_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#0d0e15] rounded-[11px] flex items-center justify-center">
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-blue-500 text-lg">C</span>
            </div>
          </div>
          <div>
            <h1 className="font-extrabold tracking-tight text-lg text-white leading-none">CIDEY</h1>
            <span className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">Stream Proxy Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Engine Status: <strong className="text-emerald-400 font-semibold">Active</strong></span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 pt-12 pb-20 relative z-10 flex flex-col items-center">
        
        {/* Title / Hero */}
        <div className="text-center space-y-4 max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-800/40 text-cyan-400 text-xs font-medium mb-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span>Bypass CORS & Direct CDN Restrictions</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Generate Clean <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500">Video Player</span> Link
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Tempelkan URL video langsung (.mp4) beserta Smartlink / Link Affiliate kamu untuk menghasilkan halaman pemutar video instan.
          </p>
        </div>

        {/* Generator Box */}
        <div className="w-full bg-[#0d0e17]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-black/80">
          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            
            {/* Input 1: Video URL (Bulk) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>URL Video (.mp4) <span className="text-rose-400">*</span></span>
                <span className="text-[11px] text-slate-500">Bisa Bulk (Pisahkan dgn Enter)</span>
              </label>
              <div className="relative">
                <textarea
                  required
                  rows={4}
                  value={videoUrlsInput}
                  onChange={(e) => setVideoUrlsInput(e.target.value)}
                  placeholder="https://cdn.videy.co/sample1.mp4&#10;https://cdn.videy.co/sample2.mp4"
                  className="w-full p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-all resize-y leading-relaxed"
                />
              </div>
            </div>

            {/* Input 2: Smartlink / Affiliate Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>Smartlink Adsterra / Link Shopee Affiliate <span className="text-slate-500">(Opsional)</span></span>
                <span className="text-[11px] text-slate-500">Redirect otomatis & tombol upload</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 10-5.656-5.656l-1.1 1.1" /></svg>
                </div>
                <input
                  type="url"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  placeholder="https://s.shopee.co.id/903zrG9yQZ atau Smartlink Adsterra"
                  className="w-full pl-11 pr-10 py-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-all"
                />
              </div>
            </div>

            {/* Input 3: Kode Script Popunder Adsterra */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>Kode Script Popunder Adsterra <span className="text-slate-500">(Opsional)</span></span>
                <span className="text-[11px] text-slate-500">Paste Script Tag Adsterra</span>
              </label>
              <div className="relative">
                <textarea
                  rows={2}
                  value={popunderCode}
                  onChange={(e) => setPopunderCode(e.target.value)}
                  placeholder={`<script type="text/javascript" src="//www.highperformanceformat.com/..."></script>`}
                  className="w-full p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing Engine...
                </>
              ) : (
                'Generate Stream Link'
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center">
              {error}
            </div>
          )}

          {/* Success Result */}
          {resultUrls.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-800/80 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-medium text-emerald-400">✨ {resultUrls.length} Stream Links Generated!</label>
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    copiedAll ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {copiedAll ? 'All Copied!' : 'Copy All Links'}
                </button>
              </div>
              <div className="flex flex-col gap-2 p-3 bg-slate-900 border border-slate-700 rounded-xl max-h-56 overflow-y-auto">
                {resultUrls.map((item, index) => (
                  <input 
                    key={item.id || index}
                    type="text" 
                    readOnly 
                    value={item.generatedUrl}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-sm px-3 py-2.5 focus:outline-none focus:border-slate-600 cursor-text"
                    onClick={(e) => e.target.select()}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="w-full mt-12 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Recent Proxy Links
              </h3>
              <button 
                onClick={clearHistory}
                className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
              >
                Clear History
              </button>
            </div>
            
            <div className="grid gap-3">
              {history.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-[#0d0e17]/60 border border-slate-800/60 flex items-center justify-between group hover:bg-[#0d0e17] transition-all">
                  <div className="overflow-hidden pr-4">
                    <a href={item.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-cyan-400 hover:underline truncate block">
                      {item.url.replace(/^https?:\/\//, '')}
                    </a>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-600 font-mono truncate">{item.originalUrl.substring(0, 40)}...</span>
                      <span className="text-[10px] text-slate-500">• {item.createdAt}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(item.url)}
                    className="p-2 rounded-lg bg-slate-800/50 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-700 hover:text-white transition-all shrink-0"
                    title="Copy Link"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Branding Footer */}
        <div className="mt-16 text-center">
          <p className="text-xs sm:text-sm tracking-[0.2em] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 uppercase">
            DEVELOPED BY MOCHRA
          </p>
        </div>

      </main>
    </div>
  );
}