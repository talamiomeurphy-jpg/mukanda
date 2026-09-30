// ============================================================================
// 🎓 MUKANDA — app.js v3 : catalogue + fiche + paiement + succès + récupérer
//      + VISIONNEUSE interne (pdf.js) + TÉLÉCHARGEMENT réel (blob)
// ============================================================================
const MUKANDA = {
  SUPABASE_URL: 'https://wyfkogowsdbxctbpfuud.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5ZmtvZ293c2RieGN0YnBmdXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MDc3MjAsImV4cCI6MjEwNjI4MzcyMH0.231eQ38RFvFaH3O6D-ReA8rlf3TehvWfcM-LBWocNEM',
  FUNCTIONS: 'https://wyfkogowsdbxctbpfuud.functions.supabase.co'
};
let supa = null;
function mkSupa(){ if(!supa && window.supabase) supa = window.supabase.createClient(MUKANDA.SUPABASE_URL, MUKANDA.ANON_KEY); return supa; }
const fcfa = n => new Intl.NumberFormat('fr-FR').format(n||0) + ' FCFA';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const param = n => new URLSearchParams(location.search).get(n);
const telValide = t => /^0[56]\d{7}$/.test(String(t).replace(/\s/g,''));

// ---------------- ACCUEIL / CATALOGUE ----------------
async function chargerCatalogue(){
  const s = mkSupa(); if(!s) return null;
  const [d,c] = await Promise.all([
    s.from('documents').select('id,titre,slug,description,categorie,niveau,matiere,prix_fcfa').eq('actif',true).order('created_at',{ascending:false}),
    s.from('cours').select('id,titre,slug,description,niveau,matiere,prix_fcfa').eq('actif',true).order('created_at',{ascending:false})
  ]);
  return { documents: d.data||[], cours: c.data||[] };
}
function carteProduit(p, type){
  const badge = type==='document' ? (p.categorie==='modele_pro'?'💼 Modèle pro': p.categorie==='exercice'?'✍️ Exercice':'🎓 Formation') : '🎓 Cours '+(p.niveau||'').toUpperCase();
  return `<a class="carte" href="produit.html?type=${type}&id=${p.id}"><span class="tampon">${badge}</span><h3>${esc(p.titre)}</h3><p>${esc((p.description||'').slice(0,110))}${(p.description||'').length>110?'…':''}</p><span class="prix">${fcfa(p.prix_fcfa)}</span></a>`;
}
async function rendreAccueil(){
  const g = document.getElementById('grille'); if(!g) return;
  const cat = await chargerCatalogue();
  if(!cat){ g.innerHTML = '<p class="vide">Impossible de charger le catalogue.</p>'; return; }
  if(!cat.documents.length && !cat.cours.length){ g.innerHTML = '<p class="vide">📚 Le catalogue ouvre très bientôt.</p>'; return; }
  g.innerHTML = cat.documents.map(p=>carteProduit(p,'document')).join('') + cat.cours.map(p=>carteProduit(p,'cours')).join('');
}

// ---------------- FICHE PRODUIT ----------------
async function rendreProduit(){
  const el = document.getElementById('fiche'); if(!el) return;
  const type = param('type')||'document', id = param('id'), s = mkSupa();
  if(!s || !id){ el.innerHTML = '<p class="vide">Produit introuvable.</p>'; return; }
  const r = await s.from(type==='cours'?'cours':'documents').select('*').eq('id',id).eq('actif',true).maybeSingle();
  const p = r.data;
  if(!p){ el.innerHTML = '<p class="vide">Ce produit n\'existe pas ou n\'est plus en ligne.</p>'; return; }
  const badge = type==='document' ? (p.categorie==='modele_pro'?'💼 Modèle pro': p.categorie==='exercice'?'✍️ Exercice':'🎓 Formation') : '🎓 Cours '+(p.niveau||'').toUpperCase();
  el.innerHTML = `
    <span class="tampon" style="color:var(--marge)">${badge}</span>
    <h1>${esc(p.titre)}</h1>
    <div class="meta-tags">${p.niveau?`<span class="meta-tag">🎓 ${esc((p.niveau||'').toUpperCase())}</span>`:''}${p.matiere?`<span class="meta-tag">📘 ${esc(p.matiere)}</span>`:''}${p.serie?`<span class="meta-tag">Série ${esc(p.serie)}</span>`:''}</div>
    <p class="desc">${esc(p.description||'')}</p>
    <div class="contient"><b>Ce que tu reçois après paiement :</b>📄 PDF complet, lisible DANS le site · ⬇️ Téléchargement réel sur ton téléphone · 🔁 Lien retrouvable 48 h avec ton numéro (3 téléchargements).</div>
    <div class="ligne-prix"><span class="prix">${fcfa(p.prix_fcfa)}</span><a class="btn btn-surligne" href="paiement.html?type=${type}&id=${p.id}">💳 Acheter maintenant</a></div>
    <p style="font-size:13px;color:var(--gris)">Paiement MTN MoMo ou Airtel Money · Aucun compte nécessaire.</p>`;
}

// ---------------- PAIEMENT ----------------
async function rendrePaiement(){
  const t = document.getElementById('prod-titre'); if(!t) return;
  const type = param('type')||'document', id = param('id'), s = mkSupa();
  const r = await s.from(type==='cours'?'cours':'documents').select('titre,prix_fcfa').eq('id',id).maybeSingle();
  if(!r.data){ t.textContent = 'Produit introuvable'; return; }
  t.textContent = r.data.titre;
  document.getElementById('prod-prix').textContent = fcfa(r.data.prix_fcfa);
  window.__cmd = { type, id };
}
function choisirProvider(el){ document.querySelectorAll('.provider').forEach(x=>x.classList.remove('sel')); el.classList.add('sel'); el.querySelector('input').checked = true; }
function afficherErreur(id, msg){ const e = document.getElementById(id); if(e){ e.textContent = '⚠️ ' + msg; e.style.display = 'block'; } }
function cacherErreur(id){ const e = document.getElementById(id); if(e) e.style.display = 'none'; }
async function lancerPaiement(){
  if(!window.__cmd){ afficherErreur('erreur','Produit manquant — repasse par le catalogue.'); return; }
  const tel = document.getElementById('tel').value.trim();
  if(!telValide(tel)){ afficherErreur('erreur','Numéro congolais invalide (ex : 065186967).'); return; }
  const prov = document.querySelector('.provider input:checked')?.value || 'MTN';
  const btn = document.getElementById('btn-payer');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Envoi de la demande…';
  cacherErreur('erreur');
  try {
    const r = await fetch(MUKANDA.FUNCTIONS + '/mukanda-pay', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ produit_type: window.__cmd.type, produit_id: window.__cmd.id, telephone: tel, provider: prov }) });
    const d = await r.json();
    if(!r.ok || !d.ok){ afficherErreur('erreur', d.error || 'Erreur de paiement. Réessaie.'); return; }
    localStorage.setItem('mukanda_tel', tel);
    location.href = 'succes.html?tel=' + encodeURIComponent(tel) + '&achat=' + encodeURIComponent(d.achat_id || '');
  } catch(e){ afficherErreur('erreur','Connexion au service de paiement impossible. Réessaie.'); }
  finally { btn.disabled = false; btn.innerHTML = '📲 Payer — mon téléphone sonne'; }
}

// ---------------- VOIR DANS LE SITE + TÉLÉCHARGER VRAIMENT ----------------
window.__cacheLiens = {};
async function resoudreLien(urlToken){
  if(window.__cacheLiens[urlToken]) return window.__cacheLiens[urlToken];
  const r = await fetch(urlToken);
  const d = await r.json().catch(()=>null);
  if(!r.ok || !d || !d.ok){ alert('⚠️ ' + ((d && d.error) || 'Lien expiré — utilise « Récupérer mon achat ».')); return null; }
  window.__cacheLiens[urlToken] = d;
  return d;
}
function injecterVisionneuse(){
  if(document.getElementById('visionneuse')) return;
  const css = document.createElement('style');
  css.textContent = '.visionneuse{position:fixed;inset:0;z-index:60;background:rgba(16,26,51,.94);display:flex;flex-direction:column;padding:12px}.vis-head{display:flex;justify-content:space-between;align-items:center;gap:10px;color:var(--craie);margin-bottom:10px;font-family:"Baloo 2",cursive}.vis-pages{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;align-items:center}.vis-pages canvas{max-width:100%;height:auto;border-radius:6px;box-shadow:0 6px 24px rgba(0,0,0,.5);background:#fff}';
  document.head.appendChild(css);
  const v = document.createElement('div');
  v.className = 'visionneuse'; v.id = 'visionneuse'; v.style.display = 'none';
  v.innerHTML = `<div class="vis-head"><b id="vis-titre">Aperçu</b><button class="btn btn-surligne" onclick="fermerVisionneuse()">✕ Fermer</button></div><div class="vis-pages" id="vis-pages"></div>`;
  document.body.appendChild(v);
}
function chargerPdfJs(){
  return new Promise((res, rej) => {
    if(window.pdfjsLib) return res();
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; res(); };
    s.onerror = rej;
    document.head.appendChild(s);
  });
}
async function voirSurSite(urlToken){
  injecterVisionneuse();
  const d = await resoudreLien(urlToken); if(!d) return;
  const v = document.getElementById('visionneuse');
  const cont = document.getElementById('vis-pages');
  document.getElementById('vis-titre').textContent = '👁️ ' + d.titre;
  v.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  cont.innerHTML = '<p class="vide" style="max-width:420px">Chargement de l\'aperçu…</p>';
  try {
    await chargerPdfJs();
    const pdf = await pdfjsLib.getDocument(d.vue_url).promise;
    cont.innerHTML = '';
    for(let i = 1; i <= pdf.numPages; i++){
      const page = await pdf.getPage(i);
      const base = page.getViewport({ scale: 1 });
      const scale = Math.min(2, (Math.min(cont.clientWidth || 800, 900)) / base.width);
      const vp = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = vp.width; canvas.height = vp.height;
      cont.appendChild(canvas);
      await page.render({ canvasContext: canvas, viewport: vp }).promise;
    }
  } catch(e){
    cont.innerHTML = '<p class="vide" style="max-width:420px">Aperçu impossible sur cet appareil — utilise ⬇️ Télécharger, le fichier t\'appartient.</p>';
  }
}
function fermerVisionneuse(){
  const v = document.getElementById('visionneuse');
  if(v) v.style.display = 'none';
  document.body.style.overflow = '';
}
async function telechargerVraiment(urlToken){
  const d = await resoudreLien(urlToken); if(!d) return;
  const f = await fetch(d.telechargement_url);
  if(!f.ok){ alert('⚠️ Téléchargement impossible — réessaie ou utilise « Récupérer mon achat ».'); return; }
  const blob = await f.blob();
  const o = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = o; a.download = (d.titre || 'mukanda-document') + '.pdf';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(o), 5000);
}

// ---------------- SUCCÈS + RÉCUPÉRER ----------------
async function recupererLiens(tel){
  const r = await fetch(MUKANDA.FUNCTIONS + '/mukanda-download', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ telephone: tel }) });
  if(!r.ok) return null;
  const d = await r.json();
  return (d.liens && d.liens.length) ? d.liens : null;
}
function afficherLiens(liens, id){
  const c = document.getElementById(id); if(!c) return;
  c.innerHTML = liens.map(l => `<div class="lien-tel">
    <div><b>${esc(l.titre)}</b><div style="font-size:12px;color:var(--gris)">${fcfa(l.montant)} · lien valable 48 h</div></div>
    <div class="lien-actions" style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-encre" onclick="voirSurSite('${l.url}')">👁️ Voir</button>
      <button class="btn btn-surligne" onclick="telechargerVraiment('${l.url}')">⬇️ Télécharger</button>
    </div></div>`).join('');
}
function rendreSucces(){
  const zone = document.getElementById('zone-liens'); if(!zone) return;
  const tel = param('tel') || localStorage.getItem('mukanda_tel');
  if(!tel){ document.getElementById('attente').innerHTML = '<p class="vide">Numéro introuvable — utilise « Récupérer mon achat ».</p>'; return; }
  let essais = 0; const max = 45;
  const t = setInterval(async () => {
    essais++;
    const liens = await recupererLiens(tel).catch(()=>null);
    if(liens){
      clearInterval(t);
      document.getElementById('titre-succes').textContent = '🎉 Paiement confirmé !';
      document.getElementById('attente').style.display = 'none';
      afficherLiens(liens, 'zone-liens');
    } else if(essais >= max){
      clearInterval(t);
      document.getElementById('attente').innerHTML = '<p class="vide">C\'est long ? Vérifie que tu as validé sur ton téléphone, puis <a href="recuperer.html">Récupérer mon achat</a> ou <a href="https://wa.me/242065186967">WhatsApp</a>.</p>';
    }
  }, 4000);
}
function rendreRecuperer(){
  const btn = document.getElementById('btn-recuperer'); if(!btn) return;
  btn.addEventListener('click', async () => {
    const tel = document.getElementById('tel-rec').value.trim();
    cacherErreur('msg-rec');
    if(!telValide(tel)){ afficherErreur('msg-rec','Numéro congolais invalide (ex : 065186967).'); return; }
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Recherche…';
    const liens = await recupererLiens(tel).catch(()=>null);
    btn.disabled = false; btn.innerHTML = '🔎 Retrouver mes achats';
    if(!liens){ afficherErreur('msg-rec','Aucun achat payé trouvé pour ce numéro (30 derniers jours).'); return; }
    afficherLiens(liens, 'zone-rec');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  rendreAccueil(); rendreProduit(); rendrePaiement(); rendreSucces(); rendreRecuperer();
});

// ---------------- BEST-SELLERS & NOUVEAUTÉS ----------------
function carteProduitAccueil(p, type){
  const badge = type==='document'
    ? (p.categorie==='modele_pro'?'💼 Modèle pro': p.categorie==='exercice'?'✍️ Exercice':'🎓 Formation')
    : '🎓 Cours '+(p.niveau||'').toUpperCase();
  return `<a class="carte" href="produit.html?type=${type}&id=${p.id}"><span class="tampon">${badge}</span><h3>${esc(p.titre)}</h3><p>${esc((p.description||'').slice(0,110))}${(p.description||'').length>110?'…':''}</p><span class="prix">${fcfa(p.prix_fcfa)}</span></a>`;
}
async function rendreAccueilCatalogue(){
  const bs = document.getElementById('bestsellers');
  const nv = document.getElementById('nouveautes');
  if(!bs && !nv) return;
  const s = mkSupa(); if(!s){ bs && (bs.innerHTML = '<p class="vide">Catalogue hors ligne.</p>'); nv && (nv.innerHTML = '<p class="vide">Catalogue hors ligne.</p>'); return; }
  const [d,c] = await Promise.all([
    s.from('documents').select('id,titre,slug,description,categorie,niveau,matiere,prix_fcfa').eq('actif',true).order('created_at',{ascending:false}).limit(8),
    s.from('cours').select('id,titre,slug,description,niveau,matiere,prix_fcfa').eq('actif',true).order('created_at',{ascending:false}).limit(8)
  ]);
  const docs = d.data||[], cours = c.data||[];
  if(nv){
    nv.innerHTML = (docs.length || cours.length)
      ? [...docs.slice(0,4), ...cours.slice(0,4)].slice(0,6).map((p,i)=>carteProduitAccueil(p, i<docs.length?'document':'cours')).join('')
      : '<p class="vide">📚 Le catalogue ouvre très bientôt.</p>';
  }
  if(bs){
    // Pour l'instant, mêmes produits que nouveautés (pas encore de compteur de ventes)
    bs.innerHTML = nv ? nv.innerHTML : '<p class="vide">Chargement…</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  rendreAccueilCatalogue();
  rendreProduit(); rendrePaiement(); rendreSucces(); rendreRecuperer();
});