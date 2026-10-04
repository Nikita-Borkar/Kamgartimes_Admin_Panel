import React, { useState } from 'react';
import { HelpCircle, Sparkles, PlusCircle, Save, CheckCircle2 } from 'lucide-react';

export default function PollsRashifalPage({ poll, horoscope, onUpdatePoll, onUpdateHoroscope }) {
  const [question, setQuestion] = useState(poll.question);
  const [opt1, setOpt1] = useState(poll.options[0]?.text || '');
  const [opt2, setOpt2] = useState(poll.options[1]?.text || '');
  const [opt3, setOpt3] = useState(poll.options[2]?.text || '');
  const [pollSuccess, setPollSuccess] = useState(false);

  const [horoscopesList, setHoroscopesList] = useState(horoscope);
  const [horoSuccess, setHoroSuccess] = useState(false);

  const handlePollSubmit = (e) => {
    e.preventDefault();
    onUpdatePoll({
      ...poll,
      question: question,
      options: [
        { id: 'opt1', text: opt1, votes: poll.options[0]?.votes || 8420 },
        { id: 'opt2', text: opt2, votes: poll.options[1]?.votes || 3910 },
        { id: 'opt3', text: opt3, votes: poll.options[2]?.votes || 510 }
      ]
    });
    setPollSuccess(true);
    setTimeout(() => setPollSuccess(false), 2500);
  };

  const handleHoroTextChange = (sign, newText) => {
    setHoroscopesList(horoscopesList.map(h => h.sign === sign ? { ...h, text: newText } : h));
  };

  const handleSaveHoroscope = (e) => {
    e.preventDefault();
    onUpdateHoroscope(horoscopesList);
    setHoroSuccess(true);
    setTimeout(() => setHoroSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm dark:shadow-xl flex items-center justify-between transition-colors duration-300">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Survey Polls & Daily Rashifal (सर्वे पोल एवं राशिफल)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage active reader opinion polls and daily horoscope predictions for the homepage widgets.
          </p>
        </div>
      </div>

      {/* Grid: Left Survey Poll, Right Daily Rashifal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Survey Poll Management */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-500" /> Live Homepage Opinion Poll
            </h3>
            {pollSuccess && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Updated!
              </span>
            )}
          </div>

          <form onSubmit={handlePollSubmit} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Poll Question (Hindi / English)*</label>
              <textarea
                rows="2"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-red-500 rounded-xl p-3 text-xs text-slate-900 dark:text-white font-serif outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Option 1</label>
              <input
                type="text"
                value={opt1}
                onChange={(e) => setOpt1(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-serif outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Option 2</label>
              <input
                type="text"
                value={opt2}
                onChange={(e) => setOpt2(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-serif outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Option 3</label>
              <input
                type="text"
                value={opt3}
                onChange={(e) => setOpt3(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-serif outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Votes: <strong className="text-amber-600 dark:text-amber-400">{poll.totalVotes?.toLocaleString()}</strong></span>
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" /> Save Poll Question
              </button>
            </div>

          </form>
        </div>

        {/* Right: Daily Rashifal Management */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Daily Rashifal Predictions (दैनिक राशिफल)
            </h3>
            {horoSuccess && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Updated!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveHoroscope} className="space-y-3">
            <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
              {horoscopesList.map((h, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{h.sign}</span>
                  <input
                    type="text"
                    value={h.text}
                    onChange={(e) => handleHoroTextChange(h.sign, e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white font-serif outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Save All Rashifal Predictions
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
