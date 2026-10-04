const fs = require('fs');
const file = 'D:/KamgarTimes_News_Project/Kamgartimes_Admin_Panel/src/pages/SettingsPage.jsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/className="bg-slate-900 border border-slate-800/g, 'className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800');
c = c.replace(/text-white tracking-tight/g, 'text-slate-900 dark:text-white tracking-tight');
c = c.replace(/text-slate-400 mt-0\.5/g, 'text-slate-500 dark:text-slate-400 mt-0.5');
c = c.replace(/text-white flex items-center gap-2/g, 'text-slate-900 dark:text-white flex items-center gap-2');
c = c.replace(/text-slate-300/g, 'text-slate-700 dark:text-slate-300');
c = c.replace(/bg-slate-950 border border-slate-700/g, 'bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700');
c = c.replace(/text-xs text-white/g, 'text-xs text-slate-900 dark:text-white');
c = c.replace(/text-slate-400">Enabling/g, 'text-slate-500 dark:text-slate-400">Enabling');
c = c.replace(/text-white">Maintenance/g, 'text-slate-900 dark:text-white">Maintenance');
c = c.replace(/text-slate-400">Set base URL/g, 'text-slate-500 dark:text-slate-400">Set base URL');
c = c.replace(/text-slate-400">Symbols used/g, 'text-slate-500 dark:text-slate-400">Symbols used');
c = c.replace(/w-11 h-6 bg-slate-800/g, 'w-11 h-6 bg-slate-300 dark:bg-slate-800');

fs.writeFileSync(file, c);
console.log('Done');
