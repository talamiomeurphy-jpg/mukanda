// ============================================================================
// 🎓 MUKANDA — app.js (config + catalogue public)
// ============================================================================
const MUKANDA = {
  SUPABASE_URL: 'https://wyfkogowsdbxctbpfuud.supabase.co',
  // ⬇️ SEULE ligne à remplir : Settings → API → "anon public" (clé PUBLIQUE, sans risque — jamais la service_role ici)
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5ZmtvZ293c2RieGN0YnBmdXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MDc3MjAsImV4cCI6MjEwNjI4MzcyMH0.231eQ38RFvFaH3O6D-ReA8rlf3TehvWfcM-LBWocNEM',
  FUNCTIONS: 'https://wyfkogowsdbxctbpfuud.functions.supabase.co'
};

let supa = null;
function mkSupa() {
  if (!supa && window.supabase && !MUKANDA.ANON_KEY.includes('COLLE')) {
    supa = window.supabase.createClient(MUKANDA.SUPABASE_URL, MUKANDA.ANON_KEY);
  }
  return supa;
}
const fcfa = n => new Intl.NumberFormat('fr-FR').format(n || 0) + ' FCFA';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function chargerCatalogue() {
  const s = mkSupa(); if (!s) return null;
  const [d, c] = await Promise.all([
    s.from('documents').select('id,titre,slug,description,categorie,niveau,matiere,prix_fcfa').eq('actif', true).order('created_at', { ascending: false }),
    s.from('cours').select('id,titre,slug,description,niveau,matiere,prix_fcfa').eq('actif', true).order('created_at', { ascending: false })
  ]);
  return { documents: d.data || [], cours: c.data || [] };
}

function carteProduit(p, type) {
  const badge = type === 'document'
    ? (p.categorie === 'modele_pro' ? '💼 Modèle pro' : p.categorie === 'exercice' ? '✍️ Exercice' : '🎓 Formation')
    : '🎓 Cours ' + (p.niveau || '').toUpperCase();
  return `<a class="carte" href="produit.html?type=${type}&id=${p.id}">
    <span class="tampon">${badge}</span>
    <h3>${esc(p.titre)}</h3>
    <p>${esc((p.description || '').slice(0, 110))}${(p.description || '').length > 110 ? '…' : ''}</p>
    <span class="prix">${fcfa(p.prix_fcfa)}</span>
  </a>`;
}

async function rendreAccueil() {
  const grille = document.getElementById('grille');
  if (!grille) return;
  if (MUKANDA.ANON_KEY.includes('COLLE')) {
    grille.innerHTML = '<div class="alerte-config">⚠️ Dernière clé à coller : ouvre site/app.js et remplace COLLE_TA_CLE_ANON_ICI par ta clé « anon public » (Supabase → Settings → API). C\'est une clé publique, zéro risque.</div>';
    return;
  }
  const cat = await chargerCatalogue();
  if (!cat) { grille.innerHTML = '<p class="vide">Impossible de charger le catalogue.</p>'; return; }
  if (!cat.documents.length && !cat.cours.length) {
    grille.innerHTML = '<p class="vide">📚 Le catalogue ouvre très bientôt — premiers cours CEPE en préparation.</p>';
    return;
  }
  grille.innerHTML = cat.documents.map(p => carteProduit(p, 'document')).join('') + cat.cours.map(p => carteProduit(p, 'cours')).join('');
}
document.addEventListener('DOMContentLoaded', rendreAccueil);