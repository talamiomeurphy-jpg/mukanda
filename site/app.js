// ============================================================================
// 🎓 MUKANDA — app.js v2 (accueil + fiche + paiement + succès + récupérer)
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

// ---------------- ACCUEIL ----------------
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
    <div class="contient"><b>Ce que tu reçois après paiement :</b>📄 PDF complet (aperçu 1-2 pages filigranées avant achat) · ⬇️ Téléchargement immédiat · 🔁 Lien retrouvable 48 h avec ton numéro (3 téléchargements).</div>
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

// ---------------- SUCCÈS + RÉCUPÉRER (partagé) ----------------
async function recupererLiens(tel){
  const r = await fetch(MUKANDA.FUNCTIONS + '/mukanda-download', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ telephone: tel }) });
  if(!r.ok) return null;
  const d = await r.json();
  return (d.liens && d.liens.length) ? d.liens : null;
}
function afficherLiens(liens, id){
  const c = document.getElementById(id); if(!c) return;
  c.innerHTML = liens.map(l => `<div class="lien-tel"><div><b>${esc(l.titre)}</b><div style="font-size:12px;color:var(--gris)">${fcfa(l.montant)} · lien valable 48 h</div></div><a class="btn btn-encre" href="${l.url}">⬇️ Télécharger</a></div>`).join('');
}
function rendreSucces(){
  const zone = document.getElementById('zone-liens'); if(!zone) return;
  const tel = param('tel') || localStorage.getItem('mukanda_tel');
  if(!tel){ document.getElementById('attente').innerHTML = '<p class="vide">Numéro introuvable — utilise « Récupérer mon achat ».</p>'; return; }
  let essais = 0; const max = 45; // ~3 min
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