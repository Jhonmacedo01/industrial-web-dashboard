/* main.js — ponto de entrada: cada página tem data-page e roda o seu inicializador */
const PAGES = { index: initIndex, dashboard: initDashboard, relatorios: initRelatorios, configuracoes: initConfig };
document.addEventListener('DOMContentLoaded', () => { const f = PAGES[document.body.dataset.page]; if (f) f(); });

/* ---------- Repasse (index.html) ---------- */
function initIndex() {
  const S = getData(), HRS = getHours(), F = ['date', 'hours', 'om', 't1', 't2', 'nics'];
  const cur = { shift: S.shift, kind: 'Evento', res: '' }; let editing = null;
  const SEG = { shiftSeg: ['shift', ['A', 'B', 'C', 'D']], kindSeg: ['kind', ['Evento', 'Falha', 'Preventiva', 'Monitoramento']], resSeg: ['res', ['Normalizado', 'Acompanhando', 'Pendente']] };
  const TPL = [['Apoio à preventiva', 'Preventiva', 'Apoio à preventiva. Fomos acionados por ___ da elétrica preventiva para realizar teste de chave de emergência ___.'],
    ['Falha com apoio', 'Falha', 'Fomos acionados por ___ solicitando apoio para verificação de falha. Identificado ___. Após intervenção do time, acompanhamos a partida e performou normalmente.'],
    ['Ajuste de sensor', 'Evento', 'Fomos acionados por ___ solicitando apoio nos ajustes do sensor ___, que não estava performando corretamente. Condição ajustada e normalizada.'],
    ['Valor fora do limite', 'Evento', 'Fomos acionados por ___ para verificar ___, que estava com valor fora do limite padrão (___). Condição ajustada e normalizada.'],
    ['Perda de comunicação', 'Falha', 'Fomos acionados por ___ para verificar perda de comunicação em ___. Identificado ___. ___'],
    ['Monitoramento', 'Monitoramento', 'Monitoramento de ___ durante o nosso turno, sem oscilações e sem novas ocorrências.']];
  F.forEach(k => $(k).value = S[k]);
  const snap = () => { const d = { events: S.events, pends: S.pends, tags: S.tags, teams: S.teams, shift: cur.shift }; F.forEach(k => d[k] = $(k).value); return d; };
  const text = () => buildText(snap());
  const save = () => { putData(snap()); render(); };
  function drawSeg() { for (const id in SEG) { const [k, o] = SEG[id]; $(id).innerHTML = o.map(v => `<button type="button" class="chip${cur[k] === v ? ' on' : ''}" data-seg="${k}" data-v="${v}">${k === 'shift' ? 'Turno ' + v : v}</button>`).join(''); } }
  function render() {
    $('evs').innerHTML = S.events.length ? S.events.map((e, i) => `<article class="item"><div class="top"><span class="tag">${esc(e.asset || 'Sem TAG')} · ${esc(e.time || '--:--')} · ${esc(e.kind)}${e.res ? ' · ' + esc(e.res) : ''}</span><span class="actions"><button class="btn sm" data-ed="${i}">Editar</button><button class="btn sm" data-rp="${i}">Repetir</button><button class="btn sm" data-tp="${i}">Pendência</button><button class="btn sm" data-de="${i}">Excluir</button></span></div><p>${esc(e.desc)}</p></article>`).join('') : '<div class="empty">Nenhuma ocorrência registrada.</div>';
    const ord = S.pends.map((p, i) => [p, i]).sort((a, b) => a[0].done - b[0].done);
    $('pends').innerHTML = S.pends.length ? ord.map(([p, i]) => `<article class="item pend${p.done ? ' done' : ''}"><div class="top"><span class="tag">${esc(p.asset || 'Pendência')}${p.from ? ' · recebida' : ''}</span><span class="actions"><button class="btn sm" data-pd="${i}">${p.done ? 'Reabrir' : 'Encerrar'}</button><button class="btn sm" data-dp="${i}">Excluir</button></span></div><p>${esc(p.desc)}</p></article>`).join('') : '<div class="empty">Nenhuma pendência.</div>';
    $('tags').innerHTML = [...new Set([...S.tags, ...SEED])].map(t => `<option value="${esc(t)}">`).join('');
    $('names').innerHTML = [...new Set(Object.values(S.teams).flat().filter(Boolean))].map(t => `<option value="${esc(t)}">`).join('');
    $('out').textContent = text();
    $('count').textContent = `${S.events.length} ocorr. · ${S.pends.filter(p => !p.done).length} pend.`;
    $('sum').textContent = `Turno ${cur.shift} · ${$('hours').value} · ${teamOf(snap())}`; drawSeg();
  }
  const remember = t => { if (t && !S.tags.includes(t) && !SEED.includes(t)) S.tags.push(t); };
  function clrEv() { ['asset', 'desc'].forEach(k => $(k).value = ''); $('time').value = now(); cur.kind = 'Evento'; cur.res = ''; editing = null; $('addEv').textContent = 'Adicionar ocorrência'; $('evTitle').textContent = 'Nova ocorrência'; drawSeg(); }
  function addEv() {
    const e = { asset: $('asset').value.trim(), time: $('time').value || now(), kind: cur.kind, desc: $('desc').value.trim(), res: cur.res };
    if (!e.desc) { $('desc').focus(); toast('Informe o relato.'); return; }
    remember(e.asset); if (editing === null) S.events.push(e); else S.events[editing] = e;
    if (e.res === 'Pendente' && editing === null) S.pends.push({ asset: e.asset, desc: e.desc, done: false });
    clrEv(); save(); $('asset').focus();
  }
  function addPend() {
    const p = { asset: $('pa').value.trim(), desc: $('pd').value.trim(), done: false };
    if (!p.desc) { $('pd').focus(); return; }
    remember(p.asset); S.pends.push(p); $('pa').value = ''; $('pd').value = ''; save(); $('pd').focus();
  }
  function tpl(i) { const [, k, t] = TPL[i]; cur.kind = k; $('desc').value = t; drawSeg(); const ta = $('desc'); ta.focus(); const x = t.indexOf('___'); if (x >= 0) ta.setSelectionRange(x, x + 3); }
  $('tpls').innerHTML = TPL.map((t, i) => `<button type="button" class="chip" data-tpl="${i}">${t[0]}</button>`).join('');
  $('addEv').onclick = addEv; $('clrEv').onclick = clrEv; $('now').onclick = () => { $('time').value = now(); };
  $('desc').addEventListener('keydown', e => { const ta = e.target;
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); addEv(); return; }
    if (e.key === 'Tab' && !e.shiftKey) { const x = ta.value.indexOf('___', ta.selectionEnd); if (x >= 0) { e.preventDefault(); ta.setSelectionRange(x, x + 3); } } });
  $('asset').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('desc').focus(); } });
  $('pa').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('pd').focus(); } });
  $('pd').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addPend(); } });
  document.addEventListener('click', ev => { const b = ev.target.closest('button'); if (!b) return; const d = b.dataset;
    if (d.seg) { if (d.seg === 'res') cur.res = cur.res === d.v ? '' : d.v; else cur[d.seg] = d.v;
      if (d.seg === 'shift') { $('hours').value = HRS[d.v]; const t = S.teams[d.v] || []; $('t1').value = t[0] || ''; $('t2').value = t[1] || ''; save(); } else drawSeg(); }
    if (d.tpl !== undefined) tpl(+d.tpl);
    if (d.de !== undefined) { S.events.splice(+d.de, 1); save(); }
    if (d.dp !== undefined) { S.pends.splice(+d.dp, 1); save(); }
    if (d.pd !== undefined) { S.pends[+d.pd].done = !S.pends[+d.pd].done; save(); }
    if (d.tp !== undefined) { const e = S.events[+d.tp]; S.pends.push({ asset: e.asset, desc: e.desc, done: false }); save(); toast('Adicionada às pendências.'); }
    if (d.ed !== undefined || d.rp !== undefined) { const i = +(d.ed !== undefined ? d.ed : d.rp), e = S.events[i];
      $('asset').value = e.asset; $('desc').value = e.desc; cur.kind = e.kind; cur.res = d.ed !== undefined ? e.res : '';
      if (d.ed !== undefined) { $('time').value = e.time; editing = i; $('addEv').textContent = 'Salvar alteração'; $('evTitle').textContent = 'Editando ocorrência'; } else { $('time').value = now(); editing = null; }
      drawSeg(); $('desc').focus(); $('desc').scrollIntoView({ behavior: 'smooth', block: 'center' }); } });
  F.forEach(k => $(k).addEventListener('input', () => { if (k === 't1' || k === 't2') S.teams[cur.shift] = [$('t1').value.trim(), $('t2').value.trim()]; save(); }));
  $('copy').onclick = async () => toast((await copyText(text())) ? 'Repasse copiado.' : 'Selecione a prévia e copie.');
  $('wa').onclick = () => { openWhatsApp(text()); toast('Abrindo o WhatsApp… escolha o contato ou grupo.'); };
  $('print').onclick = () => window.print();
  $('exp').onclick = async () => { const o = S.pends.filter(p => !p.done); if (!o.length) { toast('Sem pendências abertas.'); return; }
    const c = encodePend(o); if (await copyText(c)) toast('Código copiado. Envie ao próximo turno.'); else { $('imp').value = c; toast('Copie o código no campo abaixo.'); } };
  $('impBtn').onclick = () => { try { const arr = decodePend($('imp').value); arr.forEach(p => S.pends.push({ asset: p.asset || '', desc: p.desc || '', done: false, from: true })); $('imp').value = ''; save(); toast(arr.length + ' pendência(s) importada(s).'); } catch (e) { toast('Código inválido.'); } };
  $('clrAll').onclick = () => { if (confirm('Apagar os dados deste turno neste navegador? A equipe e as TAGs memorizadas são mantidas.')) { S.events = []; S.pends = []; ['date', 'hours', 'om', 'nics'].forEach(k => $(k).value = ''); init(); save(); } };
  function init() { if (!$('date').value) $('date').value = new Date().toLocaleDateString('en-CA'); if (!$('hours').value) $('hours').value = HRS[cur.shift]; if (!$('time').value) $('time').value = now(); }
  init(); render();
}

/* ---------- Dashboard ---------- */
function initDashboard() {
  const d = getData(), op = d.pends.filter(p => !p.done);
  $('turnoInfo').textContent = `Turno ${d.shift} · ${d.hours || getHours()[d.shift]} · ${teamOf(d)}`;
  $('stats').innerHTML = [['Ocorrências', d.events.length, ''], ['Falhas', d.events.filter(e => e.kind === 'Falha').length, ''], ['Pendências abertas', op.length, 'red'], ['Encerradas', d.pends.length - op.length, '']]
    .map(([l, n, c]) => `<div class="stat ${c}"><b>${n}</b>${l}</div>`).join('');
  $('pends').innerHTML = op.length ? op.map(p => `<article class="item pend"><span class="tag">${esc(p.asset || 'Pendência')}${p.from ? ' · recebida' : ''}</span><p>${esc(p.desc)}</p></article>`).join('') : '<div class="empty">Nenhuma pendência aberta.</div>';
  const last = d.events.slice(-5).reverse();
  $('evs').innerHTML = last.length ? last.map(e => `<article class="item"><span class="tag">${esc(e.asset || 'Sem TAG')} · ${esc(e.time)} · ${esc(e.kind)}</span><p>${esc(e.desc)}</p></article>`).join('') : '<div class="empty">Nenhuma ocorrência registrada.</div>';
}

/* ---------- Relatórios ---------- */
function initRelatorios() {
  const d = getData(), t = buildText(d); $('out').textContent = t;
  $('copy').onclick = async () => toast((await copyText(t)) ? 'Repasse copiado.' : 'Selecione o texto e copie.');
  $('wa').onclick = () => { openWhatsApp(t); toast('Abrindo o WhatsApp…'); };
  $('print').onclick = () => window.print();
  $('exp').onclick = async () => { const o = d.pends.filter(p => !p.done); if (!o.length) { toast('Sem pendências abertas.'); return; } toast((await copyText(encodePend(o))) ? 'Código copiado.' : 'Não foi possível copiar.'); };
}

/* ---------- Configurações ---------- */
function initConfig() {
  const L = ['A', 'B', 'C', 'D'], H = getHours(); let d = getData();
  $('cfg').innerHTML = L.map(s => `<div class="f"><label>Turno ${s}</label><div class="row3"><input id="h${s}" value="${esc(H[s])}" placeholder="Horário"><input id="a${s}" value="${esc((d.teams[s] || [])[0] || '')}" placeholder="Pessoa 1"><input id="b${s}" value="${esc((d.teams[s] || [])[1] || '')}" placeholder="Pessoa 2"></div></div>`).join('');
  $('saveCfg').onclick = () => { const h = {}, t = {}; L.forEach(s => { h[s] = $('h' + s).value.trim() || DEF_HRS[s]; t[s] = [$('a' + s).value.trim(), $('b' + s).value.trim()]; });
    localStorage.setItem(CFG, JSON.stringify({ hours: h })); d = getData(); d.teams = t; putData(d); toast('Configurações salvas.'); };
  const drawTags = () => { $('tagsBox').innerHTML = d.tags.length ? d.tags.map((t, i) => `<button class="chip" data-rm="${i}">${esc(t)} ×</button>`).join('') : '<span class="sub">Nenhuma TAG memorizada ainda.</span>'; };
  $('tagsBox').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; d = getData(); d.tags.splice(+b.dataset.rm, 1); putData(d); drawTags(); });
  $('wipe').onclick = () => { if (confirm('Apagar todos os dados e configurações deste navegador?')) { localStorage.removeItem(KEY); localStorage.removeItem(CFG); d = getData(); drawTags(); toast('Dados apagados.'); } };
  drawTags();
}
