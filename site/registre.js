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
    if(g.f.length===0&&g.rep){/* groupe de lignes répétées */
      const lignes=R_get(D,g.rep)||[];
      h+=`<div class="f-group"><h4>📋 Lignes (${lignes.length}) <button type="button" onclick="document.getElementById('addLigne').click()" style="float:right;padding:2px 10px;border-radius:6px;background:var(--grad);color:#fff;font-size:11px;font-weight:800;border:none;cursor:pointer">+ Ajouter</button></h4>`;
      lignes.forEach((l,i)=>{
        h+=`<div style="background:var(--surface);padding:10px;border-radius:10px;margin-bottom:8px;border:1px solid var(--line)">
          <div class="f-row"><label>Description</label><input type="text" data-p="${g.rep}.${i}.desc" value="${R_esc(l.desc)}"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div class="f-row"><label>Quantité</label><input type="number" step="any" data-p="${g.rep}.${i}.qte" value="${l.qte}"></div>
            <div class="f-row"><label>Prix unitaire (F)</label><input type="number" step="any" data-p="${g.rep}.${i}.pu" value="${l.pu}"></div>
          </div>
          <button type="button" onclick="removeLigne('${g.rep}',${i})" style="padding:4px 10px;border-radius:6px;background:#FFEBEE;color:var(--coral);font-size:11px;font-weight:800;border:none;cursor:pointer;margin-top:4px">🗑️ Retirer cette ligne</button>
        </div>`;
      });
      h+=`</div>`;
    }
    else if(g.rep){for(let i=0;i<g.n;i++){
      h+=`<div class="f-group"><h4>${g.g} ${i+1}</h4>`+g.f.map(f=>fld(g.rep+'.'+i+'.'+f.p,f.l,R_get(D,g.rep+'.'+i+'.'+f.p),f.t,f.split)).join('')+`</div>`;
    }}else{
      h+=`<div class="f-group"><h4>${g.g}</h4>`+g.f.map(f=>fld(f.p,f.l,R_get(D,f.p),f.t,f.split)).join('')+`</div>`;
    }
  }
  return h;
}
/* helpers pour les lignes de facture */
window.addLigne=function(rep){
  if(!DATA[rep])DATA[rep]=[];
  DATA[rep].push({desc:'Nouvelle ligne',qte:1,pu:0});
  openDrawer();
};
window.removeLigne=function(rep,i){
  DATA[rep].splice(i,1);
  openDrawer();
};

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




/* ============================================================
   ✉️ DOCUMENT : LETTRES DE MOTIVATION (10 modèles)
   ➕ Bloc autonome : CSS injecté + definirDocument.
   ============================================================ */
(function(){
  if(!document.getElementById('css-lettres')){
    const s=document.createElement('style');s.id='css-lettres';s.textContent=`
      .ltc,.ltm,.ltx,.ltv,.lte{padding:18mm 20mm;min-height:297mm;position:relative}
      /* ---- Classique (serif) ---- */
      .ltc{font-family:Georgia,'Times New Roman',serif;font-size:10.5pt;line-height:1.7;color:#222}
      .ltc-send{text-align:right;margin-bottom:8mm}
      .ltc-send b{display:block;font-size:12pt;margin-bottom:1mm}
      .ltc-dest{margin-bottom:6mm}
      .ltc-date{text-align:right;margin-bottom:6mm;color:#555;font-style:italic}
      .ltc-objet{font-weight:700;margin-bottom:6mm;border-bottom:1px solid #ccc;padding-bottom:2mm}
      .ltc p{margin-bottom:4mm;text-align:justify}
      .ltc-sig{text-align:right;font-weight:700;margin-top:12mm}
      /* ---- Moderne (sans-serif + bandeau) ---- */
      .ltm{font-family:'Segoe UI',Arial,sans-serif;font-size:10pt;line-height:1.7;color:#333;background:var(--ac-bg,#fff)}
      .ltm-band{background:var(--ac,#6C5CE7);color:#fff;padding:10mm 12mm;margin:-18mm -20mm 10mm;display:flex;justify-content:space-between;align-items:center;gap:6mm;flex-wrap:wrap}
      .ltm-band h1{font-size:16pt}
      .ltm-band .ct{font-size:8.5pt;opacity:.92;text-align:right;line-height:1.5}
      .ltm-dest{display:flex;justify-content:space-between;gap:6mm;margin-bottom:6mm;flex-wrap:wrap}
      .ltm-objet{display:inline-block;background:var(--ac,#6C5CE7);color:#fff;padding:2mm 5mm;border-radius:3mm;font-weight:700;margin-bottom:6mm;font-size:9.5pt}
      .ltm p{margin-bottom:4mm}
      .ltm-sig{margin-top:10mm;font-weight:800;color:var(--ac,#6C5CE7)}
      /* ---- Minimal (épuré) ---- */
      .ltx{font-family:'Segoe UI',Arial,sans-serif;font-size:10pt;line-height:1.8;color:#333}
      .ltx-head{border-bottom:1px solid #1a1a2e;padding-bottom:4mm;margin-bottom:8mm;display:flex;justify-content:space-between;gap:6mm;flex-wrap:wrap}
      .ltx-head h1{font-size:16pt;font-weight:300}
      .ltx-head h1 b{font-weight:800}
      .ltx .lab{font-size:8pt;letter-spacing:2px;text-transform:uppercase;color:#999;display:block;margin-bottom:1mm}
      .ltx-objet{font-weight:700;margin-bottom:6mm}
      .ltx p{margin-bottom:4mm}
      .ltx-sig{margin-top:10mm;font-weight:700}
      /* ---- Créatif (bande latérale) ---- */
      .ltv{font-family:'Segoe UI',Arial,sans-serif;font-size:10pt;line-height:1.7;color:#333;border-left:8mm solid var(--ac,#FFB703);padding-left:12mm}
      .ltv h1{font-size:18pt;color:var(--ac,#FFB703);margin-bottom:2mm}
      .ltv .sub{color:#888;font-size:9.5pt;margin-bottom:8mm;letter-spacing:1px;text-transform:uppercase}
      .ltv-objet{background:#1a1a2e;color:var(--ac,#FFB703);display:inline-block;padding:1.5mm 4mm;border-radius:2mm;font-weight:700;margin:4mm 0 6mm;font-size:9.5pt}
      .ltv p{margin-bottom:4mm}
      .ltv-sig{font-weight:800;margin-top:8mm;color:var(--ac,#FFB703)}
      /* ---- Élégant (double border) ---- */
      .lte{font-family:Georgia,serif;font-size:10.5pt;line-height:1.8;color:#222}
      .lte-head{border-top:3px double var(--ac,#6C5CE7);border-bottom:3px double var(--ac,#6C5CE7);padding:4mm 0;margin-bottom:8mm;text-align:center}
      .lte-head h1{font-size:15pt;letter-spacing:3px;text-transform:uppercase;color:var(--ac,#6C5CE7)}
      .lte-head .sub{font-size:9pt;letter-spacing:1px;color:#888;margin-top:2mm}
      .lte-dest{display:flex;justify-content:space-between;gap:6mm;margin-bottom:6mm;flex-wrap:wrap}
      .lte-objet{font-weight:700;font-style:italic;margin-bottom:6mm;border-bottom:1px dotted #ccc;padding-bottom:2mm}
      .lte p{text-align:justify;margin-bottom:4mm}
      .lte-sig{text-align:right;margin-top:10mm;font-style:italic;color:var(--ac,#6C5CE7)}
    `;document.head.appendChild(s);
  }
})();

/* ---- Fonctions de rendu pour chaque style ---- */
function R_ltc(d,opts){
  return `<div class="doc-a4"><div class="ltc">
    <div class="ltc-send"><b>${R_esc(d.nom)}</b>${R_esc(d.titre)}<br>${R_esc(d.ville)} · ${R_esc(d.tel)}<br>${R_esc(d.email)}</div>
    <div class="ltc-dest">${R_esc(d.entreprise)}<br>${R_esc(d.destinataire)}</div>
    <div class="ltc-date">${R_esc(d.date_lieu)}</div>
    <div class="ltc-objet"><b>Objet :</b> ${R_esc(d.objet)}</div>
    <p>Madame, Monsieur,</p>
    <p>${R_esc(d.accroche)}</p>
    <p>${R_esc(d.corps)}</p>
    <p>${R_esc(d.atouts)}</p>
    <p>${R_esc(d.conclusion)}</p>
    <div class="ltc-sig">${R_esc(d.nom)}</div>
    <div class="foot">${opts.foot}</div></div></div>`;
}
function R_ltm(d,opts){
  return `<div class="doc-a4"><div class="ltm" style="--ac:${opts.ac};--ac-bg:${opts.acbg||'#fff'}">
    <div class="ltm-band">
      <h1>Lettre de motivation</h1>
      <div class="ct"><b>${R_esc(d.nom)}</b><br>${R_esc(d.ville)} · ${R_esc(d.tel)}<br>${R_esc(d.email)}</div>
    </div>
    <div class="ltm-dest">
      <div><b>${R_esc(d.entreprise)}</b><br>${R_esc(d.destinataire)}</div>
      <div style="text-align:right;font-size:9pt">${R_esc(d.date_lieu)}</div>
    </div>
    <div class="ltm-objet">Objet : ${R_esc(d.objet)}</div>
    <p>Madame, Monsieur,</p>
    <p>${R_esc(d.accroche)}</p>
    <p>${R_esc(d.corps)}</p>
    <p>${R_esc(d.atouts)}</p>
    <p>${R_esc(d.conclusion)}</p>
    <div class="ltm-sig">${R_esc(d.nom)}</div>
    <div class="foot">${opts.foot}</div></div></div>`;
}
function R_ltx(d,opts){
  const p=d.nom.trim().split(/\s+/);const last=p.pop();const first=p.join(' ');
  return `<div class="doc-a4"><div class="ltx">
    <div class="ltx-head">
      <div><h1>${R_esc(first)} <b>${R_esc(last)}</b></h1><span class="lab">${R_esc(d.titre)}</span></div>
      <div style="text-align:right"><span class="lab">Contact</span>${R_esc(d.ville)}<br>${R_esc(d.tel)}<br>${R_esc(d.email)}</div>
    </div>
    <div class="ltc-dest">${R_esc(d.entreprise)}<br>${R_esc(d.destinataire)}</div>
    <div style="color:#888;font-size:9pt;margin-bottom:4mm">${R_esc(d.date_lieu)}</div>
    <div class="ltx-objet">${R_esc(d.objet)}</div>
    <p>Madame, Monsieur,</p>
    <p>${R_esc(d.accroche)}</p>
    <p>${R_esc(d.corps)}</p>
    <p>${R_esc(d.atouts)}</p>
    <p>${R_esc(d.conclusion)}</p>
    <div class="ltx-sig">${R_esc(d.nom)}</div>
    <div class="foot">${opts.foot}</div></div></div>`;
}
function R_ltv(d,opts){
  return `<div class="doc-a4"><div class="ltv" style="--ac:${opts.ac}">
    <h1>Lettre de motivation</h1>
    <div class="sub">${R_esc(d.nom)} · ${R_esc(d.titre)}</div>
    <div style="display:flex;justify-content:space-between;gap:6mm;margin-bottom:6mm;flex-wrap:wrap">
      <div><b>${R_esc(d.entreprise)}</b><br>${R_esc(d.destinataire)}</div>
      <div style="text-align:right;font-size:9pt">${R_esc(d.ville)}<br>${R_esc(d.tel)}<br>${R_esc(d.email)}<br>${R_esc(d.date_lieu)}</div>
    </div>
    <div class="ltv-objet">${R_esc(d.objet)}</div>
    <p>Madame, Monsieur,</p>
    <p>${R_esc(d.accroche)}</p>
    <p>${R_esc(d.corps)}</p>
    <p>${R_esc(d.atouts)}</p>
    <p>${R_esc(d.conclusion)}</p>
    <div class="ltv-sig">${R_esc(d.nom)}</div>
    <div class="foot">${opts.foot}</div></div></div>`;
}
function R_lte(d,opts){
  return `<div class="doc-a4"><div class="lte" style="--ac:${opts.ac}">
    <div class="lte-head"><h1>Lettre de motivation</h1><div class="sub">${R_esc(d.nom)} · ${R_esc(d.titre)}</div></div>
    <div class="lte-dest">
      <div>${R_esc(d.ville)}<br>${R_esc(d.tel)}<br>${R_esc(d.email)}</div>
      <div style="text-align:right"><b>${R_esc(d.entreprise)}</b><br>${R_esc(d.destinataire)}<br><i style="color:#888">${R_esc(d.date_lieu)}</i></div>
    </div>
    <div class="lte-objet">Objet : ${R_esc(d.objet)}</div>
    <p>Madame, Monsieur,</p>
    <p>${R_esc(d.accroche)}</p>
    <p>${R_esc(d.corps)}</p>
    <p>${R_esc(d.atouts)}</p>
    <p>${R_esc(d.conclusion)}</p>
    <div class="lte-sig">${R_esc(d.nom)}</div>
    <div class="foot">${opts.foot}</div></div></div>`;
}

definirDocument({
  slug:'lettres-motivation', type:'lettre', em:'✉️',
  titre:'Lettres de motivation',
  desc:'10 modèles selon ta situation et ton style. Remplis, adapte le ton, envoie. Chaque lettre est pensée pour convaincre en une page.',
  prixUnit:200, prixPack:1200,
  defaut:{
    nom:'Jean-Baptiste Nkouka', titre:'Assistant comptable',
    ville:'Brazzaville', tel:'+242 06 518 69 67', email:'jb.nkouka@gmail.com',
    entreprise:'MTN Congo', destinataire:'À l’attention du Directeur des Ressources Humaines',
    objet:'Candidature au poste d’assistant comptable',
    date_lieu:'Brazzaville, le 12 mars 2026',
    accroche:'Actuellement à la recherche d’une nouvelle opportunité professionnelle, je me permets de vous adresser ma candidature au poste d’assistant comptable au sein de votre entreprise.',
    corps:'Fort de trois années d’expérience en gestion de caisse et en comptabilité dans le secteur des télécoms, j’ai développé une rigueur et une honnêteté qui correspondent aux exigences de votre maison. J’y assurais la tenue d’une caisse quotidienne d’environ 500 000 F, les rapprochements bancaires et la facturation clients.',
    atouts:'Rejoindre vos équipes serait pour moi l’occasion de mettre ces compétences au service de votre développement. Maîtrise d’Excel et du logiciel Sage, sens du contact et goût du travail bien fait sont autant d’atouts que je souhaite vous apporter.',
    conclusion:'Je me tiens à votre disposition pour un entretien à votre convenance. Dans cette attente, je vous prie d’agréer, Madame, Monsieur, l’expression de ma considération distinguée.'
  },
  champs:[
    {g:'👤 Expéditeur',f:[{p:'nom',l:'Nom complet'},{p:'titre',l:'Titre / métier'},{p:'ville',l:'Ville'},{p:'tel',l:'Téléphone'},{p:'email',l:'Email'}]},
    {g:'🏢 Destinataire',f:[{p:'entreprise',l:'Entreprise / organisation'},{p:'destinataire',l:'À l’attention de…'},{p:'objet',l:'Objet de la lettre'}]},
    {g:'📝 Lettre',f:[
      {p:'date_lieu',l:'Lieu et date'},
      {p:'accroche',l:'Paragraphe 1 — Accroche',t:'area'},
      {p:'corps',l:'Paragraphe 2 — Expérience / compétences',t:'area'},
      {p:'atouts',l:'Paragraphe 3 — Ce que tu apportes',t:'area'},
      {p:'conclusion',l:'Formule de politesse',t:'area'}
    ]}
  ],
  modeles:[
    {id:1,nom:'Candidature spontanée',badge:'Classique',color:'#1a1a2e',
     usage:'Recherche active · Pas d\'offre publiée',
     desc:'Ton sobre et direct. Parfait quand tu proposes tes services sans répondre à une annonce précise.',
     rendu:d=>R_ltc(d,{foot:'Lettre 1/10 · Candidature spontanée · © Mukanda'})},
    {id:2,nom:'Réponse à une offre',badge:'Classique',color:'#1a1a2e',
     usage:'Réponse à une annonce d\'emploi',
     desc:'Structure idéale pour répondre point par point aux exigences d\'une annonce publiée.',
     rendu:d=>R_ltc(d,{foot:'Lettre 2/10 · Réponse à une offre · © Mukanda'})},
    {id:3,nom:'Stage étudiant',badge:'Moderne',color:'#06C39A',
     usage:'Étudiants · Premiers stages',
     desc:'Met en avant ta formation, ta motivation et ce que tu peux apporter même sans expérience.',
     rendu:d=>R_ltm(d,{ac:'#06C39A',acbg:'#f4fdfa',foot:'Lettre 3/10 · Stage étudiant · © Mukanda'})},
    {id:4,nom:'Reconversion',badge:'Minimal',color:'#101A3E',
     usage:'Changement de métier',
     desc:'Valorise ton parcours atypique et tes compétences transférables. Ton posé, moderne.',
     rendu:d=>R_ltx(d,{foot:'Lettre 4/10 · Reconversion · © Mukanda'})},
    {id:5,nom:'Premier emploi',badge:'Moderne',color:'#6C5CE7',
     usage:'Sortie d\'études · Premier poste',
     desc:'Pour ceux qui sortent de l\'école. Accent sur la motivation, les projets scolaires, la curiosité.',
     rendu:d=>R_ltm(d,{ac:'#6C5CE7',foot:'Lettre 5/10 · Premier emploi · © Mukanda'})},
    {id:6,nom:'Cadre / manager',badge:'Élégant',color:'#3A2E8C',
     usage:'Postes à responsabilité',
     desc:'Ton senior, mise en forme soignée. Met en valeur leadership, résultats chiffrés, vision.',
     rendu:d=>R_lte(d,{ac:'#3A2E8C',foot:'Lettre 6/10 · Cadre / manager · © Mukanda'})},
    {id:7,nom:'Alternance',badge:'Moderne',color:'#2F6BFF',
     usage:'Contrats d\'apprentissage',
     desc:'Argumente le choix de l\'alternance pour toi ET pour l\'entreprise. Ton professionnel et engagé.',
     rendu:d=>R_ltm(d,{ac:'#2F6BFF',foot:'Lettre 7/10 · Alternance · © Mukanda'})},
    {id:8,nom:'Secteur public',badge:'Classique',color:'#1a1a2e',
     usage:'Ministères · Administration · Établissements publics',
     desc:'Ton formel, respect des codes administratifs congolais. Structure traditionnelle rassurante.',
     rendu:d=>R_ltc(d,{foot:'Lettre 8/10 · Secteur public · © Mukanda'})},
    {id:9,nom:'Freelance / mission',badge:'Créatif',color:'#FFB703',
     usage:'Consultants · Prestataires · Indépendants',
     desc:'Présentation de ton offre de services et de ton expertise. Tape à l\'œil sans faire amateur.',
     rendu:d=>R_ltv(d,{ac:'#FFB703',foot:'Lettre 9/10 · Freelance / mission · © Mukanda'})},
    {id:10,nom:'Démission',badge:'Minimal',color:'#98A2B8',
     usage:'Départ volontaire · Fin de contrat',
     desc:'Ton professionnel, respectueux, neutre. Quitte ton poste en laissant une bonne dernière impression.',
     rendu:d=>R_ltx(d,{foot:'Lettre 10/10 · Démission · © Mukanda'})}
  ]
});

/* ➕ PROCHAIN DOCUMENT ICI (ex : definirDocument({slug:'factures-devis', ...})) */


/* ============================================================
   🧾 DOCUMENT : FACTURES & DEVIS (5 modèles)
   ➕ Bloc autonome : CSS injecté + definirDocument.
   ➕ Calculs automatiques : sous-total · TVA 18% · TTC.
   ============================================================ */
(function(){
  if(!document.getElementById('css-factures')){
    const s=document.createElement('style');s.id='css-factures';s.textContent=`
      .fac,.fad,.fae,.fav,.fax{padding:16mm 18mm;min-height:297mm;position:relative}
      .fa-head{display:flex;justify-content:space-between;gap:6mm;margin-bottom:8mm;flex-wrap:wrap}
      .fa-head h1{font-size:18pt;margin-bottom:2mm}
      .fa-head .sub{font-size:8.5pt;color:#888}
      .fa-parties{display:flex;justify-content:space-between;gap:6mm;margin-bottom:8mm;flex-wrap:wrap}
      .fa-parties .col{flex:1;min-width:70mm}
      .fa-parties .col b{display:block;font-size:10.5pt;margin-bottom:2mm}
      .fa-parties .col p{font-size:9pt;line-height:1.5;color:#555}
      .fa-table{width:100%;border-collapse:collapse;margin:6mm 0 8mm;font-size:9.5pt}
      .fa-table th{background:var(--ac,#1a1a2e);color:#fff;padding:2.5mm 3mm;text-align:left;font-size:8.5pt;letter-spacing:.5px;text-transform:uppercase}
      .fa-table td{padding:2.5mm 3mm;border-bottom:1px solid #e5e5ef;vertical-align:top}
      .fa-table .num{text-align:right;white-space:nowrap}
      .fa-totals{margin-left:auto;width:80mm;font-size:9.5pt}
      .fa-totals table{width:100%;border-collapse:collapse}
      .fa-totals td{padding:2mm 3mm}
      .fa-totals td:first-child{color:#555}
      .fa-totals td:last-child{text-align:right;font-weight:700}
      .fa-totals .total{background:var(--ac,#1a1a2e);color:#fff;font-size:11pt}
      .fa-totals .total td{padding:3mm;font-weight:800}
      .fa-terms{margin-top:8mm;padding-top:4mm;border-top:1px solid #e5e5ef;font-size:8.5pt;color:#555;line-height:1.6}
      .fa-terms b{color:#222}
      /* ---- Classique ---- */
      .fac{font-family:Georgia,'Times New Roman',serif;color:#222}
      .fac .fa-head h1{text-transform:uppercase;letter-spacing:3px;border-bottom:2px solid var(--ac,#1a1a2e);padding-bottom:2mm}
      .fac .fa-logo{font-size:14pt;font-weight:700;color:var(--ac,#1a1a2e)}
      /* ---- Moderne (bandeau coloré) ---- */
      .fad{font-family:'Segoe UI',Arial,sans-serif;color:#333}
      .fad .fa-band{background:var(--ac,#6C5CE7);color:#fff;margin:-16mm -18mm 10mm;padding:8mm 18mm;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4mm}
      .fad .fa-band h1{font-size:22pt}
      .fad .fa-band .sub{color:rgba(255,255,255,.9);font-size:9pt}
      .fad .fa-logo{background:#fff;color:var(--ac,#6C5CE7);padding:2mm 5mm;border-radius:2mm;font-weight:800;font-size:11pt}
      /* ---- Élégant (double border centré) ---- */
      .fae{font-family:Georgia,serif;color:#222;text-align:center}
      .fae .fa-head{justify-content:center;flex-direction:column;align-items:center;border-top:3px double var(--ac,#3A2E8C);border-bottom:3px double var(--ac,#3A2E8C);padding:4mm 0;margin-bottom:8mm}
      .fae .fa-head h1{letter-spacing:4px;color:var(--ac,#3A2E8C)}
      .fae .fa-parties{text-align:left}
      .fae .fa-logo{font-family:'Baloo 2';font-size:14pt;color:var(--ac,#3A2E8C)}
      .fae .fa-table th{letter-spacing:2px}
      /* ---- Créatif (bande latérale) ---- */
      .fav{font-family:'Segoe UI',Arial,sans-serif;color:#333;border-left:8mm solid var(--ac,#FFB703);padding-left:14mm}
      .fav .fa-head h1{color:var(--ac,#FFB703);font-size:22pt}
      .fav .fa-logo{font-weight:800;color:var(--ac,#FFB703);font-size:13pt;letter-spacing:1px}
      /* ---- Minimal (épuré) ---- */
      .fax{font-family:'Segoe UI',Arial,sans-serif;color:#333}
      .fax .fa-head h1{font-weight:300;font-size:24pt}
      .fax .fa-head h1 b{font-weight:800}
      .fax .fa-logo{font-weight:300;font-size:16pt;letter-spacing:1px}
      .fax .fa-logo b{font-weight:800}
      .fax .fa-table{font-size:9pt}
      .fax .fa-table th{background:#1a1a2e;text-transform:none;letter-spacing:0;font-weight:700}
    `;document.head.appendChild(s);
  }
})();

/* Format FCFA */
function R_fcfa(n){return new Intl.NumberFormat('fr-FR').format(Math.round(n||0))+' F';}

/* Calcule totaux à partir des lignes + tva */
function R_calc(lignes,tva){
  const ht=(lignes||[]).reduce((s,l)=>s+(l.qte||0)*(l.pu||0),0);
  const tva_m=ht*((tva||0)/100);
  return{ht,tva_m,ttc:ht+tva_m};
}

/* ---- Classique ---- */
function R_fac(d,opts){
  const{ht,tva_m,ttc}=R_calc(d.lignes,d.tva_pct);
  const lignesHtml=d.lignes.map(l=>`<tr>
    <td>${R_esc(l.desc)}</td>
    <td class="num">${l.qte}</td>
    <td class="num">${R_fcfa(l.pu)}</td>
    <td class="num">${R_fcfa(l.qte*l.pu)}</td>
  </tr>`).join('');
  return `<div class="doc-a4"><div class="fac" style="--ac:${opts.ac}">
    <div class="fa-head">
      <div>
        <div class="fa-logo">${R_esc(d.em_nom)}</div>
        <div class="sub" style="margin-top:1mm">${R_esc(d.em_adresse)}<br>${R_esc(d.em_tel)} · ${R_esc(d.em_email)}<br>RCCM : ${R_esc(d.em_rccm)} · NIF : ${R_esc(d.em_nif)}</div>
      </div>
      <div style="text-align:right">
        <h1>FACTURE</h1>
        <div class="sub">N° ${R_esc(d.numero)}<br>Date : ${R_esc(d.date)}<br>Échéance : ${R_esc(d.echeance)}</div>
      </div>
    </div>
    <div class="fa-parties">
      <div class="col"><b>Facturé à :</b><p>${R_esc(d.cl_nom)}<br>${R_esc(d.cl_adresse)}<br>${R_esc(d.cl_tel)} · ${R_esc(d.cl_email)}</p></div>
    </div>
    <table class="fa-table">
      <thead><tr><th>Description</th><th style="width:18mm">Qté</th><th style="width:30mm">P.U. HT</th><th style="width:35mm">Total HT</th></tr></thead>
      <tbody>${lignesHtml}</tbody>
    </table>
    <div class="fa-totals"><table>
      <tr><td>Sous-total HT</td><td>${R_fcfa(ht)}</td></tr>
      <tr><td>TVA (${d.tva_pct}%)</td><td>${R_fcfa(tva_m)}</td></tr>
      <tr class="total"><td>TOTAL TTC</td><td>${R_fcfa(ttc)}</td></tr>
    </table></div>
    <div class="fa-terms">
      <b>Notes :</b> ${R_esc(d.notes)}<br>
      <b>Conditions :</b> ${R_esc(d.conditions)}
    </div>
    <div class="foot">${opts.foot}</div></div></div>`;
}

/* ---- Moderne (bandeau) ---- */
function R_fad(d,opts){
  const{ht,tva_m,ttc}=R_calc(d.lignes,d.tva_pct);
  const lignesHtml=d.lignes.map(l=>`<tr>
    <td>${R_esc(l.desc)}</td>
    <td class="num">${l.qte}</td>
    <td class="num">${R_fcfa(l.pu)}</td>
    <td class="num">${R_fcfa(l.qte*l.pu)}</td>
  </tr>`).join('');
  return `<div class="doc-a4"><div class="fad" style="--ac:${opts.ac}">
    <div class="fa-band">
      <div><h1>${opts.typeDoc}</h1><div class="sub">N° ${R_esc(d.numero)} · ${R_esc(d.date)}</div></div>
      <div class="fa-logo">${R_esc(d.em_nom)}</div>
    </div>
    <div class="fa-parties">
      <div class="col"><b>Émetteur</b><p>${R_esc(d.em_nom)}<br>${R_esc(d.em_adresse)}<br>${R_esc(d.em_tel)} · ${R_esc(d.em_email)}<br>RCCM : ${R_esc(d.em_rccm)}</p></div>
      <div class="col" style="text-align:right"><b>Client</b><p>${R_esc(d.cl_nom)}<br>${R_esc(d.cl_adresse)}<br>${R_esc(d.cl_tel)}<br>${R_esc(d.cl_email)}</p></div>
    </div>
    <table class="fa-table">
      <thead><tr><th>Description</th><th style="width:18mm">Qté</th><th style="width:30mm">P.U. HT</th><th style="width:35mm">Total HT</th></tr></thead>
      <tbody>${lignesHtml}</tbody>
    </table>
    <div class="fa-totals"><table>
      <tr><td>Sous-total HT</td><td>${R_fcfa(ht)}</td></tr>
      <tr><td>TVA (${d.tva_pct}%)</td><td>${R_fcfa(tva_m)}</td></tr>
      <tr class="total"><td>TOTAL TTC</td><td>${R_fcfa(ttc)}</td></tr>
    </table></div>
    <div style="margin-top:4mm;text-align:right;font-size:9pt;color:#888">Échéance : <b style="color:#222">${R_esc(d.echeance)}</b></div>
    <div class="fa-terms">
      <b>Notes :</b> ${R_esc(d.notes)}<br>
      <b>Conditions :</b> ${R_esc(d.conditions)}
    </div>
    <div class="foot">${opts.foot}</div></div></div>`;
}

/* ---- Élégant (double border) ---- */
function R_fae(d,opts){
  const{ht,tva_m,ttc}=R_calc(d.lignes,d.tva_pct);
  const lignesHtml=d.lignes.map(l=>`<tr>
    <td style="text-align:left">${R_esc(l.desc)}</td>
    <td class="num">${l.qte}</td>
    <td class="num">${R_fcfa(l.pu)}</td>
    <td class="num">${R_fcfa(l.qte*l.pu)}</td>
  </tr>`).join('');
  return `<div class="doc-a4"><div class="fae" style="--ac:${opts.ac}">
    <div class="fa-head">
      <div class="fa-logo">${R_esc(d.em_nom)}</div>
      <h1>${opts.typeDoc}</h1>
      <div class="sub">N° ${R_esc(d.numero)} · Émis le ${R_esc(d.date)} · Échéance ${R_esc(d.echeance)}</div>
    </div>
    <div class="fa-parties">
      <div class="col"><b>De :</b><p>${R_esc(d.em_nom)}<br>${R_esc(d.em_adresse)}<br>${R_esc(d.em_tel)} · ${R_esc(d.em_email)}<br>RCCM : ${R_esc(d.em_rccm)}</p></div>
      <div class="col"><b>Pour :</b><p>${R_esc(d.cl_nom)}<br>${R_esc(d.cl_adresse)}<br>${R_esc(d.cl_tel)}<br>${R_esc(d.cl_email)}</p></div>
    </div>
    <table class="fa-table">
      <thead><tr><th style="text-align:left">Description</th><th style="width:18mm">Qté</th><th style="width:30mm">P.U. HT</th><th style="width:35mm">Total HT</th></tr></thead>
      <tbody>${lignesHtml}</tbody>
    </table>
    <div class="fa-totals"><table>
      <tr><td>Sous-total HT</td><td>${R_fcfa(ht)}</td></tr>
      <tr><td>TVA (${d.tva_pct}%)</td><td>${R_fcfa(tva_m)}</td></tr>
      <tr class="total"><td>TOTAL TTC</td><td>${R_fcfa(ttc)}</td></tr>
    </table></div>
    <div class="fa-terms">
      <b>Notes :</b> ${R_esc(d.notes)}<br>
      <b>Conditions :</b> ${R_esc(d.conditions)}
    </div>
    <div class="foot">${opts.foot}</div></div></div>`;
}

/* ---- Créatif (bande latérale) ---- */
function R_fav(d,opts){
  const{ht,tva_m,ttc}=R_calc(d.lignes,d.tva_pct);
  const lignesHtml=d.lignes.map(l=>`<tr>
    <td>${R_esc(l.desc)}</td>
    <td class="num">${l.qte}</td>
    <td class="num">${R_fcfa(l.pu)}</td>
    <td class="num">${R_fcfa(l.qte*l.pu)}</td>
  </tr>`).join('');
  return `<div class="doc-a4"><div class="fav" style="--ac:${opts.ac}">
    <div class="fa-head">
      <div>
        <div class="fa-logo">${R_esc(d.em_nom)}</div>
        <div class="sub">${R_esc(d.em_adresse)}<br>${R_esc(d.em_tel)} · ${R_esc(d.em_email)}<br>RCCM : ${R_esc(d.em_rccm)}</div>
      </div>
      <div style="text-align:right">
        <h1>${opts.typeDoc}</h1>
        <div class="sub">N° ${R_esc(d.numero)}<br>${R_esc(d.date)}</div>
      </div>
    </div>
    <div class="fa-parties">
      <div class="col"><b>Facturé à :</b><p>${R_esc(d.cl_nom)}<br>${R_esc(d.cl_adresse)}<br>${R_esc(d.cl_tel)}<br>${R_esc(d.cl_email)}</p></div>
      <div class="col" style="text-align:right"><b>Échéance</b><p style="font-size:13pt;color:var(--ac,#FFB703);font-weight:800;margin-top:1mm">${R_esc(d.echeance)}</p></div>
    </div>
    <table class="fa-table">
      <thead><tr><th>Description</th><th style="width:18mm">Qté</th><th style="width:30mm">P.U. HT</th><th style="width:35mm">Total HT</th></tr></thead>
      <tbody>${lignesHtml}</tbody>
    </table>
    <div class="fa-totals"><table>
      <tr><td>Sous-total HT</td><td>${R_fcfa(ht)}</td></tr>
      <tr><td>TVA (${d.tva_pct}%)</td><td>${R_fcfa(tva_m)}</td></tr>
      <tr class="total"><td>TOTAL TTC</td><td>${R_fcfa(ttc)}</td></tr>
    </table></div>
    <div class="fa-terms">
      <b>Notes :</b> ${R_esc(d.notes)}<br>
      <b>Conditions :</b> ${R_esc(d.conditions)}
    </div>
    <div class="foot">${opts.foot}</div></div></div>`;
}

/* ---- Minimal (épuré) ---- */
function R_fax(d,opts){
  const{ht,tva_m,ttc}=R_calc(d.lignes,d.tva_pct);
  const lignesHtml=d.lignes.map(l=>`<tr>
    <td>${R_esc(l.desc)}</td>
    <td class="num">${l.qte}</td>
    <td class="num">${R_fcfa(l.pu)}</td>
    <td class="num">${R_fcfa(l.qte*l.pu)}</td>
  </tr>`).join('');
  return `<div class="doc-a4"><div class="fax">
    <div class="fa-head">
      <div>
        <div class="fa-logo">${R_esc(d.em_nom)}</div>
        <div class="sub">${R_esc(d.em_adresse)}<br>${R_esc(d.em_tel)} · ${R_esc(d.em_email)}</div>
      </div>
      <div style="text-align:right">
        <h1><b>${opts.typeDoc}</b></h1>
        <div class="sub">N° ${R_esc(d.numero)} · ${R_esc(d.date)}<br>Échéance : ${R_esc(d.echeance)}</div>
      </div>
    </div>
    <div class="fa-parties">
      <div class="col"><b>Pour :</b><p>${R_esc(d.cl_nom)}<br>${R_esc(d.cl_adresse)}<br>${R_esc(d.cl_tel)}<br>${R_esc(d.cl_email)}</p></div>
    </div>
    <table class="fa-table">
      <thead><tr><th>Description</th><th style="width:18mm">Qté</th><th style="width:30mm">P.U. HT</th><th style="width:35mm">Total HT</th></tr></thead>
      <tbody>${lignesHtml}</tbody>
    </table>
    <div class="fa-totals"><table>
      <tr><td>Sous-total HT</td><td>${R_fcfa(ht)}</td></tr>
      <tr><td>TVA (${d.tva_pct}%)</td><td>${R_fcfa(tva_m)}</td></tr>
      <tr class="total" style="background:#1a1a2e;color:#fff"><td>TOTAL TTC</td><td>${R_fcfa(ttc)}</td></tr>
    </table></div>
    <div class="fa-terms">
      <b>Notes :</b> ${R_esc(d.notes)}<br>
      <b>Conditions :</b> ${R_esc(d.conditions)}
    </div>
    <div class="foot">${opts.foot}</div></div></div>`;
}

definirDocument({
  slug:'factures-devis', type:'facture', em:'🧾',
  titre:'Factures & devis',
  desc:'Modèles conformes aux usages du Congo. Numérotation, mentions légales, TVA 18% : tout est en place, tu remplis juste.',
  prixUnit:200, prixPack:800,
  defaut:{
    em_nom:'Mukanda SARL',
    em_adresse:'Avenue de la Paix, Brazzaville',
    em_tel:'+242 06 518 69 67',
    em_email:'contact@mukanda.cg',
    em_rccm:'CG-BZV-2026-B-12-00123',
    em_nif:'C060012345X',
    cl_nom:'Jean-Baptiste Nkouka',
    cl_adresse:'Ouenzé, Brazzaville',
    cl_tel:'+242 05 518 69 67',
    cl_email:'jb.nkouka@gmail.com',
    numero:'FACT-2026-0042',
    date:'12 mars 2026',
    echeance:'26 mars 2026',
    lignes:[
      {desc:'Création de site web vitrine (5 pages)',qte:1,pu:50000},
      {desc:'Formation WordPress (3 heures)',qte:3,pu:15000},
      {desc:'Maintenance mensuelle (mars 2026)',qte:1,pu:25000}
    ],
    tva_pct:18,
    notes:'Paiement par MTN MoMo, Airtel Money ou virement bancaire. Pénalité de retard : 1% par jour de retard.',
    conditions:'Paiement net à 14 jours. Toute contestation doit intervenir dans les 7 jours suivant l\'émission.'
  },
  champs:[
    {g:'🏢 Émetteur (toi)',f:[
      {p:'em_nom',l:'Nom de l\'entreprise'},{p:'em_adresse',l:'Adresse'},{p:'em_tel',l:'Téléphone'},
      {p:'em_email',l:'Email'},{p:'em_rccm',l:'N° RCCM'},{p:'em_nif',l:'N° NIF / NIU'}
    ]},
    {g:'👤 Client',f:[
      {p:'cl_nom',l:'Nom du client'},{p:'cl_adresse',l:'Adresse'},{p:'cl_tel',l:'Téléphone'},{p:'cl_email',l:'Email'}
    ]},
    {g:'📄 Document',f:[
      {p:'numero',l:'Numéro (ex : FACT-2026-0042)'},{p:'date',l:'Date d\'émission'},{p:'echeance',l:'Date d\'échéance'}
    ]},
    {g:'📋 Ligne 1',rep:'lignes',n:0,f:[]},
    {g:'💰 TVA',f:[{p:'tva_pct',l:'Taux de TVA (%)'}]},
    {g:'📝 Notes & conditions',f:[
      {p:'notes',l:'Notes (facultatif)',t:'area'},
      {p:'conditions',l:'Conditions de paiement',t:'area'}
    ]}
  ],
  modeles:[
    {id:1,nom:'Facture classique',badge:'Standard',color:'#1a1a2e',
     usage:'Prestations · Vente de biens · Services',
     desc:'Format standard, conforme aux usages congolais. En-tête sobre, tableau clair, totaux lisibles.',
     rendu:d=>R_fac(d,{ac:'#1a1a2e',foot:'Facture 1/5 · Classique · © Mukanda'})},
    {id:2,nom:'Devis détaillé',badge:'Proposition',color:'#2F6BFF',
     usage:'Avant signature d\'un contrat · Proposals',
     desc:'Proposition tarifaire complète avec conditions. Bandeau bleu moderne pour inspirer confiance.',
     rendu:d=>R_fad(d,{ac:'#2F6BFF',typeDoc:'DEVIS',foot:'Devis 2/5 · Détaillé · © Mukanda'})},
    {id:3,nom:'Facture proforma',badge:'Export',color:'#F59E0B',
     usage:'Commerce international · Import-export · Banque',
     desc:'Document préparatoire avant facture définitive. Utile pour les demandes de crédit documentaire.',
     rendu:d=>R_fad(d,{ac:'#F59E0B',typeDoc:'FACTURE PROFORMA',foot:'Proforma 3/5 · Export · © Mukanda'})},
    {id:4,nom:'Avoir / remboursement',badge:'Correction',color:'#FF5D73',
     usage:'Correction d\'une facture précédente · Retours',
     desc:'Pour annuler partiellement ou totalement une facture émise. Mise en forme claire pour éviter les litiges.',
     rendu:d=>R_fae(d,{ac:'#FF5D73',typeDoc:'AVOIR',foot:'Avoir 4/5 · Correction · © Mukanda'})},
    {id:5,nom:'Facture récurrente',badge:'Abonnement',color:'#06C39A',
     usage:'Prestations mensuelles · Abonnements · Services récurrents',
     desc:'Pour les prestations régulières (maintenance, abonnement). Structure adaptée avec mention de la période.',
     rendu:d=>R_fav(d,{ac:'#06C39A',typeDoc:'FACTURE',foot:'Facture 5/5 · Récurrente · © Mukanda'})}
  ]
});

/* ➕ PROCHAIN DOCUMENT ICI (ex : definirDocument({slug:'contrat-travail', ...})) */


/* ============================================================
   📑 DOCUMENT : CONTRATS DE TRAVAIL (5 modèles)
   ➕ Bloc autonome : CSS injecté + definirDocument.
   ➕ Conforme aux usages et mentions légales du Congo-Brazzaville.
   ============================================================ */
(function(){
  if(!document.getElementById('css-contrats')){
    const s=document.createElement('style');s.id='css-contrats';s.textContent=`
      .ct1,.ct2,.ct3,.ct4,.ct5{padding:18mm 20mm;min-height:297mm;position:relative;font-size:10pt;line-height:1.6;color:#222}
      /* ---- 1. Classique (CDI standard) ---- */
      .ct1{font-family:Georgia,'Times New Roman',serif}
      .ct1 .ct-head{text-align:center;border-bottom:2px solid #1a1a2e;padding-bottom:4mm;margin-bottom:6mm}
      .ct1 .ct-head h1{font-size:16pt;text-transform:uppercase;letter-spacing:2px;margin-bottom:2mm}
      .ct1 .ct-head .sub{font-size:9pt;color:#555}
      .ct1 .ct-parties{display:flex;justify-content:space-between;gap:8mm;margin-bottom:6mm}
      .ct1 .ct-party{flex:1;background:#f8f9fc;padding:4mm;border-radius:2mm;border-left:3px solid #1a1a2e}
      .ct1 .ct-party b{display:block;font-size:9pt;text-transform:uppercase;color:#555;margin-bottom:1mm}
      .ct1 .ct-art{margin-bottom:4mm}
      .ct1 .ct-art h3{font-size:11pt;border-bottom:1px solid #ddd;padding-bottom:1mm;margin-bottom:2mm}
      .ct1 .ct-art p{text-align:justify;margin-bottom:2mm}
      .ct1 .ct-sig{display:flex;justify-content:space-between;margin-top:12mm;gap:8mm}
      .ct1 .ct-sig .box{flex:1;border-top:1px solid #222;padding-top:2mm;text-align:center;font-size:9pt}
      /* ---- 2. Moderne (CDD / Mission) ---- */
      .ct2{font-family:'Segoe UI',Arial,sans-serif}
      .ct2 .ct-band{background:var(--ac,#2F6BFF);color:#fff;margin:-18mm -20mm 8mm;padding:8mm 20mm;display:flex;justify-content:space-between;align-items:center}
      .ct2 .ct-band h1{font-size:18pt}
      .ct2 .ct-band .sub{font-size:9pt;opacity:.9}
      .ct2 .ct-row{display:flex;gap:6mm;margin-bottom:4mm}
      .ct2 .ct-col{flex:1}
      .ct2 .ct-col b{color:var(--ac,#2F6BFF);font-size:9pt;text-transform:uppercase;display:block;margin-bottom:1mm}
      .ct2 .ct-art h3{color:var(--ac,#2F6BFF);font-size:11pt;margin:5mm 0 2mm}
      .ct2 .ct-art p{text-align:justify;margin-bottom:2mm}
      .ct2 .ct-sig{display:flex;justify-content:space-between;margin-top:12mm;page-break-inside:avoid}
      .ct2 .ct-sig .box{width:45%;border-top:2px solid var(--ac,#2F6BFF);padding-top:2mm;text-align:center;font-size:9pt}
      /* ---- 3. Stage (Épuré & bienveillant) ---- */
      .ct3{font-family:'Segoe UI',Arial,sans-serif;color:#333}
      .ct3 .ct-head{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #06C39A;padding-bottom:4mm;margin-bottom:6mm}
      .ct3 .ct-head h1{color:#06C39A;font-size:16pt}
      .ct3 .ct-badge{background:#06C39A;color:#fff;padding:2mm 4mm;border-radius:2mm;font-size:9pt;font-weight:700}
      .ct3 .ct-art h3{color:#06C39A;font-size:11pt;margin:4mm 0 2mm}
      .ct3 .ct-art p{text-align:justify;margin-bottom:2mm}
      .ct3 .ct-sig{display:flex;justify-content:space-between;margin-top:12mm}
      .ct3 .ct-sig .box{width:45%;text-align:center;font-size:9pt;padding-top:2mm;border-top:1px dashed #06C39A}
      /* ---- 4. Temps partiel / CDD court (Minimaliste) ---- */
      .ct4{font-family:'Segoe UI',Arial,sans-serif;color:#222}
      .ct4 .ct-head{text-align:center;margin-bottom:6mm}
      .ct4 .ct-head h1{font-weight:300;font-size:20pt;letter-spacing:1px}
      .ct4 .ct-head h1 b{font-weight:800}
      .ct4 .ct-grid{display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-bottom:6mm;background:#f4f4f8;padding:4mm;border-radius:3mm}
      .ct4 .ct-grid .item b{display:block;font-size:8pt;color:#666;text-transform:uppercase;margin-bottom:1mm}
      .ct4 .ct-art h3{font-size:10.5pt;margin:4mm 0 2mm;color:#101A3E}
      .ct4 .ct-art p{text-align:justify;margin-bottom:2mm}
      .ct4 .ct-sig{display:flex;justify-content:space-between;margin-top:12mm}
      .ct4 .ct-sig .box{width:45%;text-align:center;font-size:9pt;padding-top:2mm;border-top:1px solid #101A3E}
      /* ---- 5. Apprentissage / Alternance (Structuré) ---- */
      .ct5{font-family:Georgia,serif;color:#222}
      .ct5 .ct-head{border-top:3px double #3A2E8C;border-bottom:3px double #3A2E8C;padding:4mm 0;margin-bottom:6mm;text-align:center}
      .ct5 .ct-head h1{font-size:15pt;letter-spacing:2px;color:#3A2E8C;text-transform:uppercase}
      .ct5 .ct-parties{display:flex;justify-content:space-between;gap:6mm;margin-bottom:6mm}
      .ct5 .ct-party{flex:1;font-size:9.5pt}
      .ct5 .ct-party b{display:block;color:#3A2E8C;margin-bottom:1mm;font-size:8.5pt;text-transform:uppercase}
      .ct5 .ct-art h3{color:#3A2E8C;font-size:11pt;margin:4mm 0 2mm;border-bottom:1px dotted #ccc;padding-bottom:1mm}
      .ct5 .ct-art p{text-align:justify;margin-bottom:2mm}
      .ct5 .ct-sig{display:flex;justify-content:space-between;margin-top:12mm;gap:6mm}
      .ct5 .ct-sig .box{flex:1;text-align:center;font-size:9pt;padding-top:2mm;border-top:2px solid #3A2E8C}
    `;document.head.appendChild(s);
  }
})();

/* ---- Fonctions de rendu pour les 5 modèles ---- */
function R_ct1(d,opts){
  return `<div class="doc-a4"><div class="ct1">
    <div class="ct-head"><h1>Contrat de Travail à Durée Indéterminée</h1><div class="sub">Conforme à la Loi n° 021-2002 du 13 juin 2002 (Code du Travail)</div></div>
    <div class="ct-parties">
      <div class="ct-party"><b>L'Employeur</b>${R_esc(d.employeur_nom)}<br>${R_esc(d.employeur_adresse)}<br>RCCM : ${R_esc(d.employeur_rccm)}<br>NIF : ${R_esc(d.employeur_nif)}</div>
      <div class="ct-party"><b>Le Salarié</b>${R_esc(d.employe_nom)}<br>${R_esc(d.employe_adresse)}<br>CNI n° : ${R_esc(d.employe_cni)}<br>Tél : ${R_esc(d.employe_tel)}</div>
    </div>
    <div class="ct-art"><h3>Article 1 : Objet et Qualification</h3><p>Le salarié est engagé en qualité de <b>${R_esc(d.poste)}</b>. Il exercera ses fonctions principalement à <b>${R_esc(d.lieu_travail)}</b>, sous l'autorité de la direction.</p></div>
    <div class="ct-art"><h3>Article 2 : Date d'effet et Période d'essai</h3><p>Le présent contrat prend effet à compter du <b>${R_esc(d.date_debut)}</b>. Il est conclu pour une durée indéterminée, sous réserve d'une période d'essai de <b>${R_esc(d.periode_essai)}</b>, renouvelable une fois conformément à la loi.</p></div>
    <div class="ct-art"><h3>Article 3 : Durée du travail et Rémunération</h3><p>La durée hebdomadaire de travail est fixée à <b>${R_esc(d.duree_hebdo)} heures</b>. En contrepartie, le salarié percevra un salaire mensuel brut de <b>${R_esc(d.salaire_brut)} FCFA</b>, soumis aux retenues légales en vigueur.</p></div>
    <div class="ct-art"><h3>Article 4 : Congés et Obligations</h3><p>Le salarié bénéficie de <b>${R_esc(d.conges)}</b> de congés payés par mois de travail effectif. Il s'engage à respecter le règlement intérieur de l'entreprise et la clause de confidentialité.</p></div>
    <div class="ct-sig">
      <div class="box">Fait à ${R_esc(d.lieu_travail)}, le ${R_esc(d.date_signature)}<br><br><br>L'Employeur<br>(Signature et Cachet)</div>
      <div class="box">Fait à ${R_esc(d.lieu_travail)}, le ${R_esc(d.date_signature)}<br><br><br>Le Salarié<br>(Signature précédée de « Lu et approuvé »)</div>
    </div>
    <div class="foot">${opts.foot}</div></div></div>`;
}

function R_ct2(d,opts){
  return `<div class="doc-a4"><div class="ct2" style="--ac:${opts.ac}">
    <div class="ct-band"><h1>Contrat à Durée Déterminée (CDD)</h1><div class="sub">N° ${R_esc(d.numero_contrat)}</div></div>
    <div class="ct-row">
      <div class="ct-col"><b>Entre</b>${R_esc(d.employeur_nom)}<br>${R_esc(d.employeur_adresse)}<br>RCCM : ${R_esc(d.employeur_rccm)}</div>
      <div class="ct-col"><b>Et</b>${R_esc(d.employe_nom)}<br>${R_esc(d.employe_adresse)}<br>CNI n° : ${R_esc(d.employe_cni)}</div>
    </div>
    <div class="ct-art"><h3>1. Motif et Objet</h3><p>Le présent contrat est conclu pour un motif de <b>${R_esc(d.motif_cdd)}</b>. Le salarié est engagé au poste de <b>${R_esc(d.poste)}</b>.</p></div>
    <div class="ct-art"><h3>2. Durée du contrat</h3><p>Le contrat est conclu pour une durée déterminée commençant le <b>${R_esc(d.date_debut)}</b> et prenant fin le <b>${R_esc(d.date_fin)}</b>, incluant une période d'essai de <b>${R_esc(d.periode_essai)}</b>.</p></div>
    <div class="ct-art"><h3>3. Rémunération et Horaires</h3><p>Durée hebdomadaire : <b>${R_esc(d.duree_hebdo)} heures</b>. Salaire mensuel brut : <b>${R_esc(d.salaire_brut)} FCFA</b>, payable avant le 5 du mois suivant.</p></div>
    <div class="ct-art"><h3>4. Résiliation</h3><p>En dehors de la période d'essai, le contrat ne peut être rompu anticipativement que pour faute grave, force majeure ou accord commun des parties, conformément au Code du Travail congolais.</p></div>
    <div class="ct-sig">
      <div class="box">L'Employeur<br><br><br>(Signature et Cachet)</div>
      <div class="box">Le Salarié<br><br><br>(Lu et approuvé)</div>
    </div>
    <div class="foot">${opts.foot}</div></div></div>`;
}

function R_ct3(d,opts){
  return `<div class="doc-a4"><div class="ct3">
    <div class="ct-head"><h1>Convention de Stage</h1><div class="ct-badge">PÉRIODE DE FORMATION</div></div>
    <div style="margin-bottom:6mm">
      <b style="color:#06C39A;font-size:9pt">L'ORGANISME D'ACCUEIL :</b><br>${R_esc(d.employeur_nom)}, ${R_esc(d.employeur_adresse)}<br>
      <b style="color:#06C39A;font-size:9pt;margin-top:2mm;display:block">LE STAGIAIRE :</b><br>${R_esc(d.employe_nom)}, ${R_esc(d.employe_adresse)}, CNI n° ${R_esc(d.employe_cni)}
    </div>
    <div class="ct-art"><h3>Article 1 : Objet du stage</h3><p>Le stage a pour objectif de permettre au stagiaire d'acquérir une expérience professionnelle en tant que <b>${R_esc(d.poste)}</b>, en application de son cursus de formation.</p></div>
    <div class="ct-art"><h3>Article 2 : Durée et Horaires</h3><p>Le stage débutera le <b>${R_esc(d.date_debut)}</b> pour se terminer le <b>${R_esc(d.date_fin)}</b>. Les horaires de présence sont fixés de ${R_esc(d.horaires)}.</p></div>
    <div class="ct-art"><h3>Article 3 : Encadrement et Gratification</h3><p>Le stagiaire sera placé sous la responsabilité de <b>${R_esc(d.tuteur)}</b>. En contrepartie de son activité, il percevra une gratification mensuelle de <b>${R_esc(d.salaire_brut)} FCFA</b> (non soumise aux cotisations sociales classiques).</p></div>
    <div class="ct-art"><h3>Article 4 : Assurance et Confidentialité</h3><p>Le stagiaire reste affilié à son régime de sécurité sociale d'origine. Il s'engage à une stricte confidentialité sur les données de l'entreprise auxquelles il pourrait avoir accès.</p></div>
    <div class="ct-sig">
      <div class="box">Le Responsable de l'organisme<br><br><br>(Signature et Cachet)</div>
      <div class="box">Le Stagiaire<br><br><br>(Lu et approuvé)</div>
    </div>
    <div class="foot">${opts.foot}</div></div></div>`;
}

function R_ct4(d,opts){
  return `<div class="doc-a4"><div class="ct4">
    <div class="ct-head"><h1>Contrat de Travail <b>à Temps Partiel</b></h1></div>
    <div class="ct-grid">
      <div class="item"><b>Employeur</b>${R_esc(d.employeur_nom)}</div>
      <div class="item"><b>Salarié</b>${R_esc(d.employe_nom)}</div>
      <div class="item"><b>Poste</b>${R_esc(d.poste)}</div>
      <div class="item"><b>Début</b>${R_esc(d.date_debut)}</div>
    </div>
    <div class="ct-art"><h3>1. Nature du lien</h3><p>Les parties conviennent d'un contrat de travail à temps partiel. Le salarié n'est pas soumis à l'horaire collectif de l'entreprise mais aux plages horaires suivantes : <b>${R_esc(d.horaires)}</b>.</p></div>
    <div class="ct-art"><h3>2. Rémunération</h3><p>Le salaire est calculé au prorata de la durée du travail par rapport à un salarié à temps complet. Il est fixé à <b>${R_esc(d.salaire_brut)} FCFA</b> mensuels, payables à terme échu.</p></div>
    <div class="ct-art"><h3>3. Heures complémentaires</h3><p>Des heures complémentaires peuvent être demandées dans la limite du dixième de la durée hebdomadaire prévue, avec une majoration de 10%.</p></div>
    <div class="ct-art"><h3>4. Durée et Résiliation</h3><p>Le contrat est conclu pour une durée de <b>${R_esc(d.duree_contrat)}</b>. Il est renouvelable par tacite reconduction. La période d'essai est de <b>${R_esc(d.periode_essai)}</b>.</p></div>
    <div class="ct-sig">
      <div class="box">L'Employeur<br><br><br>(Signature)</div>
      <div class="box">Le Salarié<br><br><br>(Lu et approuvé)</div>
    </div>
    <div class="foot">${opts.foot}</div></div></div>`;
}

function R_ct5(d,opts){
  return `<div class="doc-a4"><div class="ct5">
    <div class="ct-head"><h1>Contrat d'Apprentissage</h1></div>
    <div class="ct-parties">
      <div class="ct-party"><b>L'Employeur</b>${R_esc(d.employeur_nom)}<br>${R_esc(d.employeur_adresse)}<br>Représenté par : ${R_esc(d.representant)}</div>
      <div class="ct-party"><b>L'Apprenti(e)</b>${R_esc(d.employe_nom)}<br>Né(e) le : ${R_esc(d.date_naissance)}<br>CNI n° : ${R_esc(d.employe_cni)}<br>Niveau scolaire : ${R_esc(d.niveau_scolaire)}</div>
    </div>
    <div class="ct-art"><h3>Article 1 : Diplôme ou Titre visé</h3><p>Le présent contrat a pour objet de former l'apprenti au métier de <b>${R_esc(d.poste)}</b> en vue de l'obtention du diplôme/titre suivant : <b>${R_esc(d.diplome_vise)}</b>.</p></div>
    <div class="ct-art"><h3>Article 2 : Durée et Alternance</h3><p>Le contrat est conclu pour une durée de <b>${R_esc(d.duree_contrat)}</b>, du ${R_esc(d.date_debut)} au ${R_esc(d.date_fin)}. L'apprenti suivra des cours théoriques à ${R_esc(d.centre_formation)} à raison de ${R_esc(d.rythme_alternance)}.</p></div>
    <div class="ct-art"><h3>Article 3 : Rémunération</h3><p>En application de la réglementation en vigueur, l'apprenti percevra un salaire mensuel égal à <b>${R_esc(d.pourcentage_salaire)}%</b> du SMIG ou du salaire minimum conventionnel, soit <b>${R_esc(d.salaire_brut)} FCFA</b>.</p></div>
    <div class="ct-art"><h3>Article 4 : Engagements du Maître d'Apprentissage</h3><p>L'employeur s'engage à inscrire l'apprenti au centre de formation, à lui assurer une formation pratique complète et à le présenter aux épreuves du diplôme.</p></div>
    <div class="ct-sig">
      <div class="box">L'Employeur<br><br><br>(Signature et Cachet)</div>
      <div class="box">L'Apprenti(e) (ou son représentant légal)<br><br><br>(Lu et approuvé)</div>
    </div>
    <div class="foot">${opts.foot}</div></div></div>`;
}

definirDocument({
  slug:'contrat-travail', type:'contrat', em:'📑',
  titre:'Contrats de travail',
  desc:'5 modèles juridiques solides, conformes au Code du Travail congolais. Protège ton entreprise et clarifie les attentes dès le premier jour.',
  prixUnit:200, prixPack:1500,
  defaut:{
    employeur_nom:'Mukanda SARL',
    employeur_adresse:'Avenue de la Paix, Brazzaville',
    employeur_rccm:'CG-BZV-2026-B-12-00123',
    employeur_nif:'C060012345X',
    representant:'Meurphy Talamio, Gérant',
    employe_nom:'Jean-Baptiste Nkouka',
    employe_adresse:'Ouenzé, Brazzaville',
    employe_cni:'123456789',
    employe_tel:'+242 06 518 69 67',
    date_naissance:'15 août 1998',
    niveau_scolaire:'Licence en Sciences de Gestion',
    poste:'Assistant Comptable',
    lieu_travail:'Brazzaville',
    date_debut:'1er avril 2026',
    date_fin:'31 mars 2027',
    date_signature:'15 mars 2026',
    numero_contrat:'CDD-2026-008',
    motif_cdd:'Accroissement temporaire d\'activité',
    duree_contrat:'12 mois',
    duree_hebdo:'40',
    rythme_alternance:'1 semaine entreprise / 1 semaine centre',
    periode_essai:'3 mois',
    salaire_brut:'150 000',
    pourcentage_salaire:'55',
    conges:'2,5 jours',
    horaires:'8h00 à 16h00, du lundi au vendredi',
    tuteur:'Mme. Kamba, Directrice Financière',
    diplome_vise:'Brevet de Technicien Supérieur (BTS) Comptabilité',
    centre_formation:'Centre de Formation Professionnelle de Brazzaville'
  },
  champs:[
    {g:'🏢 Employeur',f:[{p:'employeur_nom',l:'Nom de l\'entreprise'},{p:'employeur_adresse',l:'Adresse'},{p:'employeur_rccm',l:'N° RCCM'},{p:'employeur_nif',l:'N° NIF / NIU'},{p:'representant',l:'Nom du représentant légal'}]},
    {g:'👤 Employé / Stagiaire',f:[{p:'employe_nom',l:'Nom complet'},{p:'employe_adresse',l:'Adresse'},{p:'employe_cni',l:'N° CNI'},{p:'employe_tel',l:'Téléphone'},{p:'date_naissance',l:'Date de naissance (si apprentissage)'},{p:'niveau_scolaire',l:'Niveau scolaire (si apprentissage)'}]},
    {g:'💼 Poste & Durée',f:[
      {p:'poste',l:'Intitulé du poste'},
      {p:'lieu_travail',l:'Lieu de travail'},
      {p:'date_debut',l:'Date de début'},
      {p:'date_fin',l:'Date de fin (laisser vide si CDI)'},
      {p:'date_signature',l:'Date de signature'},
      {p:'numero_contrat',l:'N° du contrat (optionnel)'},
      {p:'motif_cdd',l:'Motif du CDD (si applicable)'},
      {p:'duree_contrat',l:'Durée totale (ex: 12 mois)'},
      {p:'periode_essai',l:'Durée de la période d\'essai'}
    ]},
    {g:'💰 Conditions',f:[
      {p:'duree_hebdo',l:'Durée hebdomadaire (heures)'},
      {p:'horaires',l:'Horaires de travail'},
      {p:'salaire_brut',l:'Salaire mensuel brut (FCFA)'},
      {p:'conges',l:'Congés payés (ex: 2,5 jours/mois)'},
      {p:'pourcentage_salaire',l:'% du SMIG (pour apprentissage uniquement)'},
      {p:'tuteur',l:'Nom du tuteur / maître d\'apprentissage'},
      {p:'diplome_vise',l:'Diplôme ou titre visé (apprentissage)'},
      {p:'centre_formation',l:'Centre de formation (apprentissage)'},
      {p:'rythme_alternance',l:'Rythme d\'alternance'}
    ]}
  ],
  modeles:[
    {id:1,nom:'CDI Standard',badge:'Le plus utilisé',color:'#1a1a2e',
     usage:'Recrutement classique, emploi stable',
     desc:'Le contrat de droit commun. Formel, complet, avec toutes les clauses de protection légales (période d\'essai, congés, confidentialité).',
     rendu:d=>R_ct1(d,{foot:'Contrat 1/5 · CDI Standard · © Mukanda'})},
    {id:2,nom:'CDD / Mission',badge:'Flexible',color:'#2F6BFF',
     usage:'Remplacement, surcroît d\'activité, projet précis',
     desc:'Clair sur la date de fin et le motif légal. Bandeau moderne, structure aérée pour une lecture rapide des obligations.',
     rendu:d=>R_ct2(d,{ac:'#2F6BFF',foot:'Contrat 2/5 · CDD / Mission · © Mukanda'})},
    {id:3,nom:'Convention de Stage',badge:'Étudiants',color:'#06C39A',
     usage:'Stages de fin d\'études, stages d\'observation',
     desc:'Met l\'accent sur la formation et l\'encadrement, avec mention de la gratification (et non du salaire) et des horaires.',
     rendu:d=>R_ct3(d,{foot:'Contrat 3/5 · Convention de Stage · © Mukanda'})},
    {id:4,nom:'Temps Partiel',badge:'Spécifique',color:'#101A3E',
     usage:'Emplois à horaires réduits, renforts ponctuels',
     desc:'Minimaliste et direct. Insiste sur les plages horaires spécifiques et le calcul au prorata de la rémunération.',
     rendu:d=>R_ct4(d,{foot:'Contrat 4/5 · Temps Partiel · © Mukanda'})},
    {id:5,nom:'Apprentissage',badge:'Formation',color:'#3A2E8C',
     usage:'Jeunes en alternance, formation en milieu professionnel',
     desc:'Conforme aux exigences des centres de formation : mention du diplôme visé, du pourcentage du SMIG, et du rythme d\'alternance.',
     rendu:d=>R_ct5(d,{foot:'Contrat 5/5 · Apprentissage · © Mukanda'})}
  ]
});

/* ➕ PROCHAIN DOCUMENT ICI (ex : definirDocument({slug:'attestations', ...})) */


/* ============================================================
   📜 DOCUMENT : ATTESTATIONS (5 modèles)
   ➕ Bloc autonome : CSS injecté + definirDocument.
   ➕ Formulations juridiques adaptées aux usages du Congo-Brazzaville.
   ============================================================ */
(function(){
  if(!document.getElementById('css-attestations')){
    const s=document.createElement('style');s.id='css-attestations';s.textContent=`
      .att1,.att2,.att3,.att4,.att5{padding:20mm;min-height:297mm;position:relative;font-size:10.5pt;line-height:1.6;color:#222}
      /* ---- 1. Travail (Classique & sobre) ---- */
      .att1{font-family:Georgia,'Times New Roman',serif}
      .att1 .att-head{text-align:center;margin-bottom:10mm;text-transform:uppercase;font-weight:700;font-size:14pt;letter-spacing:1px}
      .att1 .att-body{text-align:justify;margin-bottom:12mm}
      .att1 .att-body p{margin-bottom:4mm}
      .att1 .att-sig{margin-top:15mm;text-align:right;font-style:italic}
      /* ---- 2. Stage (Moderne avec filet) ---- */
      .att2{font-family:'Segoe UI',Arial,sans-serif}
      .att2 .att-head{border-bottom:3px solid var(--ac,#06C39A);padding-bottom:4mm;margin-bottom:8mm;display:flex;justify-content:space-between;align-items:flex-end}
      .att2 .att-head h1{color:var(--ac,#06C39A);font-size:16pt;margin:0}
      .att2 .att-head .sub{font-size:9pt;color:#666;text-align:right}
      .att2 .att-body p{margin-bottom:4mm}
      .att2 .att-sig{margin-top:15mm;text-align:right}
      .att2 .att-sig .box{display:inline-block;text-align:center;border-top:1px solid #222;padding-top:2mm;min-width:60mm}
      /* ---- 3. Salaire (Structuré, met en valeur les chiffres) ---- */
      .att3{font-family:'Segoe UI',Arial,sans-serif}
      .att3 .att-head{text-align:center;margin-bottom:8mm}
      .att3 .att-head h1{font-size:16pt;color:#1a1a2e;margin-bottom:2mm}
      .att3 .att-box{background:#f4f6f9;border:1px solid #dde2ea;border-radius:4mm;padding:6mm;margin:6mm 0;font-size:11pt}
      .att3 .att-box b{color:#1a1a2e}
      .att3 .att-sig{margin-top:15mm;display:flex;justify-content:space-between}
      .att3 .att-sig .box{width:45%;text-align:center;padding-top:2mm;border-top:2px solid #1a1a2e;font-size:9pt}
      /* ---- 4. Hébergement (Déclaratif, clair) ---- */
      .att4{font-family:Georgia,serif}
      .att4 .att-head{text-align:center;font-size:15pt;font-weight:700;margin-bottom:8mm;text-decoration:underline;text-underline-offset:4mm}
      .att4 .att-je{font-size:11pt;margin-bottom:6mm}
      .att4 .att-je b{display:block;font-size:12pt;margin-bottom:2mm}
      .att4 .att-sig{margin-top:15mm;text-align:right}
      /* ---- 5. Sur l'honneur (Minimaliste, solennel) ---- */
      .att5{font-family:'Segoe UI',Arial,sans-serif;color:#111}
      .att5 .att-head{text-align:center;font-size:18pt;font-weight:800;letter-spacing:2px;margin-bottom:12mm;color:#1a1a2e}
      .att5 .att-body{font-size:11pt;line-height:1.8;text-align:justify}
      .att5 .att-body .hl{background:#fff8e1;padding:0 2mm;border-radius:2mm;font-weight:700}
      .att5 .att-sig{margin-top:20mm;text-align:center}
      .att5 .att-sig .box{display:inline-block;padding:4mm 10mm;border:2px solid #1a1a2e;border-radius:4mm;font-weight:700}
    `;document.head.appendChild(s);
  }
})();

/* ---- Fonctions de rendu pour les 5 modèles ---- */
function R_att1(d,opts){
  return `<div class="doc-a4"><div class="att1">
    <div class="att-head">ATTESTATION DE TRAVAIL</div>
    <div class="att-body">
      <p>Je soussigné(e), <b>${R_esc(d.emetteur_nom)}</b>, agissant en qualité de <b>${R_esc(d.emetteur_fonction)}</b> au sein de <b>${R_esc(d.emetteur_entreprise)}</b>,</p>
      <p>Certifie par la présente que :</p>
      <p style="text-align:center;font-size:12pt;margin:6mm 0"><b>${R_esc(d.concerne_nom)}</b><br>CNI n° ${R_esc(d.concerne_cni)}</p>
      <p>A été employé(e) au sein de notre établissement en qualité de <b>${R_esc(d.poste_fonction)}</b>, pour la période allant du <b>${R_esc(d.date_debut)}</b> au <b>${R_esc(d.date_fin)}</b>.</p>
      <p>Cette attestation est délivrée à la demande de l'intéressé(e), ${R_esc(d.motif_precision)}.</p>
    </div>
    <div class="att-sig">
      Fait à ${R_esc(d.lieu)}, le ${R_esc(d.date)}<br><br><br>
      ${R_esc(d.emetteur_nom)}<br>
      <i>(Signature et Cachet de l'entreprise)</i>
    </div>
    <div class="foot">${opts.foot}</div></div></div>`;
}

function R_att2(d,opts){
  return `<div class="doc-a4"><div class="att2" style="--ac:${opts.ac}">
    <div class="att-head">
      <h1>ATTESTATION DE STAGE</h1>
      <div class="sub">${R_esc(d.emetteur_entreprise)}<br>${R_esc(d.emetteur_adresse)}<br>${R_esc(d.emetteur_tel)}</div>
    </div>
    <div class="att-body">
      <p>Je soussigné(e), <b>${R_esc(d.emetteur_nom)}</b>, <b>${R_esc(d.emetteur_fonction)}</b>, certifie que :</p>
      <p style="text-align:center;font-size:11.5pt;margin:6mm 0"><b>${R_esc(d.concerne_nom)}</b><br>Étudiant(e) en ${R_esc(d.concerne_fonction)}</p>
      <p>A effectué un stage au sein de notre structure du <b>${R_esc(d.date_debut)}</b> au <b>${R_esc(d.date_fin)}</b>.</p>
      <p> Durant cette période, ${R_esc(d.concerne_nom).split(' ')[0]} a fait preuve de sérieux, d'assiduité et a participé activement aux missions qui lui ont été confiées.</p>
      <p>Cette attestation est délivrée pour servir et valoir ce que de droit.</p>
    </div>
    <div class="att-sig">
      <div class="box">
        Fait à ${R_esc(d.lieu)}, le ${R_esc(d.date)}<br><br>
        ${R_esc(d.emetteur_nom)}<br>
        <i>(Signature et Cachet)</i>
      </div>
    </div>
    <div class="foot">${opts.foot}</div></div></div>`;
}

function R_att3(d,opts){
  return `<div class="doc-a4"><div class="att3">
    <div class="att-head"><h1>ATTESTATION DE SALAIRE</h1></div>
    <div class="att-body">
      <p>Je soussigné(e), <b>${R_esc(d.emetteur_nom)}</b>, <b>${R_esc(d.emetteur_fonction)}</b> de la société <b>${R_esc(d.emetteur_entreprise)}</b>,</p>
      <p>Certifie que <b>${R_esc(d.concerne_nom)}</b>, titulaire de la CNI n° ${R_esc(d.concerne_cni)}, est employé(e) dans notre entreprise en qualité de <b>${R_esc(d.concerne_fonction)}</b> depuis le ${R_esc(d.date_debut)}.</p>
      <div class="att-box">
        À ce titre, il/elle perçoit un salaire mensuel brut de :<br>
        <b style="font-size:14pt;color:#1a1a2e">${R_esc(d.salaire_mensuel)} FCFA</b>
      </div>
      <p>Cette attestation est établie à la demande de l'intéressé(e), ${R_esc(d.motif_precision)}.</p>
    </div>
    <div class="att-sig">
      <div class="box">Fait à ${R_esc(d.lieu)}, le ${R_esc(d.date)}<br><br><br>L'Employeur<br>(Cachet et Signature)</div>
    </div>
    <div class="foot">${opts.foot}</div></div></div>`;
}

function R_att4(d,opts){
  return `<div class="doc-a4"><div class="att4">
    <div class="att-head">ATTESTATION D'HÉBERGEMENT</div>
    <div class="att-je">
      Je soussigné(e),
      <b>${R_esc(d.emetteur_nom)}</b>
      Né(e) le ${R_esc(d.emetteur_ne_le)} à ${R_esc(d.emetteur_ne_a)}
      Titulaire de la CNI n° ${R_esc(d.emetteur_cni)}
      Demeurant au : ${R_esc(d.emetteur_adresse)}
    </div>
    <div class="att-body">
      <p>Certifie sur l'honneur héberger à mon domicile, à titre gratuit, depuis le <b>${R_esc(d.date_debut)}</b> :</p>
      <p style="text-align:center;font-size:11.5pt;margin:6mm 0">
        <b>${R_esc(d.concerne_nom)}</b><br>
        Né(e) le ${R_esc(d.concerne_ne_le)} à ${R_esc(d.concerne_ne_a)}<br>
        Titulaire de la CNI n° ${R_esc(d.concerne_cni)}
      </p>
      <p>Je m'engage à maintenir cet hébergement pour une durée de <b>${R_esc(d.duree_hebergement)}</b>.</p>
      <p>Cette attestation est délivrée pour servir et valoir ce que de droit.</p>
    </div>
    <div class="att-sig">
      Fait à ${R_esc(d.lieu)}, le ${R_esc(d.date)}<br><br><br>
      <i>(Signature légalisée en mairie)</i>
    </div>
    <div class="foot">${opts.foot}</div></div></div>`;
}

function R_att5(d,opts){
  return `<div class="doc-a4"><div class="att5">
    <div class="att-head">ATTESTATION SUR L'HONNEUR</div>
    <div class="att-body">
      <p>Je soussigné(e),</p>
      <p style="text-align:center;font-size:11.5pt;margin:6mm 0">
        <b>${R_esc(d.concerne_nom)}</b><br>
        Né(e) le <span class="hl">${R_esc(d.concerne_ne_le)}</span> à <span class="hl">${R_esc(d.concerne_ne_a)}</span><br>
        Titulaire de la CNI n° <span class="hl">${R_esc(d.concerne_cni)}</span><br>
        Demeurant au : ${R_esc(d.concerne_adresse)}
      </p>
      <p>Certifie sur l'honneur que les informations suivantes sont exactes et sincères :</p>
      <p style="background:#f8f9fa;padding:4mm;border-radius:2mm;border-left:4px solid #1a1a2e;margin:6mm 0">
        ${R_esc(d.motif_precision)}
      </p>
      <p>J'ai pris conscience que toute fausse déclaration m'expose aux sanctions pénales prévues par la loi en vigueur en République du Congo.</p>
      <p>Fait pour servir et valoir ce que de droit.</p>
    </div>
    <div class="att-sig">
      <div class="box">
        Fait à ${R_esc(d.lieu)}, le ${R_esc(d.date)}<br><br>
        Signature du déclarant<br>
        <i>(Précédée de la mention "Lu et approuvé")</i>
      </div>
    </div>
    <div class="foot">${opts.foot}</div></div></div>`;
}

definirDocument({
  slug:'attestations', type:'attestation', em:'📜',
  titre:'Attestations officielles',
  desc:'5 modèles administratifs prêts à l\'emploi. Formulations juridiques claires, conformes aux attentes des administrations et entreprises congolaises.',
  prixUnit:200, prixPack:800,
  defaut:{
    emetteur_nom:'Meurphy Talamio',
    emetteur_fonction:'Gérant',
    emetteur_entreprise:'Mukanda SARL',
    emetteur_adresse:'Avenue de la Paix, Brazzaville',
    emetteur_tel:'+242 06 518 69 67',
    emetteur_cni:'987654321',
    emetteur_ne_le:'10 janvier 1990',
    emetteur_ne_a:'Brazzaville',
    concerne_nom:'Jean-Baptiste Nkouka',
    concerne_cni:'123456789',
    concerne_ne_le:'15 août 1998',
    concerne_ne_a:'Pointe-Noire',
    concerne_adresse:'Ouenzé, Brazzaville',
    concerne_fonction:'Licence en Sciences de Gestion',
    poste_fonction:'Assistant Comptable',
    date_debut:'1er janvier 2024',
    date_fin:'31 décembre 2025',
    duree_hebergement:'12 mois',
    salaire_mensuel:'150 000',
    motif_precision:'pour faire valoir ce que de droit',
    lieu:'Brazzaville',
    date:'15 mars 2026'
  },
  champs:[
    {g:'🏢 L\'Émetteur (ou l\'Hébergeant)',f:[
      {p:'emetteur_nom',l:'Nom complet'},
      {p:'emetteur_fonction',l:'Fonction / Titre (ex: Le Directeur)'},
      {p:'emetteur_entreprise',l:'Entreprise / Organisation (si applicable)'},
      {p:'emetteur_adresse',l:'Adresse complète'},
      {p:'emetteur_tel',l:'Téléphone'},
      {p:'emetteur_cni',l:'Ta CNI (pour hébergement)'},
      {p:'emetteur_ne_le',l:'Ta date de naissance (pour hébergement)'},
      {p:'emetteur_ne_a',l:'Ton lieu de naissance (pour hébergement)'}
    ]},
    {g:'👤 La Personne concernée (ou l\'Hébergé)',f:[
      {p:'concerne_nom',l:'Nom complet'},
      {p:'concerne_cni',l:'Numéro de CNI'},
      {p:'concerne_ne_le',l:'Date de naissance'},
      {p:'concerne_ne_a',l:'Lieu de naissance'},
      {p:'concerne_adresse',l:'Adresse (pour attestation sur l\'honneur)'},
      {p:'concerne_fonction',l:'Fonction / Niveau d\'étude'}
    ]},
    {g:'📝 Détails du document',f:[
      {p:'poste_fonction',l:'Poste occupé (pour travail/stage)'},
      {p:'date_debut',l:'Date de début'},
      {p:'date_fin',l:'Date de fin (ou "à ce jour")'},
      {p:'duree_hebergement',l:'Durée d\'hébergement (pour hébergement)'},
      {p:'salaire_mensuel',l:'Salaire mensuel brut (pour salaire)'},
      {p:'motif_precision',l:'Motif / Précision (ex: "pour faire valoir ce que de droit" ou le texte de ton attestation sur l\'honneur)'},
      {p:'lieu',l:'Lieu de délivrance'},
      {p:'date',l:'Date de délivrance'}
    ]}
  ],
  modeles:[
    {id:1,nom:'Attestation de travail',badge:'Le plus demandé',color:'#1a1a2e',
     usage:'Fin de contrat, demande de visa, prêt bancaire',
     desc:'Le grand classique. Sobre, formel, avec toutes les mentions légales requises par les employeurs et administrations.',
     rendu:d=>R_att1(d,{foot:'Attestation 1/5 · Travail · © Mukanda'})},
    {id:2,nom:'Attestation de stage',badge:'Étudiants',color:'#06C39A',
     usage:'Fin de stage, rapport de stage, première embauche',
     desc:'Met en valeur l\'assiduité et les missions. Bandeau moderne et ton bienveillant pour encourager le stagiaire.',
     rendu:d=>R_att2(d,{ac:'#06C39A',foot:'Attestation 2/5 · Stage · © Mukanda'})},
    {id:3,nom:'Attestation de salaire',badge:'Finances',color:'#2F6BFF',
     usage:'Demande de crédit, location d\'appartement, visa',
     desc:'Structure claire qui met en évidence le montant du salaire brut. Indispensable pour les démarches financières.',
     rendu:d=>R_att3(d,{foot:'Attestation 3/5 · Salaire · © Mukanda'})},
    {id:4,nom:'Attestation d\'hébergement',badge:'Administratif',color:'#F59E0B',
     usage:'Obtention de papiers, inscription scolaire, démarches mairie',
     desc:'Format déclaratif strict. Mentionne l\'hébergeant et l\'hébergé avec leurs CNI respectives. Prête pour légalisation.',
     rendu:d=>R_att4(d,{foot:'Attestation 4/5 · Hébergement · © Mukanda'})},
    {id:5,nom:'Attestation sur l\'honneur',badge:'Universel',color:'#FF5D73',
     usage:'Déclaration de perte, changement d\'adresse, situation matrimoniale',
     desc:'Modèle minimaliste et solennel. Tu remplis le champ "Motif" avec ta propre déclaration, le cadre juridique est déjà en place.',
     rendu:d=>R_att5(d,{foot:'Attestation 5/5 · Sur l\'honneur · © Mukanda'})}
  ]
});

/* ➕ PROCHAIN DOCUMENT ICI (ex : definirDocument({slug:'certificats', ...})) */