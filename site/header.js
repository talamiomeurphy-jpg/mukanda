/* ============================================================
   MUKANDA HEADER v3 — composant partagé
   Remplace automatiquement l'ancien <header class="nav">.
   Usage : <link header.css> + <script header.js> sur chaque page.
   ============================================================ */
(function(){
  if(window.__mkHeaderLoaded) return;
  window.__mkHeaderLoaded = true;

  var legacy = document.querySelector('header.nav');
  var forced = document.body.dataset.header === 'force';
  if(!legacy && !forced) return;              // pages sans ancien header = on n'injecte pas
  if(legacy) legacy.remove();
  document.querySelectorAll('.mmenu').forEach(function(m){ m.remove(); });

  var SB_URL='https://wyfkogowsdbxctbpfuud.supabase.co';
  var SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5ZmtvZ293c2RieGN0YnBmdXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MDc3MjAsImV4cCI6MjEwNjI4MzcyMH0.231eQ38RFvFaH3O6D-ReA8rlf3TehvWfcM-LBWocNEM';
  var sb = window.supabase ? supabase.createClient(SB_URL, SB_KEY) : null;

  /* Shims de compat : les anciens scripts de page ciblent #nav, #burger… */
  var shim = document.createElement('div');
  shim.id='mk-compat'; shim.hidden=true;
  shim.innerHTML='<div id="nav"></div><button id="burger"></button><div id="mmenu"></div><button id="mmenuClose"></button><div id="navAuth"></div><div id="navUser"></div><span id="navAvatar"></span><input id="navSearch">';
  document.body.appendChild(shim);

  var path = location.pathname.split('/').pop() || 'index.html';
  function isActive(p){ return path===p || (p==='catalogue.html' && (path==='cours.html')); }

  var LOGO_SVG = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mkG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6C5CE7"/><stop offset="1" stop-color="#2F6BFF"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="16" fill="url(#mkG)"/><path d="M14 26c6-3 12-3 18 0 6-3 12-3 18 0v20c-6-3-12-3-18 0-6-3-12-3-18 0Z" fill="#fff"/><path d="M32 26v20" stroke="#6C5CE7" stroke-width="3"/><path d="M32 8l3 6 6.5.9-4.7 4.5 1.1 6.4-5.9-3.1-5.9 3.1 1.1-6.4-4.7-4.5L29 14Z" fill="#FFB703"/></svg>';

  var html =
  '<div class="mk-announce" id="mkAnnounce">'+
    '🎁 <span>Inscription gratuite = <b>2 PDF + 2 vidéos offerts</b></span> <a href="auth.html">J\'en profite →</a>'+
    '<button class="mk-close" id="mkAnnClose" aria-label="Fermer">✕</button>'+
  '</div>'+
  '<nav class="mk-nav" id="mkNav">'+
    '<div class="mk-nav-in">'+
      '<a class="mk-logo" href="index.html" aria-label="Mukanda">'+LOGO_SVG+'<span class="mk-word">Mu<b>kanda</b></span></a>'+
      '<div class="mk-links">'+
        '<a class="mk-link'+(isActive('index.html')?' on':'')+'" href="index.html">Accueil</a>'+
        '<button class="mk-link'+(isActive('catalogue.html')?' on':'')+'" id="mkCatBtn" aria-expanded="false">Catalogue <span class="caret">▼</span></button>'+
        '<button class="mk-link" id="mkProBtn" aria-expanded="false">Modèles Pro <span class="caret">▼</span></button>'+
        '<a class="mk-link'+(isActive('dashboard.html')?' on':'')+'" href="dashboard.html">Mes cours</a>'+
        '<div class="mk-rel">'+
          '<button class="mk-link" id="mkPlusBtn" aria-expanded="false">Plus <span class="caret">▼</span></button>'+
          '<div class="mk-drop" id="mkPlusDrop" style="width:220px">'+
            '<a class="mk-menu-item" href="a-propos.html"><span class="em">👋</span>À propos</a>'+
            '<a class="mk-menu-item" href="contact.html"><span class="em">💬</span>Contact</a>'+
            '<a class="mk-menu-item" href="faq.html"><span class="em">❓</span>FAQ</a>'+
            '<a class="mk-menu-item" href="recuperer.html"><span class="em">🔁</span>Récupérer un achat</a>'+
          '</div>'+
        '</div>'+
      '</div>'+
      '<span class="mk-sp"></span>'+
      '<div class="mk-search">'+
        '<span class="mk-ic">🔍</span>'+
        '<input type="search" id="mkSearch" placeholder="Rechercher cours, CV, matière…" autocomplete="off" aria-label="Rechercher">'+
        '<div class="mk-sugg" id="mkSugg"></div>'+
      '</div>'+
      '<div class="mk-actions">'+
        '<div class="mk-rel">'+
          '<button class="mk-iconbtn" id="mkBell" aria-label="Notifications">🔔<span class="mk-badge" id="mkBellBadge">2</span></button>'+
          '<div class="mk-drop" id="mkNotifDrop">'+
            '<div class="mk-drop-head">Notifications <button id="mkNotifRead">Tout marquer lu</button></div>'+
            '<div class="mk-drop-body">'+
              '<div class="mk-notif unread"><span class="em">🎁</span><div><div class="tt">Tes cadeaux t\'attendent</div><div class="ds">2 PDF + 2 vidéos offerts dans ton espace.</div></div></div>'+
              '<div class="mk-notif unread"><span class="em">📚</span><div><div class="tt">Nouveaux cours CEPE</div><div class="ds">Des leçons de maths viennent d\'arriver.</div></div></div>'+
              '<div class="mk-notif"><span class="em">🦜</span><div><div class="tt">Bienvenue sur Mukanda</div><div class="ds">Jaco est prêt à t\'accompagner.</div></div></div>'+
            '</div>'+
          '</div>'+
        '</div>'+
        '<div class="mk-rel" id="mkAuthZone"></div>'+
        '<button class="mk-burger" id="mkBurger" aria-label="Menu"><span></span><span></span><span></span></button>'+
      '</div>'+
    '</div>'+
    '<div class="mk-progress"><i id="mkProgress"></i></div>'+
  '</nav>'+
  /* Mega menu catalogue */
  '<div class="mk-mega" id="mkMegaCat"><div class="mk-mega-in">'+
    megaCol('🎓','CEPE',[['Français','cepe','Français'],['Maths','cepe','Maths'],['Éveil','cepe','Éveil']])+
    megaCol('📘','BEPC',[['Français','bepc','Français'],['Maths','bepc','Maths'],['SVT','bepc','SVT'],['Physique-Chimie','bepc','Physique-Chimie']])+
    megaCol('🏆','BAC',[['Maths','bac','Maths'],['Physique-Chimie','bac','Physique-Chimie'],['Philosophie','bac','Philosophie'],['SVT','bac','SVT']])+
    megaCol('💼','Concours & Pro',[['Culture générale','concours','Culture générale'],['Logique','concours','Logique'],['Français pro','concours','Français pro']])+
    '<div class="mk-mega-feat"><span class="em">🦜</span><div><h5>Jaco te guide</h5><p>Voix + slides + quiz, pensé pour la 3G.</p><a href="catalogue.html">Tout explorer →</a></div></div>'+
  '</div></div>'+
  /* Mega menu pro */
  '<div class="mk-mega" id="mkMegaPro"><div class="mk-mega-in" style="grid-template-columns:repeat(3,1fr) 260px">'+
    megaCol('📄','Documents',[['CV modernes','pro','CV'],['Lettres de motivation','pro','Lettre'],['Factures & devis','pro','Facture']])+
    megaCol('📑','Contrats',[['Contrat de travail','pro','Contrat'],['Attestations','pro','Attestation'],['Certificats','pro','Certificat']])+
    megaCol('📊','Business',[['Business plan','pro','Business'],['Étude de marché','pro','Étude'],['Pitch deck','pro','Pitch']])+
    '<div class="mk-mega-feat"><span class="em">💼</span><div><h5>Prêts à remplir</h5><p>Conformes aux usages du Congo.</p><a href="catalogue.html?cat=pro">Voir les modèles →</a></div></div>'+
  '</div></div>'+
  '<div class="mk-overlay" id="mkOverlay"></div>'+
  '<div class="mk-drawer" id="mkDrawer">'+
    '<div class="mk-drawer-head"><a class="mk-logo" href="index.html">'+LOGO_SVG+'<span class="mk-word">Mu<b>kanda</b></span></a><button class="mk-iconbtn" id="mkDrawerClose" aria-label="Fermer">✕</button></div>'+
    '<div class="mk-drawer-search"><input type="search" id="mkDrawerSearch" placeholder="Rechercher…" aria-label="Rechercher"></div>'+
    '<div class="mk-drawer-body">'+
      '<a class="mk-d-item'+(isActive('index.html')?' on':'')+'" href="index.html"><span class="em">🏠</span>Accueil</a>'+
      '<div class="mk-acc" id="mkAccCat"><div class="mk-acc-head"><span>📚 Catalogue</span><span>▼</span></div><div class="mk-acc-body">'+
        '<a href="catalogue.html?n=cepe">🎓 CEPE</a><a href="catalogue.html?n=bepc">📘 BEPC</a><a href="catalogue.html?n=bac">🏆 BAC</a><a href="catalogue.html?n=concours">💼 Concours & Pro</a>'+
      '</div></div>'+
      '<div class="mk-acc" id="mkAccPro"><div class="mk-acc-head"><span>💼 Modèles Pro</span><span>▼</span></div><div class="mk-acc-body">'+
        '<a href="catalogue.html?cat=pro">CV & lettres</a><a href="catalogue.html?cat=pro">Factures & contrats</a><a href="catalogue.html?cat=pro">Business plans</a>'+
      '</div></div>'+
      '<a class="mk-d-item'+(isActive('dashboard.html')?' on':'')+'" href="dashboard.html"><span class="em">🎒</span>Mes cours</a>'+
      '<a class="mk-d-item" href="a-propos.html"><span class="em">👋</span>À propos</a>'+
      '<a class="mk-d-item" href="contact.html"><span class="em">💬</span>Contact</a>'+
      '<a class="mk-d-item" href="recuperer.html"><span class="em">🔁</span>Récupérer un achat</a>'+
    '</div>'+
    '<div class="mk-drawer-foot" id="mkDrawerFoot"></div>'+
  '</div>';

  function megaCol(icon,title,links){
    return '<div class="mk-mega-col"><h4>'+icon+' '+title+'</h4>'+
      links.map(function(l){return '<a href="catalogue.html?n='+l[1]+'&m='+encodeURIComponent(l[2])+'">'+l[0]+'</a>';}).join('')+
      '</div>';
  }

  var host = document.createElement('div');
  host.id='mk-header';
  host.innerHTML=html;
  document.body.insertBefore(host, document.body.firstChild);

  var $=function(s){return host.querySelector(s);};
  var $$=function(s){return Array.prototype.slice.call(host.querySelectorAll(s));};

  /* ---- Annonce ---- */
  if(localStorage.getItem('mk_announce')==='hide') $('#mkAnnounce').classList.add('hide');
  $('#mkAnnClose').addEventListener('click',function(){
    $('#mkAnnounce').classList.add('hide');
    localStorage.setItem('mk_announce','hide');
  });

  /* ---- Scroll : shadow + progression ---- */
  function onScroll(){
    host.classList.toggle('scrolled', window.scrollY>10);
    var h=document.documentElement;
    var pct=h.scrollTop/((h.scrollHeight-h.clientHeight)||1)*100;
    $('#mkProgress').style.width=pct+'%';
  }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  /* ---- Mega menus & drops ---- */
  function closeAll(){
    $$('.mk-mega').forEach(function(m){m.classList.remove('show');});
    $$('.mk-drop').forEach(function(d){d.classList.remove('show');});
    $$('[aria-expanded]').forEach(function(b){b.setAttribute('aria-expanded','false');});
  }
  function toggleMega(btnId,megaId){
    var mega=$(megaId), btn=$(btnId), was=mega.classList.contains('show');
    closeAll();
    if(!was){mega.classList.add('show');btn.setAttribute('aria-expanded','true');}
  }
  $('#mkCatBtn').addEventListener('click',function(e){e.stopPropagation();toggleMega('#mkCatBtn','#mkMegaCat');});
  $('#mkProBtn').addEventListener('click',function(e){e.stopPropagation();toggleMega('#mkProBtn','#mkMegaPro');});
  $('#mkPlusBtn').addEventListener('click',function(e){e.stopPropagation();var d=$('#mkPlusDrop'),w=d.classList.contains('show');closeAll();if(!w)d.classList.add('show');});
  $('#mkBell').addEventListener('click',function(e){e.stopPropagation();var d=$('#mkNotifDrop'),w=d.classList.contains('show');closeAll();if(!w)d.classList.add('show');});
  $('#mkNotifRead').addEventListener('click',function(){
    $$('#mkNotifDrop .mk-notif').forEach(function(n){n.classList.remove('unread');});
    $('#mkBellBadge').style.display='none';
    localStorage.setItem('mk_notif_read','1');
  });
  if(localStorage.getItem('mk_notif_read')==='1') $('#mkBellBadge').style.display='none';
  document.addEventListener('click',function(e){ if(!host.contains(e.target)) closeAll(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'){closeAll();closeDrawer();} });

  /* ---- Drawer mobile ---- */
  function openDrawer(){host.classList.add('menu-open');$('#mkDrawer').classList.add('show');$('#mkOverlay').classList.add('show');document.body.style.overflow='hidden';}
  function closeDrawer(){host.classList.remove('menu-open');$('#mkDrawer').classList.remove('show');$('#mkOverlay').classList.remove('show');document.body.style.overflow='';}
  $('#mkBurger').addEventListener('click',function(){ $('#mkDrawer').classList.contains('show')?closeDrawer():openDrawer(); });
  $('#mkDrawerClose').addEventListener('click',closeDrawer);
  $('#mkOverlay').addEventListener('click',closeDrawer);
  $$('.mk-acc-head').forEach(function(h){h.addEventListener('click',function(){h.parentElement.classList.toggle('open');});});
  $('#mkDrawerSearch').addEventListener('keydown',function(e){ if(e.key==='Enter'){location.href='catalogue.html?q='+encodeURIComponent(e.target.value.trim());} });

  /* ---- Recherche live ---- */
  var sugg=$('#mkSugg'), input=$('#mkSearch'), items=[], hlIdx=-1, debounceT;
  input.addEventListener('input',function(){
    clearTimeout(debounceT);
    var q=input.value.trim();
    if(q.length<2){sugg.classList.remove('show');return;}
    debounceT=setTimeout(function(){search(q);},250);
  });
  input.addEventListener('keydown',function(e){
    if(!sugg.classList.contains('show')){ if(e.key==='Enter'){location.href='catalogue.html?q='+encodeURIComponent(input.value.trim());} return; }
    if(e.key==='ArrowDown'){e.preventDefault();hlIdx=Math.min(hlIdx+1,items.length-1);paintHl();}
    else if(e.key==='ArrowUp'){e.preventDefault();hlIdx=Math.max(hlIdx-1,0);paintHl();}
    else if(e.key==='Enter'){e.preventDefault(); if(hlIdx>=0&&items[hlIdx])location.href=items[hlIdx].href; else location.href='catalogue.html?q='+encodeURIComponent(input.value.trim());}
  });
  function paintHl(){ $$('.mk-sugg-item').forEach(function(el,i){el.classList.toggle('hl',i===hlIdx);}); }
  async function search(q){
    if(!sb){sugg.innerHTML='<div class="mk-sugg-empty">Recherche indisponible</div>';sugg.classList.add('show');return;}
    var like='%'+q+'%';
    var res=await Promise.all([
      sb.from('cours').select('id,titre,matiere,niveau,prix_fcfa').eq('actif',true).ilike('titre',like).limit(4),
      sb.from('documents').select('id,titre,categorie,prix_fcfa').eq('actif',true).ilike('titre',like).limit(4)
    ]);
    items=[];
    (res[0].data||[]).forEach(function(c){items.push({em:'📘',tt:c.titre,mt:c.matiere+' · '+c.niveau.toUpperCase(),bd:'COURS',href:'cours.html?id='+c.id});});
    (res[1].data||[]).forEach(function(d){items.push({em:'💼',tt:d.titre,mt:'Modèle professionnel',bd:'PRO',pro:true,href:'produit.html?type=document&id='+d.id});});
    hlIdx=-1;
    if(!items.length){sugg.innerHTML='<div class="mk-sugg-empty">Aucun résultat pour « '+q+' »</div>';sugg.classList.add('show');return;}
    sugg.innerHTML=items.map(function(it,i){
      return '<div class="mk-sugg-item" data-i="'+i+'"><span class="em">'+it.em+'</span><div style="min-width:0"><div class="tt">'+it.tt+'</div><div class="mt">'+it.mt+'</div></div><span class="bd'+(it.pro?' pro':'')+'">'+it.bd+'</span></div>';
    }).join('')+'<div class="mk-sugg-foot" id="mkSuggAll">Voir tous les résultats →</div>';
    sugg.classList.add('show');
    $$('.mk-sugg-item').forEach(function(el){
      el.addEventListener('mousedown',function(e){e.preventDefault();location.href=items[+el.dataset.i].href;});
    });
    var all=$('#mkSuggAll'); if(all) all.addEventListener('mousedown',function(e){e.preventDefault();location.href='catalogue.html?q='+encodeURIComponent(q);});
  }
  document.addEventListener('click',function(e){ if(!sugg.contains(e.target)&&e.target!==input) sugg.classList.remove('show'); });

  /* ---- Zone auth / user ---- */
  var zone=$('#mkAuthZone');
  function renderGuest(){
    zone.innerHTML='<a class="mk-btn mk-btn-ghost" href="auth.html">Se connecter</a><a class="mk-btn mk-btn-grad" href="auth.html">✨ Créer un compte</a>';
    $('#mkDrawerFoot').innerHTML='<a class="mk-btn mk-btn-grad" style="justify-content:center" href="auth.html">✨ Créer mon compte gratuit</a>';
  }
  function renderUser(u){
    var m=u.user_metadata||{};
    var init=(m.nom||u.email||'M').trim().charAt(0).toUpperCase();
    zone.innerHTML='<button class="mk-avatar" id="mkAvatarBtn" aria-label="Mon compte">'+init+'</button>'+
      '<div class="mk-drop" id="mkUserDrop" style="width:250px">'+
        '<div class="mk-userhead"><span class="av">'+init+'</span><div><div class="nm">'+(m.nom||'Élève Mukanda')+'</div><div class="lv">'+((m.niveau_scolaire||'').toUpperCase()||'ÉLÈVE')+'</div></div></div>'+
        '<a class="mk-menu-item" href="dashboard.html"><span class="em">🎒</span>Mes cours</a>'+
        '<a class="mk-menu-item" href="profil.html"><span class="em">👤</span>Mon profil</a>'+
        '<a class="mk-menu-item" href="recuperer.html"><span class="em">🔁</span>Récupérer un achat</a>'+
        '<div class="mk-menu-sep"></div>'+
        '<button class="mk-menu-item danger" id="mkLogout"><span class="em">🚪</span>Déconnexion</button>'+
      '</div>';
    $('#mkAvatarBtn').addEventListener('click',function(e){e.stopPropagation();var d=$('#mkUserDrop'),w=d.classList.contains('show');closeAll();if(!w)d.classList.add('show');});
    $('#mkLogout').addEventListener('click',function(){ if(sb) sb.auth.signOut().then(function(){location.href='index.html';}); });
    $('#mkDrawerFoot').innerHTML='<a class="mk-btn mk-btn-grad" style="justify-content:center" href="dashboard.html">🎒 Mes cours</a><button class="mk-btn mk-btn-ghost" style="justify-content:center" id="mkDrawerLogout">🚪 Déconnexion</button>';
    var dl=$('#mkDrawerLogout'); if(dl) dl.addEventListener('click',function(){ sb.auth.signOut().then(function(){location.href='index.html';}); });
  }
  (async function(){
    if(!sb){renderGuest();return;}
    var s=await sb.auth.getSession();
    if(s.data&&s.data.session) renderUser(s.data.session.user); else renderGuest();
  })();

  console.log('✅ Header Mukanda v3 injecté');
})();