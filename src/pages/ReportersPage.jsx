import React, { useState } from 'react';
import { Users, PlusCircle, ShieldCheck, Mail, Phone, MapPin, Trash2, Edit3 } from 'lucide-react';

export default function ReportersPage({ reporters, onAddReporter, onDeleteReporter }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Field Reporter (Union Beat)');
  const [location, setLocation] = useState('Mumbai');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddReporter({
      id: Date.now(),
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@kamgartimes.com`,
      role: role,
      location: location,
      phone: phone || '+91 98200 00000',
      articlesCount: 0,
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    });

    setName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            Journalists & Staff Manager
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage newsroom chief editors, desk editors, reporters and access levels.
          </p>
        </div>

        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
          {reporters.length} Active Staff Members
        </span>
      </div>

      {/* Add Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-amber-500" /> Add New Reporter / Editor Account
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          
          <div className="sm:col-span-3 space-y-1">
            <label className="text-xs font-bold text-slate-300">Full Name*</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amit Sharma"
              required
              className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="text-xs font-bold text-slate-300">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="amit.s@kamgartimes.com"
              className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="text-xs font-bold text-slate-300">Role / Position</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
            >
              <option value="Senior Digital Editor">Senior Digital Editor</option>
              <option value="Field Reporter (Union Beat)">Field Reporter (Union Beat)</option>
              <option value="Special Representative">Special Representative</option>
              <option value="e-Paper & Desk Editor">e-Paper & Desk Editor</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white font-bold text-xs py-2 rounded-xl shadow-lg flex items-center justify-center gap-1 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>

        </form>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reporters.map(rep => (
          <div key={rep.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3 hover:border-slate-700 transition">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img src={rep.avatar} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-amber-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {rep.name}
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </h4>
                  <p className="text-xs text-amber-400 font-semibold">{rep.role}</p>
                </div>
              </div>

              <button
                onClick={() => onDeleteReporter(rep.id)}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                title="Delete Staff Account"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>Location: <strong className="text-white">{rep.location}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{rep.phone}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Published Articles: <strong className="text-white">{rep.articlesCount}</strong></span>
              <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold">
                ● Active Staff
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
