// ============================================================================
// 📥 MUKANDA-DOWNLOAD v3 — voir DANS le site + télécharger vraiment
// GET  ?token=…  → JSON { vue_url, telechargement_url } (signées 1 h, JAMAIS affichées)
// POST {telephone} → « Récupérer mon achat » (self-service)
// ============================================================================
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('MUKANDA_SERVICE_KEY')!);
const PROJET = Deno.env.get('SUPABASE_URL')!.replace('https://', '').split('.')[0];
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type' };
const json = (o: any, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  try {
    // ---------- POST : Récupérer mon achat ----------
    if (req.method === 'POST') {
      const { telephone } = await req.json().catch(() => ({}));
      if (!telephone) return json({ error: 'Numéro de téléphone requis' }, 400);
      const digits = String(telephone).replace(/\D/g, '').slice(-9);
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const r = await sb.from('achats').select('id, produit_id, montant, telephone, created_at')
        .eq('statut', 'paye').eq('produit_type', 'document').gte('created_at', since);
      if (r.error) return json({ error: 'Requête achats : ' + r.error.message }, 500);
      const miens = (r.data || []).filter((a: any) => String(a.telephone).replace(/\D/g, '').slice(-9) === digits);
      if (!miens.length) return json({ error: 'Aucun achat payé trouvé pour ce numéro (30 derniers jours).' }, 404);
      const docs = await sb.from('documents').select('id, titre').in('id', miens.map((a: any) => a.produit_id));
      const titreDe = (id: string) => (docs.data || []).find((d: any) => d.id === id)?.titre || 'Document';
      const liens = [];
      for (const a of miens) {
        const t = await sb.from('tokens_telechargement').insert({ achat_id: a.id, document_id: a.produit_id }).select('token, expire_le, max_downloads').single();
        if (t.data) liens.push({
          titre: titreDe(a.produit_id), montant: a.montant,
          url: `https://${PROJET}.functions.supabase.co/mukanda-download?token=${t.data.token}`
        });
      }
      return json({ ok: true, achats: liens.length, liens });
    }

    // ---------- GET : résoudre un token en 2 URLs courtes ----------
    const token = new URL(req.url).searchParams.get('token');
    if (!token) return json({ error: 'Token manquant' }, 400);
    const r = await sb.from('tokens_telechargement')
      .select('*, achat:achats(statut), doc:documents(titre, fichier_path)')
      .eq('token', token).maybeSingle();
    const t = r.data;
    if (!t) return json({ error: 'Lien invalide ou expiré. Utilise « Récupérer mon achat ».' }, 404);
    if (t.achat?.statut !== 'paye') return json({ error: 'Commande non payée.' }, 402);
    if (new Date(t.expire_le) < new Date()) return json({ error: 'Lien expiré (48 h). Utilise « Récupérer mon achat ».' }, 410);
    if (t.nb_downloads >= t.max_downloads) return json({ error: 'Limite de 3 téléchargements atteinte. Écris-nous sur WhatsApp, on te renvoie ton lien.' }, 429);

    await sb.from('tokens_telechargement').update({ nb_downloads: t.nb_downloads + 1 }).eq('id', t.id);
    const [vue, tel] = await Promise.all([
      sb.storage.from('mukanda-prive').createSignedUrl(t.doc.fichier_path, 3600),
      sb.storage.from('mukanda-prive').createSignedUrl(t.doc.fichier_path, 3600, { download: true })
    ]);
    if (vue.error || tel.error || !vue.data || !tel.data)
      return json({ error: 'Fichier indisponible : ' + (vue.error?.message || tel.error?.message) }, 500);
    return json({ ok: true, titre: t.doc.titre, vue_url: vue.data.signedUrl, telechargement_url: tel.data.signedUrl });
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
});