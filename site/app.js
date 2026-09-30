/* ============================================================================
   APP.JS — Logique partagée Mukanda v4
   ✅ ZÉRO redirection automatique — l'utilisateur garde le contrôle
   Catalogue filtrable, page cours, dashboard, toasts, session
   ============================================================================ */

// ============ CONFIGURATION SUPABASE ============
const SB_URL = 'https://wyfkogowsdbxctbpfuud.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5ZmtvZ293c2RieGN0YnBmdXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MDc3MjAsImV4cCI6MjEwNjI4MzcyMH0.231eQ38RFvFaH3O6D-ReA8rlf3TehvWfcM-LBWocNEM';

let sb = null;
try {
  if (window.supabase && SB_URL && SB_KEY) {
    sb = window.supabase.createClient(SB_URL, SB_KEY);
    console.log('✅ Supabase initialisé');
  }
} catch (err) {
  console.error('❌ Erreur initialisation Supabase:', err);
}

// ============ CONFIG PÉDAGOGIQUE ============
const NIVEAUX = [
  { 
    id: 'cepe', 
    nom: 'CEPE', 
    desc: 'Primaire · CM1–CM2', 
    icon: '🎓',
    sujets: ['Français', 'Maths', 'Éveil'] 
  },
  { 
    id: 'bepc', 
    nom: 'BEPC', 
    desc: 'Collège · 6e–3e', 
    icon: '📘',
    sujets: ['Français', 'Maths', 'SVT', 'Physique-Chimie', 'Histoire-Géo'] 
  },
  { 
    id: 'bac',  
    nom: 'BAC',  
    desc: 'Lycée · séries A C D', 
    icon: '🏆',
    sujets: ['Maths', 'Physique-Chimie', 'SVT', 'Philosophie', 'Français'] 
  },
  { 
    id: 'concours', 
    nom: 'Concours', 
    desc: 'Supérieur & pro', 
    icon: '💼',
    sujets: ['Culture générale', 'Logique', 'Français pro'] 
  }
];

const EMO_MATIERE = {
  'Français': '📖',
  'Maths': '🧮',
  'Éveil': '🌍',
  'SVT': '🌱',
  'Physique-Chimie': '⚗️',
  'Histoire-Géo': '🗺️',
  'Philosophie': '💭',
  'Culture générale': '🎓',
  'Logique': '🧠',
  'Français pro': '💼'
};

// ============ UTILITAIRES ============
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const fcfa = (n) => new Intl.NumberFormat('fr-FR').format(n || 0) + ' FCFA';

function toast(msg, duration = 3000) {
  let t = $('#toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), duration);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============ SESSION ============
async function getSession() {
  if (!sb) return null;
  try {
    const { data } = await sb.auth.getSession();
    return data?.session || null;
  } catch (err) {
    console.error('❌ Erreur getSession:', err);
    return null;
  }
}

/**
 * Peint l'utilisateur dans la sidebar/topbar si connecté
 * NE REDIRIGE JAMAIS — affiche juste les infos
 */
async function paintUser() {
  const s = await getSession();
  const av = $$('#avatarTop, #avatarSide');
  const nameEl = $('#sideName');
  const levelEl = $('#sideLevel');
  const loginItem = $('#loginItem');
  const logoutBtn = $('#btnLogout');
  
  if (s) {
    const meta = s.user.user_metadata || {};
    const init = (meta.nom || s.user.email || 'M').trim().charAt(0).toUpperCase();
    
    av.forEach(a => {
      if (a) a.textContent = init;
    });
    
    if (nameEl) nameEl.textContent = meta.nom || 'Élève Mukanda';
    if (levelEl) levelEl.textContent = (meta.niveau_scolaire || '').toUpperCase() || 'ÉLÈVE';
    
    // Cacher le lien "Se connecter" dans la sidebar
    if (loginItem) loginItem.style.display = 'none';
    
    // Afficher le bouton de déconnexion
    if (logoutBtn) {
      logoutBtn.style.display = 'flex';
      logoutBtn.onclick = async () => {
        if (sb) {
          await sb.auth.signOut();
          toast('👋 Déconnecté avec succès');
          setTimeout(() => location.href = 'index.html', 800);
        }
      };
    }
    
    console.log('✅ Utilisateur connecté:', meta.nom || s.user.email);
  } else {
    console.log('👤 Utilisateur non connecté');
  }
  
  return s;
}

// ============ CATALOGUE ============

/**
 * Carte de cours RÉEL (dans la base de données)
 */
function carteReelle(c) {
  const em = EMO_MATIERE[c.matiere] || '📘';
  return `
    <a class="card" href="cours.html?id=${c.id}">
      <div class="thumb">
        ${em}
        <span class="ribbon ok">DISPONIBLE</span>
      </div>
      <div class="pad">
        <span class="badge lvl">${esc((c.niveau || '').toUpperCase())}</span>
        <h3>${esc(c.titre)}</h3>
        <div class="meta">${esc(c.matiere)} · PDF + vidéos + quiz</div>
        <div class="row">
          <span class="price">${fcfa(c.prix_fcfa)}</span>
          <span class="btn btn-ink" style="padding:8px 14px;font-size:12.5px">Voir →</span>
        </div>
      </div>
    </a>
  `;
}

/**
 * Carte "EN PRÉPARATION" pour matière sans contenu
 */
function cartePrepa(niveau, matiere) {
  const em = EMO_MATIERE[matiere] || '📘';
  return `
    <div class="card">
      <div class="thumb">
        ${em}
        <span class="ribbon">EN PRÉPARATION</span>
      </div>
      <div class="pad">
        <span class="badge soon">🕒 Bientôt</span>
        <h3>${esc(matiere)} · ${esc(niveau.nom)}</h3>
        <div class="meta">PDF + vidéos + quiz · vérifiés par un prof</div>
        <div class="row">
          <span class="price">500–2 000 F</span>
          <button class="btn btn-ghost" 
                  style="padding:8px 12px;font-size:12.5px" 
                  onclick="mePrevenir('${esc(niveau.nom)}', '${esc(matiere)}')">
            🔔 Me prévenir
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Fonction appelée quand l'utilisateur veut être prévenu d'une matière
 */
function mePrevenir(niveau, matiere) {
  toast(`🔔 ${matiere} · ${niveau} : tu seras prévenu dès la mise en ligne !`);
  // TODO : plus tard, on enregistrera l'email/téléphone dans une table notifications
}

// Exposer globalement pour onclick HTML
window.mePrevenir = mePrevenir;

/**
 * Charge et affiche le catalogue selon le filtre actuel
 */
async function rendreCatalogue(state) {
  const zone = $('#grilleCatalogue');
  if (!zone) return;
  
  const niv = NIVEAUX.find(n => n.id === state.niveau) || NIVEAUX[0];
  
  // Skeleton de chargement
  zone.innerHTML = '<div class="skel" style="height:180px"></div>'.repeat(6);
  
  let reelles = [];
  if (sb) {
    try {
      const r = await sb.from('cours')
        .select('*')
        .eq('actif', true)
        .eq('niveau', niv.id);
      reelles = (r.data || []).filter(c => 
        state.matiere === 'all' || c.matiere === state.matiere
      );
    } catch (err) {
      console.error('❌ Erreur chargement catalogue:', err);
      zone.innerHTML = `
        <div class="empty" style="grid-column:1/-1">
          <span class="big">⚠️</span>
          <h3>Erreur de chargement</h3>
          <p>Impossible de récupérer le catalogue. Vérifie ta connexion internet.</p>
        </div>
      `;
      return;
    }
  }
  
  // Cartes "en préparation" pour matières sans contenu
  const sujets = state.matiere === 'all' ? niv.sujets : [state.matiere];
  const prepa = sujets
    .filter(m => !reelles.some(c => c.matiere === m))
    .map(m => cartePrepa(niv, m));
  
  const html = reelles.map(carteReelle).join('') + prepa.join('');
  
  if (html) {
    zone.innerHTML = html;
  } else {
    zone.innerHTML = `
      <div class="empty" style="grid-column:1/-1">
        <span class="big">🦜</span>
        <h3>Rien ici pour l'instant</h3>
        <p>Jaco prépare ce rayon. Reviens bientôt !</p>
      </div>
    `;
  }
  
  // Compteur
  const cpt = $('#compteur');
  if (cpt) {
    cpt.textContent = `${reelles.length} disponible(s) · ${prepa.length} en préparation`;
  }
}

/**
 * Initialise les filtres du catalogue (chips niveaux + select matière)
 */
function initFiltres() {
  const chips = $('#chipsNiveaux');
  if (!chips) return;
  
  // État actuel
  const state = { 
    niveau: 'cepe', 
    matiere: 'all' 
  };
  
  // Vérifier s'il y a un paramètre URL ?n=...
  const urlNiveau = new URLSearchParams(location.search).get('n');
  if (urlNiveau && NIVEAUX.find(n => n.id === urlNiveau)) {
    state.niveau = urlNiveau;
  }
  
  // Construire les chips de niveaux
  chips.innerHTML = NIVEAUX.map(n => `
    <button class="chip ${n.id === state.niveau ? 'on' : ''}" data-n="${n.id}">
      ${n.icon} ${n.nom}
    </button>
  `).join('');
  
  // Select de matière
  const sel = $('#selMatiere');
  
  const rebuildSel = () => {
    const niv = NIVEAUX.find(n => n.id === state.niveau);
    if (!sel) return;
    sel.innerHTML = `
      <option value="all">Toutes les matières</option>
      ${niv.sujets.map(m => `<option>${m}</option>`).join('')}
    `;
    state.matiere = 'all';
  };
  
  // Événements sur les chips
  chips.addEventListener('click', e => {
    const b = e.target.closest('.chip');
    if (!b) return;
    state.niveau = b.dataset.n;
    $$('#chipsNiveaux .chip').forEach(c => 
      c.classList.toggle('on', c === b)
    );
    rebuildSel();
    rendreCatalogue(state);
  });
  
  // Événement sur le select
  if (sel) {
    sel.addEventListener('change', () => {
      state.matiere = sel.value;
      rendreCatalogue(state);
    });
  }
  
  // Rendu initial
  rebuildSel();
  rendreCatalogue(state);
}

// ============ PAGE COURS ============

/**
 * Affiche la page d'un cours : player + liste des leçons
 */
async function rendreCours() {
  const zone = $('#coursZone');
  if (!zone) return;
  
  const id = new URLSearchParams(location.search).get('id');
  const session = await getSession();
  
  let cours = null;
  let lecons = [];
  
  if (sb && id) {
    try {
      const r = await sb.from('cours')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      cours = r.data;
      
      if (cours) {
        const l = await sb.from('lecons')
          .select('*')
          .eq('cours_id', cours.id)
          .order('ordre');
        lecons = l.data || [];
      }
    } catch (err) {
      console.error('❌ Erreur chargement cours:', err);
    }
  }
  
  // Données par défaut si pas de cours en base
  const titre = cours ? cours.titre : 'Cours de démonstration';
  const matiere = cours ? cours.matiere : 'Maths';
  const prix = cours ? cours.prix_fcfa : 1500;
  
  // Liste des leçons (réelles ou de démo)
  const liste = lecons.length ? lecons : [
    { ordre: 1, titre: 'Leçon 1 — Découverte du concept', gratuite: true, duree_secondes: 720 },
    { ordre: 2, titre: 'Leçon 2 — Comprendre en profondeur', gratuite: true, duree_secondes: 900 },
    { ordre: 3, titre: 'Leçon 3 — Application pratique', gratuite: false, duree_secondes: 840 },
    { ordre: 4, titre: 'Leçon 4 — Exercices guidés', gratuite: false, duree_secondes: 960 },
    { ordre: 5, titre: 'Leçon 5 — Cas complexes', gratuite: false, duree_secondes: 1080 },
    { ordre: 6, titre: 'Leçon 6 — Révision finale', gratuite: false, duree_secondes: 780 }
  ];
  
  // Bannière auth (affichée seulement si non connecté)
  const authBar = session ? '' : `
    <div class="authbar">
      <span style="font-size:22px">🔐</span>
      <p>Les leçons sont réservées aux élèves inscrits. Crée ton compte gratuit pour recevoir 
         <b>2 PDF + 2 vidéos offerts</b> à l'inscription.</p>
      <a class="btn btn-y" 
         href="auth.html?next=${encodeURIComponent(location.pathname + location.search)}">
         Se connecter / S'inscrire
      </a>
    </div>
  `;
  
  zone.innerHTML = `
    ${authBar}
    
    <div class="page-head">
      <div>
        <h1>${esc(titre)}</h1>
        <div class="sub">
          ${cours ? esc(cours.matiere) + ' · ' : ''}
          PDF + vidéos + quiz · voix de Jaco 🦜
        </div>
      </div>
      <span class="price">${fcfa(prix)}</span>
    </div>
    
    <div class="grid-2" style="align-items:start">
      <div>
        <div class="player">
          <div class="screen">
            <span class="em">🎬</span>
            <h3>Vidéo en préparation</h3>
            <p>Jaco enregistre cette leçon (voix + slides). Disponible au lancement — 
               les 2 premières vidéos seront offertes aux inscrits.</p>
          </div>
          <div class="bar"><i></i></div>
          <div class="tabs">
            <button class="tab on" data-p="ecouter">🎧 Écouter</button>
            <button class="tab" data-p="lire">📄 Lire</button>
            <button class="tab" data-p="entrainer">✍️ S'entraîner</button>
          </div>
          <div class="tabpane on" data-p="ecouter">
            <div class="empty" style="border:none;padding:20px">
              <span class="big">🎧</span>
              <h3>Audio + slides</h3>
              <p>~2 Mo · pensé pour la 3G · <b>En préparation.</b></p>
            </div>
          </div>
          <div class="tabpane" data-p="lire">
            <div class="empty" style="border:none;padding:20px">
              <span class="big">📄</span>
              <h3>Fiche PDF cahier</h3>
              <p>Imprimable · <b>En vérification par un prof.</b></p>
            </div>
          </div>
          <div class="tabpane" data-p="entrainer">
            <div class="empty" style="border:none;padding:20px">
              <span class="big">🧠</span>
              <h3>Quiz & exercices</h3>
              <p>Corrigé instantané · <b>Disponible au lancement.</b></p>
            </div>
          </div>
        </div>
        
        <div style="margin-top:12px;display:flex;align-items:center;gap:10px">
          <div class="prog" style="flex:1"><i style="width:0%"></i></div>
          <span style="font-size:12.5px;font-weight:800;color:var(--grey)">
            0 / ${liste.length} leçons
          </span>
        </div>
      </div>
      
      <div class="lessons">
        ${liste.map(l => `
          <div class="lesson">
            <span class="n">${l.ordre}</span>
            <div class="t">
              ${esc(l.titre)}
              <div class="d">
                ${Math.round((l.duree_secondes || 720) / 60)} min · 
                ${l.gratuite ? 'Offerte 🎁' : 'Incluse dans le cours'}
              </div>
            </div>
            <span class="st">${session ? (l.gratuite ? '🎁' : '🔒') : '🔒'}</span>
          </div>
        `).join('')}
        
        <button class="btn btn-y btn-block" 
                style="margin-top:8px" 
                onclick="acheterCours()">
          💳 Acheter ce cours · ${fcfa(prix)}
        </button>
      </div>
    </div>
  `;
  
  // Gestion des onglets
  zone.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => {
      zone.querySelectorAll('.tab').forEach(x => 
        x.classList.toggle('on', x === t)
      );
      zone.querySelectorAll('.tabpane').forEach(p => 
        p.classList.toggle('on', p.dataset.p === t.dataset.p)
      );
    });
  });
}

/**
 * Gestion du clic "Acheter ce cours"
 */
function acheterCours() {
  const session = sb ? sb.auth.getSession() : null;
  toast('🛒 Achat disponible au lancement du catalogue !');
  // TODO : rediriger vers paiement.html quand ce sera prêt
}
window.acheterCours = acheterCours;

// ============ DASHBOARD ============

/**
 * Affiche le dashboard (cadeaux + mes cours)
 * ✅ NE REDIRIGE PAS si non connecté — affiche juste un état vide + bouton
 */
async function rendreDashboard() {
  const zone = $('#dashZone');
  if (!zone) return;
  
  const session = await getSession();
  
  // État NON connecté : afficher un accueil personnalisé
  if (!session) {
    zone.innerHTML = `
      <div class="page-head">
        <div>
          <h1>🎒 Mes cours</h1>
          <div class="sub">Espace personnel · connecte-toi pour accéder à tes contenus</div>
        </div>
      </div>
      
      <div class="empty" style="padding:50px 30px">
        <span class="big">🔐</span>
        <h3>Connecte-toi pour accéder à tes cours</h3>
        <p>Tes cadeaux d'inscription (2 PDF + 2 vidéos offerts), tes cours achetés 
           et ta progression apparaîtront ici. Crée ton compte gratuit en 30 secondes.</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:20px">
          <a class="btn btn-y" href="auth.html?next=${encodeURIComponent(location.pathname)}">
            ✨ Créer mon compte
          </a>
          <a class="btn btn-ink" href="auth.html?next=${encodeURIComponent(location.pathname)}&tab=login">
            🔐 J'ai déjà un compte
          </a>
        </div>
      </div>
      
      <div class="sec" style="margin-top:40px">
        <h2>🎯 Pourquoi s'inscrire ?</h2>
        <div class="ln"></div>
      </div>
      <div class="grid-3">
        <div class="feature">
          <span class="em">🎁</span>
          <h3>2 PDF + 2 vidéos gratuits</h3>
          <p>Offerts dès l'inscription, sans engagement.</p>
        </div>
        <div class="feature">
          <span class="em">📊</span>
          <h3>Progression sauvegardée</h3>
          <p>Reprends où tu t'es arrêté, sur n'importe quel appareil.</p>
        </div>
        <div class="feature">
          <span class="em">🏆</span>
          <h3>Badges et certificats</h3>
          <p>Gagne des badges à chaque cours complété.</p>
        </div>
      </div>
    `;
    return;
  }
  
  // État CONNECTÉ : afficher le vrai dashboard
  const meta = session.user.user_metadata || {};
  
  // Charger les achats
  let achats = [];
  if (sb) {
    try {
      const r = await sb.from('achats')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('statut', 'paye');
      achats = r.data || [];
    } catch (err) {
      console.error('❌ Erreur chargement achats:', err);
    }
  }
  
  zone.innerHTML = `
    <div class="page-head">
      <div>
        <h1>Salut ${esc((meta.nom || 'élève').split(' ')[0])} 👋</h1>
        <div class="sub">
          Niveau ${(meta.niveau_scolaire || '').toUpperCase() || '—'} · 
          prêt à kotanga ? 🦜
        </div>
      </div>
    </div>
    
    <div class="sec">
      <h2>🎁 Tes cadeaux d'inscription</h2>
      <div class="ln"></div>
      <span class="badge free">2 PDF + 2 vidéos</span>
    </div>
    
    <div class="grid-2">
      ${[
        { em: '📄', tt: 'PDF offert n°1', ss: 'En préparation' },
        { em: '📄', tt: 'PDF offert n°2', ss: 'En préparation' },
        { em: '🎥', tt: 'Vidéo offerte n°1', ss: 'En préparation' },
        { em: '🎥', tt: 'Vidéo offerte n°2', ss: 'En préparation' }
      ].map(g => `
        <div class="gift">
          <span class="em">${g.em}</span>
          <div>
            <div class="tt">${g.tt}</div>
            <div class="ss">Réservé aux inscrits · ${g.ss}</div>
          </div>
          <span class="badge soon st">🕒 Bientôt</span>
        </div>
      `).join('')}
    </div>
    
    <div class="sec">
      <h2>📚 Mes cours</h2>
      <div class="ln"></div>
      <select class="select" id="filtreClasse">
        <option value="all">Toutes les classes</option>
        ${NIVEAUX.map(n => `<option value="${n.id}">${n.nom}</option>`).join('')}
      </select>
    </div>
    
    <div id="mesCours"></div>
  `;
  
  // Fonction de rendu de la liste des cours
  const renderList = (cl) => {
    const list = achats.filter(a => cl === 'all' || a.niveau === cl);
    
    if (list.length) {
      $('#mesCours').innerHTML = list.map(a => `
        <div class="gift" style="margin-bottom:10px">
          <span class="em">📘</span>
          <div>
            <div class="tt">${esc(a.produit_id)}</div>
            <div class="ss">Payé · ${fcfa(a.montant)}</div>
          </div>
          <a class="btn btn-ink" 
             style="margin-left:auto;padding:8px 14px;font-size:12.5px" 
             href="cours.html?id=${a.produit_id}">
             Continuer →
          </a>
        </div>
      `).join('');
    } else {
      $('#mesCours').innerHTML = `
        <div class="empty">
          <span class="big">🎒</span>
          <h3>Aucun cours dans cette classe</h3>
          <p>Tes cours achetés (et tes cadeaux) apparaîtront ici. 
             Le catalogue ouvre très bientôt.</p>
          <a class="btn btn-y" href="catalogue.html">
            Explorer le catalogue
          </a>
        </div>
      `;
    }
  };
  
  // Rendu initial + listener
  renderList('all');
  $('#filtreClasse').addEventListener('change', e => 
    renderList(e.target.value)
  );
}

// ============ DÉTECTION DE LA PAGE COURANTE ============

function getPage() {
  const path = location.pathname.split('/').pop() || 'index.html';
  if (path.includes('catalogue')) return 'catalogue';
  if (path.includes('cours')) return 'cours';
  if (path.includes('dashboard')) return 'dashboard';
  return 'index';
}

// ============ INITIALISATION ============

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 app.js — initialisation');
  console.log('📄 Page:', getPage());
  
  // 1. Peindre l'utilisateur (toujours, sans redirection)
  await paintUser();
  
  // 2. Initialiser les composants selon la page
  const page = getPage();
  
  if (page === 'catalogue') {
    console.log('📚 Initialisation catalogue');
    initFiltres();
  }
  
  if (page === 'cours') {
    console.log('🎬 Initialisation page cours');
    await rendreCours();
  }
  
  if (page === 'dashboard') {
    console.log('🎒 Initialisation dashboard');
    await rendreDashboard();
  }
  
  // 3. Bouton de déconnexion (si présent)
  $$('#btnLogout').forEach(b => {
    b.addEventListener('click', async () => {
      if (sb) {
        await sb.auth.signOut();
        toast('👋 Déconnecté avec succès');
        setTimeout(() => location.href = 'index.html', 800);
      }
    });
  });
  
  console.log('✅ app.js prêt — AUCUNE redirection automatique');
});

// ============ EXPORT GLOBAL ============
window.MukandaApp = {
  toast,
  getSession,
  paintUser,
  initFiltres,
  rendreCours,
  rendreDashboard,
  NIVEAUX,
  EMO_MATIERE,
  fcfa,
  esc
};