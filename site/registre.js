/* ============================================================
   REGISTRE.JS — moteur des documents Mukanda
   ➕ POUR AJOUTER UN DOCUMENT : copie un bloc definirDocument({...})
      en bas de ce fichier. Rien d'autre à toucher.
   ============================================================ */
window.REGISTRE=window.REGISTRE||{};
function definirDocument(def){window.REGISTRE[def.slug]=def;}

/* ---- outils partagés (disponibles dans tous les rendus) ---- */
const R_esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const R_init=n=>(n||'').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase()||'XX';
const R_bars=[92,85,78,70,64];
function R_set(o,p,v){const q=p.split('.');let c=o;for(let i=0;i<q.length-1;i++)c=c[q[i]];c[q[q.length-1]]=v;}
function R_get(o,p){const q=p.split('.');let c=o;for(const k of q)c=c?.[k];return c??'';}

/* ---- formulaire auto-généré depuis `champs` ---- */
function R_formulaire(doc,D){
  const fld=(p,l,v,t,sp)=>`<div class="f-row"><label>${l}</label>`+(t==='area'
    ?`<textarea data-p="${p}" ${sp?'data-split="1"':''}>${R_esc(v)}</textarea>`
    :`<input type="text" data-p="${p}" ${sp?'data-split="1"':''} value="${R_esc(v)}">`)+`</div>`;
  let h='';
  for(const g of doc.champs){
    if(g.rep){for(let i=0;i<g.n;i++){
      h+=`<div class="f-group"><h4>${g.g} ${i+1}</h4>`+g.f.map(f=>fld(g.rep+'.'+i+'.'+f.p,f.l,R_get(D,g.rep+'.'+i+'.'+f.p),f.t,f.split)).join('')+`</div>`;
    }}else{
      h+=`<div class="f-group"><h4>${g.g}</h4>`+g.f.map(f=>fld(f.p,f.l,R_get(D,f.p),f.t,f.split)).join('')+`</div>`;
    }
  }
  return h;
}

/* ============================================================
   📄 DOCUMENT : CV MODERNES (5 modèles)
   ============================================================ */
definirDocument({
  slug:'cv-modernes', type:'cv', em:'📄',
  titre:'CV modernes',
  desc:'Choisis un modèle qui te ressemble, personnalise-le avec tes infos, télécharge le PDF prêt à envoyer. Pensé pour le marché congolais et international.',
  prixUnit:200, prixPack:1000,
  defaut:{
    nom:'Jean-Baptiste Nkouka',
    titre:'Assistant comptable & gestionnaire de caisse',
    ville:'Brazzaville, Congo', tel:'+242 06 518 69 67', email:'jb.nkouka@gmail.com',
    profil:"Trois ans d'expérience en gestion de caisse et comptabilité dans le secteur des télécoms à Brazzaville. Je cherche un poste où la rigueur et l'honnêteté font la différence.",
    exp:[
      {t:'Assistant comptable — MTN Congo, Brazzaville',d:'2023 – 2025',p:'Tenue de caisse quotidienne (≈ 500 000 F/jour). Rapprochements bancaires. Facturation clients et relances.'},
      {t:'Stagiaire — Direction Générale du Trésor',d:'2022 (6 mois)',p:"Saisie d'écritures comptables. Participation à l'inventaire annuel."},
      {t:'Vendeur conseil — Boutique Kando & Frères',d:'2020 – 2022',p:'Accueil et conseil client. Encaissement Mobile Money. Gestion du stock.'}],
    form:[
      {t:'Licence en Sciences de Gestion — Université Marien Ngouabi',d:'2022 · Mention Assez Bien'},
      {t:'Baccalauréat série D — Lycée de la Révolution',d:'2018'}],
    comps:['Excel & tableaux de bord','Comptabilité & caisses','Facturation & devis','Logiciel Sage'],
    langues:['Français — courant','Lingala — langue maternelle','Anglais — intermédiaire'],
    atouts:"Ponctuel · rigoureux · honnête. Habitué au contact client et à la gestion d'argent."
  },
  champs:[
    {g:'👤 Identité',f:[{p:'nom',l:'Nom complet'},{p:'titre',l:'Titre / métier visé'},{p:'ville',l:'Ville'},{p:'tel',l:'Téléphone'},{p:'email',l:'Email'}]},
    {g:'🎯 Accroche',f:[{p:'profil',l:'Profil (3 lignes max)',t:'area'}]},
    {g:'💼 Expérience',rep:'exp',n:3,f:[{p:'t',l:'Poste — entreprise'},{p:'d',l:'Période'},{p:'p',l:'Missions / résultats',t:'area'}]},
    {g:'🎓 Formation',rep:'form',n:2,f:[{p:'t',l:'Diplôme — établissement'},{p:'d',l:'Année / mention'}]},
    {g:'🛠️ Compétences',f:[{p:'comps',l:'Une par ligne',t:'area',split:1}]},
    {g:'🌍 Langues',f:[{p:'langues',l:'Une par ligne',t:'area',split:1}]},
    {g:'⭐ Atouts',f:[{p:'atouts',l:'Atouts / qualités',t:'area'}]}
  ],
  modeles:[
    {id:1,nom:'Moderne',badge:'Populaire',color:'#6C5CE7',usage:'Jeunes diplômés · Marketing · Commerce',
     desc:'Sidebar violette avec barres de compétences. Dynamique et actuel.',
     rendu:d=>`<div class="doc-a4"><div class="cv1">
      <div class="side"><div class="av">${R_init(d.nom)}</div>
        <h2>Contact</h2><p>${R_esc(d.ville)}<br>${R_esc(d.tel)}<br>${R_esc(d.email)}</p>
        <h2>Compétences</h2>${d.comps.map((c,i)=>`<p>${R_esc(c)}</p><div class="bar"><i style="width:${R_bars[i%5]}%"></i></div>`).join('')}
        <h2>Langues</h2><p>${d.langues.map(R_esc).join('<br>')}</p>
        <h2>Atouts</h2><p>${R_esc(d.atouts)}</p></div>
      <div class="main"><h1>${R_esc(d.nom)}</h1><div class="job">${R_esc(d.titre)}</div>
        <h3>Profil</h3><p style="font-size:9.5pt;color:#444;line-height:1.5">${R_esc(d.profil)}</p>
        <h3>Expérience professionnelle</h3>
        ${d.exp.map(x=>`<div class="xp"><div class="t">${R_esc(x.t)}</div><div class="d">${R_esc(x.d)}</div><p>${R_esc(x.p)}</p></div>`).join('')}
        <h3>Formation</h3>
        ${d.form.map(x=>`<div class="xp"><div class="t">${R_esc(x.t)}</div><div class="d">${R_esc(x.d)}</div></div>`).join('')}</div>
      <div class="foot">CV Moderne · © Mukanda · mukanda.onrender.com</div></div>`},
    {id:2,nom:'Classique',color:'#1a1a2e',usage:'Banque · Administration · Comptabilité',
     desc:'Sérif élégant, noir et blanc. Rassure les employeurs conservateurs.',
     rendu:d=>`<div class="doc-a4"><div class="cv2">
      <div class="head"><h1>${R_esc(d.nom)}</h1><div class="job">${R_esc(d.titre)}</div>
        <div class="ct">${R_esc(d.ville)} · ${R_esc(d.tel)} · ${R_esc(d.email)}</div></div>
      <h3>Profil</h3><p>${R_esc(d.profil)}</p>
      <h3>Expérience professionnelle</h3>
      ${d.exp.map(x=>`<div class="xp"><div class="t">${R_esc(x.t)}</div><div class="d">${R_esc(x.d)}</div><ul><li>${R_esc(x.p)}</li></ul></div>`).join('')}
      <h3>Formation</h3>
      ${d.form.map(x=>`<div class="xp"><div class="t">${R_esc(x.t)}</div><div class="d">${R_esc(x.d)}</div></div>`).join('')}
      <h3>Compétences & langues</h3>
      <ul><li>${d.comps.map(R_esc).join(' · ')}</li><li>${d.langues.map(R_esc).join(' · ')}</li></ul>
      <div class="foot">CV Classique · © Mukanda · mukanda.onrender.com</div></div>`},
    {id:3,nom:'Minimal',badge:'Épuré',color:'#101A3E',usage:'Créatifs · Consultants · Freelances',
     desc:'Typographie aérée, beaucoup de blanc. Le texte fait le travail.',
     rendu:d=>{const p=d.nom.trim().split(/\s+/);const last=p.pop();const first=p.join(' ');
      return `<div class="doc-a4"><div class="cv3">
      <h1>${R_esc(first)} <b>${R_esc(last)}</b></h1>
      <div class="job">${R_esc(d.titre)}</div>
      <div class="ct">${R_esc(d.ville)} · ${R_esc(d.tel)} · ${R_esc(d.email)}</div>
      <h3>Expérience</h3>
      ${d.exp.map(x=>`<div class="row"><div class="l">${R_esc(x.d)}</div><div class="r"><b>${R_esc(x.t)}.</b> ${R_esc(x.p)}</div></div>`).join('')}
      <h3>Formation</h3>
      ${d.form.map(x=>`<div class="row"><div class="l">${R_esc(x.d)}</div><div class="r"><b>${R_esc(x.t)}</b></div></div>`).join('')}
      <h3>Compétences</h3>
      <div class="row"><div class="l">Savoir-faire</div><div class="r">${d.comps.map(R_esc).join(' · ')}</div></div>
      <div class="row"><div class="l">Langues</div><div class="r">${d.langues.map(R_esc).join(' · ')}</div></div>
      <div class="row"><div class="l">Atouts</div><div class="r">${R_esc(d.atouts)}</div></div>
      <div class="foot">CV Minimal · © Mukanda · mukanda.onrender.com</div></div>`;}},
    {id:4,nom:'Créatif',badge:'Original',color:'#FFB703',usage:'Communication · Design · Médias',
     desc:'Bandeau or vif, deux colonnes. Visible sans faire amateur.',
     rendu:d=>`<div class="doc-a4"><div class="cv4">
      <div class="band"><div class="av">${R_init(d.nom)}</div>
        <div><h1>${R_esc(d.nom)}</h1><div class="job">${R_esc(d.titre)}</div></div></div>
      <div class="cols"><div>
        <h3>Profil</h3><p>${R_esc(d.profil)}</p>
        <h3>Expérience</h3>
        ${d.exp.map(x=>`<p style="margin-bottom:2mm"><b>${R_esc(x.t)}</b> · ${R_esc(x.d)}<br>${R_esc(x.p)}</p>`).join('')}</div>
      <div><h3>Contact</h3><p>${R_esc(d.ville)}<br>${R_esc(d.tel)}<br>${R_esc(d.email)}</p>
        <h3>Compétences</h3>${d.comps.map(c=>`<span class="tag">${R_esc(c)}</span>`).join('')}
        <h3>Langues</h3><p>${d.langues.map(R_esc).join(' · ')}</p>
        <h3>Formation</h3>${d.form.map(x=>`<p style="margin-bottom:1.5mm">${R_esc(x.t)} (${R_esc(x.d)})</p>`).join('')}</div></div>
      <div class="foot">CV Créatif · © Mukanda · mukanda.onrender.com</div></div>`},
    {id:5,nom:'Étudiant',badge:'Sans expérience',color:'#06C39A',usage:'Premiers stages · Jobs étudiants',
     desc:'Met en avant stages, projets et qualités quand on débute.',
     rendu:d=>`<div class="doc-a4"><div class="cv5">
      <div class="top"><div><h1>${R_esc(d.nom)}</h1><div class="job">${R_esc(d.titre)}</div></div>
        <div class="ct">${R_esc(d.ville)}<br>${R_esc(d.tel)}<br>${R_esc(d.email)}</div></div>
      <h3>Profil</h3><p>${R_esc(d.profil)}</p>
      <div class="grid"><div>
        <h3>Stages & projets</h3>
        <ul>${d.exp.map(x=>`<li><b>${R_esc(x.t)}</b> (${R_esc(x.d)}) : ${R_esc(x.p)}</li>`).join('')}</ul>
        <h3>Formation</h3><ul>${d.form.map(x=>`<li>${R_esc(x.t)} (${R_esc(x.d)})</li>`).join('')}</ul></div>
      <div><h3>Compétences</h3><ul>${d.comps.map(c=>`<li>${R_esc(c)}</li>`).join('')}</ul>
        <h3>Langues</h3><ul>${d.langues.map(l=>`<li>${R_esc(l)}</li>`).join('')}</ul>
        <h3>Qualités</h3><ul><li>${R_esc(d.atouts)}</li></ul></div></div>
      <div class="foot">CV Étudiant · © Mukanda · mukanda.onrender.com</div></div>`}
  ]
});

/* ➕ PROCHAIN DOCUMENT ICI (ex : definirDocument({slug:'lettres-motivation', ...})) */