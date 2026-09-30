/* ============================================================================
   APP.JS — logique partagée Mukanda v3
   Session, navigation, filtres catalogue, états "en préparation", toasts
   ============================================================================ */
const SB_URL = 'https://wyfkogowsdbxctbpfuud.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5ZmtvZ293c2RieGN0YnBmdXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MDc3MjAsImV4cCI6MjEwNjI4MzcyMH0.231eQ38RFvFaH3O6D-ReA8rlf3TehvWfcM-LBWocNEM';
const sb = window.supabase ? supabase.createClient(SB_URL, SB_KEY) : null;

/* ---------- Config pédagogique (structure visible avant le contenu) ---------- */
const NIVEAUX = [
  { id:'cepe', nom:'CEPE', desc:'Primaire · CM1–CM2', sujets:['Français','Maths','Éveil'] },
  { id:'bepc', nom:'BEPC', desc:'Collège · 6e–3e', sujets:['Français','Maths','SVT','Physique-Chimie','Histoire-Géo'] },
  { id:'bac',  nom:'BAC',  desc:'Lycée · séries A C D', sujets:['Maths','Physique-Chimie','SVT','Philosophie','Français'] },
  { id:'concours', nom:'Concours', desc:'Supérieur & pro', sujets:['Culture générale','Logique','Français pro'] }
];
const EMO_MATIERE = {'Français':'📖','Maths':'🧮','Éveil':'🌍','SVT':'🌱','Physique-Chimie':'⚗️','Histoire-Géo':'🗺️','Philosophie':'💭','Culture générale':'🎓','Logique':'🧠','Français pro':'💼'};

/* ---------- Utils ---------- */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fcfa = n => new Intl.NumberFormat('fr-FR').format(n||0) + ' FCFA';

function toast(msg){
  let t = $('#toast');
  if(!t){ t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(()=>t.classList.remove('show'), 2600);
}

/* ---------- Session ---------- */
async function getSession(){
  if(!sb) return null;
  const { data } = await sb.auth.getSession();
  return data?.session || null;
}
async function requireAuth(msg){
  const s = await getSession();
  if(!s){
    toast(msg || 'Connecte-toi pour accéder aux leçons');
    setTimeout(()=> location.href = 'auth.html?next=' + encodeURIComponent(location.pathname + location.search), 700);
    return null;
  }
  return s;
}
async function paintUser(){
  const s = await getSession();
  const av = $$('#avatarTop, #avatarSide');
  const nameEl = $('#sideName');
  if(s){
    const meta = s.user.user_metadata || {};
    const init = (meta.nom || s.user.email || 'M').trim().charAt(0).toUpperCase();
    av.forEach(a => a && (a.textContent = init));
    if(nameEl) nameEl.textContent = meta.nom || 'Élève Mukanda';
    const lv = $('#sideLevel'); if(lv) lv.textContent = (meta.niveau_scolaire||'').toUpperCase() || 'ÉLÈVE';
    const li = $('#loginItem'); if(li) li.remove();
  }
  return s;
}

/* ---------- Catalogue : cartes réelles (DB) + cartes "en préparation" ---------- */
function carteReelle(c){
  return `<a class="card" href="cours.html?id=${c.id}">
    <div class="thumb">${EMO_MATIERE[c.matiere]||'📘'}<span class="ribbon ok">DISPONIBLE</span></div>
    <div class="pad">
      <span class="badge lvl">${esc((c.niveau||'').toUpperCase())}</span>
      <h3>${esc(c.titre)}</h3>
      <div class="meta">${esc(c.matiere)} · PDF + vidéos + quiz</div>
      <div class="row"><span class="price">${fcfa(c.prix_fcfa)}</span><span class="btn btn-ink" style="padding:8px 14px;font-size:12.5px">Voir →</span></div>
    </div></a>`;
}
function cartePrepa(niveau, matiere){
  return `<div class="card">
    <div class="thumb">${EMO_MATIERE[matiere]||'📘'}<span class="ribbon">EN PRÉPARATION</span></div>
    <div class="pad">
      <span class="badge soon">🕒 Bientôt</span>
      <h3>${esc(matiere)} · ${esc(niveau.nom)}</h3>
      <div class="meta">PDF + vidéos + quiz · vérifiés par un prof</div>
      <div class="row"><span class="price">500–2 000 F</span>
      <button class="btn btn-ghost" style="padding:8px 12px;font-size:12.5px" onclick="toast('🔔 Tu seras prévenu dès la mise en ligne !')">🔔 Me prévenir</button></div>
    </div></div>`;
}
async function rendreCatalogue(state){
  const zone = $('#grilleCatalogue'); if(!zone) return;
  const niv = NIVEAUX.find(n=>n.id===state.niveau) || NIVEAUX[0];
  zone.innerHTML = '<div class="skel" style="height:180px"></div>'.repeat(3).replace(/<\/div>/g,'</div>');
  let reelles = [];
  if(sb){
    const r = await sb.from('cours').select('*').eq('actif', true).eq('niveau', niv.id);
    reelles = (r.data||[]).filter(c => state.matiere==='all' || c.matiere===state.matiere);
  }
  const sujets = state.matiere==='all' ? niv.sujets : [state.matiere];
  const prepa = sujets.filter(m => !reelles.some(c=>c.matiere===m)).map(m => cartePrepa(niv, m));
  zone.innerHTML = (reelles.map(carteReelle).join('') + prepa.join('')) ||
    `<div class="empty" style="grid-column:1/-1"><span class="big">🦜</span><h3>Rien ici pour l'instant</h3><p>Jaco prépare ce rayon. Reviens bientôt !</p></div>`;
  const cpt = $('#compteur'); if(cpt) cpt.textContent = `${reelles.length} disponible(s) · ${prepa.length} en préparation`;
}
function initFiltres(){
  const chips = $('#chipsNiveaux'); if(!chips) return;
  const state = { niveau:'cepe', matiere:'all' };
  chips.innerHTML = NIVEAUX.map(n=>`<button class="chip ${n.id===state.niveau?'on':''}" data-n="${n.id}">${n.nom}</button>`).join('');
  const sel = $('#selMatiere');
  const rebuildSel = ()=>{ const niv=NIVEAUX.find(n=>n.id===state.niveau); sel.innerHTML = `<option value="all">Toutes les matières</option>` + niv.sujets.map(m=>`<option>${m}</option>`).join(''); state.matiere='all'; };
  chips.addEventListener('click', e=>{
    const b = e.target.closest('.chip'); if(!b) return;
    state.niveau = b.dataset.n;
    $$('#chipsNiveaux .chip').forEach(c=>c.classList.toggle('on', c===b));
    rebuildSel(); rendreCatalogue(state);
  });
  sel.addEventListener('change', ()=>{ state.matiere = sel.value; rendreCatalogue(state); });
  rebuildSel(); rendreCatalogue(state);
}

/* ---------- Page cours : player squelette + leçons verrouillées ---------- */
async function rendreCours(){
  const zone = $('#coursZone'); if(!zone) return;
  const id = new URLSearchParams(location.search).get('id');
  const session = await getSession();
  let cours = null, lecons = [];
  if(sb && id){
    const r = await sb.from('cours').select('*').eq('id', id).maybeSingle();
    cours = r.data;
    if(cours){ const l = await sb.from('lecons').select('*').eq('cours_id', cours.id).order('ordre'); lecons = l.data||[]; }
  }
  const titre = cours ? cours.titre : 'Cours de démonstration';
  const liste = lecons.length ? lecons : [1,2,3,4,5,6].map(i=>({ ordre:i, titre:`Leçon ${i} — ${i===1?'Découverte':i===2?'Le concept':'Entraînement'}`, gratuite:i<=2, duree_secondes:720 }));
  zone.innerHTML = `
  <div class="authbar" ${session?'style="display:none"':''}>
    <span style="font-size:22px">🔐</span>
    <p>Les leçons sont réservées aux élèves inscrits. Crée ton compte gratuit pour recevoir <b>2 PDF + 2 vidéos offerts</b>.</p>
    <a class="btn btn-y" href="auth.html?next=${encodeURIComponent(location.pathname+'?'+location.search)}">Se connecter / S'inscrire</a>
  </div>
  <div class="page-head"><div><h1>${esc(titre)}</h1><div class="sub">${cours?esc(cours.matiere)+' · ':''}PDF + vidéos + quiz · voix de Jaco 🦜</div></div>
    ${cours?`<span class="price">${fcfa(cours.prix_fcfa)}</span>`:''}</div>
  <div class="grid-2" style="align-items:start">
    <div>
      <div class="player">
        <div class="screen"><span class="em">🎬</span><h3>Vidéo en préparation</h3><p>Jaco enregistre cette leçon (voix + slides). Disponible au lancement — les 2 premières vidéos seront offertes aux inscrits.</p></div>
        <div class="bar"><i></i></div>
        <div class="tabs">
          <button class="tab on" data-p="ecouter">🎧 Écouter</button>
          <button class="tab" data-p="lire">📄 Lire</button>
          <button class="tab" data-p="entrainer">✍️ S'entraîner</button>
        </div>
        <div class="tabpane on" data-p="ecouter"><div class="empty" style="border:none;padding:10px"><p style="margin:0">🎧 Audio + slides · ~2 Mo · pensé pour la 3G. <b>En préparation.</b></p></div></div>
        <div class="tabpane" data-p="lire"><div class="empty" style="border:none;padding:10px"><p style="margin:0">📄 Fiche PDF style cahier, imprimable. <b>En vérification par un prof.</b></p></div></div>
        <div class="tabpane" data-p="entrainer"><div class="empty" style="border:none;padding:10px"><p style="margin:0">🧠 Quiz corrigé instantanément + exercices. <b>Disponible au lancement.</b></p></div></div>
      </div>
      <div style="margin-top:12px;display:flex;align-items:center;gap:10px">
        <div class="prog" style="flex:1"><i style="width:0%"></i></div>
        <span style="font-size:12.5px;font-weight:800;color:var(--grey)">0 / ${liste.length} leçons</span>
      </div>
    </div>
    <div class="lessons">
      ${liste.map((l,i)=>`
      <div class="lesson">
        <span class="n">${l.ordre}</span>
        <div class="t">${esc(l.titre)}<div class="d">${Math.round((l.duree_secondes||720)/60)} min · ${l.gratuite?'Offerte':'Incluse dans le cours'}</div></div>
        <span class="st">${session ? (l.gratuite?'🎁':'🔒') : '🔒'}</span>
      </div>`).join('')}
      <button class="btn btn-y btn-block" style="margin-top:6px" onclick="toast('🛒 Achat disponible au lancement du catalogue !')">💳 Acheter ce cours</button>
    </div>
  </div>`;
  zone.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{
    zone.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x===t));
    zone.querySelectorAll('.tabpane').forEach(p=>p.classList.toggle('on', p.dataset.p===t.dataset.p));
  }));
}

/* ---------- Dashboard : cadeaux + mes cours + filtre classe ---------- */
async function rendreDashboard(){
  const s = await requireAuth('Connecte-toi pour voir tes cours');
  const zone = $('#dashZone'); if(!zone) return;
  if(!s){ zone.innerHTML=''; return; }
  const meta = s.user.user_metadata || {};
  let achats = [];
  if(sb){
    const r = await sb.from('achats').select('*').eq('user_id', s.user.id).eq('statut','paye');
    achats = r.data||[];
  }
  zone.innerHTML = `
  <div class="page-head"><div><h1>Salut ${esc((meta.nom||'élève').split(' ')[0])} 👋</h1>
  <div class="sub">Niveau ${(meta.niveau_scolaire||'').toUpperCase()||'—'} · prêt à kotanga ? 🦜</div></div></div>

  <div class="sec"><h2>🎁 Tes cadeaux d'inscription</h2><div class="ln"></div><span class="badge free">2 PDF + 2 vidéos</span></div>
  <div class="grid-2">
    ${['📄 PDF offert n°1','📄 PDF offert n°2','🎥 Vidéo offerte n°1','🎥 Vidéo offerte n°2'].map((t,i)=>`
    <div class="gift"><span class="em">${t.slice(0,2)}</span><div><div class="tt">${t.slice(3)}</div><div class="ss">Réservé aux inscrits · en préparation</div></div>
    <span class="badge soon st">🕒 Bientôt</span></div>`).join('')}
  </div>

  <div class="sec"><h2>📚 Mes cours</h2><div class="ln"></div>
    <select class="select" id="filtreClasse">
      <option value="all">Toutes les classes</option>
      ${NIVEAUX.map(n=>`<option value="${n.id}">${n.nom}</option>`).join('')}
    </select></div>
  <div id="mesCours"></div>`;
  const renderList = (cl)=>{
    const list = achats.filter(a=>cl==='all'||a.niveau===cl);
    $('#mesCours').innerHTML = list.length ? list.map(a=>`
      <div class="gift" style="margin-bottom:10px"><span class="em">📘</span><div><div class="tt">${esc(a.produit_id)}</div><div class="ss">Payé · ${fcfa(a.montant)}</div></div>
      <a class="btn btn-ink" style="margin-left:auto;padding:8px 14px;font-size:12.5px" href="cours.html?id=${a.produit_id}">Continuer →</a></div>`).join('')
    : `<div class="empty"><span class="big">🎒</span><h3>Aucun cours dans cette classe</h3>
       <p>Tes cours achetés (et tes cadeaux) apparaîtront ici. Le catalogue ouvre très bientôt.</p>
       <a class="btn btn-y" href="catalogue.html">Explorer le catalogue</a></div>`;
  };
  renderList('all');
  $('#filtreClasse').addEventListener('change', e=>renderList(e.target.value));
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  paintUser();
  initFiltres();
  rendreCours();
  rendreDashboard();
  $$('#btnLogout').forEach(b=>b.addEventListener('click', async ()=>{ if(sb){ await sb.auth.signOut(); location.href='index.html'; } }));
});