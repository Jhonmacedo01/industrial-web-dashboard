/* functions.js — funções compartilhadas por todas as páginas (dados, texto do repasse, utilitários) */
const KEY = 'repasse-automacao-v3', CFG = 'repasse-automacao-cfg';
const DEF_HRS = { A: '06:00 às 18:00', B: '18:00 às 06:00', C: '06:00 às 18:00', D: '18:00 às 06:00' };
const SEED = ['TR1080KS37','PN66','TR1084KS01','TR1080KS86','BM1080KS11','TR1084KS03','TR1080KS64','EE1083KS01','TR1082KS06','BM1080KS01'];
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const now = () => new Date().toTimeString().slice(0, 5);

function toast(t) {
  const el = $('toast'); if (!el) return;
  el.textContent = t; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1900);
}
function getData() {
  let s = {}; try { s = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  return { events: s.events || [], pends: s.pends || [], tags: s.tags || [], teams: s.teams || {}, shift: s.shift || 'A',
    date: s.date || '', hours: s.hours || '', om: s.om || '', t1: s.t1 || '', t2: s.t2 || '', nics: s.nics || '' };
}
function putData(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
function getHours() {
  try { return Object.assign({}, DEF_HRS, JSON.parse(localStorage.getItem(CFG) || '{}').hours); } catch (e) { return DEF_HRS; }
}
function teamOf(d) {
  const a = [d.t1, d.t2].map(x => (x || '').trim()).filter(Boolean);
  return a.length ? a.join(' e ') : '[equipe]';
}
function buildText(d) {
  const dt = d.date ? new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR') : '[data]';
  let o = `REPASSE DE TURNO – AUTOMAÇÃO | TURNO ${d.shift}\n📅 ${dt}\n🕒 ${d.hours || '[horário]'}\n👷 Equipe: ${teamOf(d)}.\nOM: ${d.om}\n`;
  d.events.forEach((e, i) => { o += `\n*${i + 1}.${e.asset || '[TAG]'} | ${e.time || '--:--'}.*\n${e.kind === 'Falha' ? 'Falha' : 'Evento'}: ${e.desc}${e.res ? ` (${e.res})` : ''}\n`; });
  const op = d.pends.filter(p => !p.done), dn = d.pends.filter(p => p.done);
  if (op.length) { o += '\nPendências:\n'; op.forEach(p => o += `🔴 ${p.asset ? p.asset + ' – ' : ''}${p.desc}\n`); }
  if (dn.length) { o += '\nEncerradas neste turno:\n'; dn.forEach(p => o += `✅ ${p.asset ? p.asset + ' – ' : ''}${p.desc}\n`); }
  return o + `\n🧩 DADOS COMPLEMENTARES\nNICs : ${d.nics || '00.'}`;
}
