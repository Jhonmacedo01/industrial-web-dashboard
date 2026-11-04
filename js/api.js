/* api.js — saídas e integrações (área de transferência, WhatsApp, código de pendências).
   Ponto único para ligar um servidor/banco no futuro, se a empresa aprovar. */
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch (e) {}
  /* alternativa para http://intranet (a API de clipboard exige HTTPS ou localhost) */
  try {
    const ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0'; document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy'); ta.remove(); return ok;
  } catch (e) { return false; }
}
function openWhatsApp(t) {
  const a = document.createElement('a');
  a.href = 'https://wa.me/?text=' + encodeURIComponent(t); a.target = '_blank'; a.rel = 'noopener noreferrer';
  document.body.appendChild(a); a.click(); a.remove();
}
function encodePend(list) {
  return 'PENDENCIAS:' + btoa(unescape(encodeURIComponent(JSON.stringify(list.map(p => ({ asset: p.asset, desc: p.desc }))))));
}
function decodePend(str) { return JSON.parse(decodeURIComponent(escape(atob(str.trim().replace(/^PENDENCIAS:/, ''))))); }
