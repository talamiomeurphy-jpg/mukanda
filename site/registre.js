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