// ============================================================================
// 💳 MUKANDA-PAY v3 — conforme à la doc officielle OpenPay
// POST https://api.openpay-cg.com/v1/transaction/payment · header XO-API-KEY
// ============================================================================
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('MUKANDA_SERVICE_KEY')!;
const OPENPAY_KEY = Deno.env.get('OPENPAY_API_KEY')!;

// ✅ Vrais endpoints, tirés de la documentation officielle openpay.cg
const OPENPAY_BASE = 'https://api.openpay-cg.com';
const OPENPAY_CHECKOUT = '/v1/transaction/payment';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey'
};
const json = (o: any, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });

// 065186967 → 242065186967 (format exigé par OpenPay)
function telCongo(t: string): string {
  const d = t.replace(/\D/g, '');
  if (d.startsWith('242')) return d;
  if (d.startsWith('0')) return '242' + d; // On garde le 0 : 242 + 06... = 12 chiffres
  return '242' + d;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
    global: { headers: (req.headers.get('Authorization') || '') ? { Authorization: req.headers.get('Authorization')! } : {} }
  });
  const etape = async (achat: any, nom: string, details: any) => {
    try { await sb.from('mukanda_logs').insert({ action: 'pay_' + nom, details: { achat, ...details } }); } catch {}
  };
  try {
    const body = await req.json().catch(() => ({}));
    const { produit_type, produit_id, telephone, email, code, provider } = body;
    if (!['cours', 'document'].includes(produit_type) || !produit_id || !telephone)
      return json({ error: 'Paramètres manquants : produit_type, produit_id, telephone' }, 400);

    // 1) Commande (montant calculé CÔTÉ SERVEUR, jamais côté client)
    const cmd = await sb.rpc('creer_commande', { p_type: produit_type, p_produit_id: produit_id, p_telephone: telephone, p_code: code || null });
    if (cmd.error) { await etape(null, 'rpc_erreur', { msg: cmd.error.message }); return json({ error: cmd.error.message }, 400); }
    const achatId = cmd.data?.achat_id;
    const montant = cmd.data?.montant;
    if (!achatId || typeof montant !== 'number') {
      await etape(null, 'rpc_inattendu', { data: cmd.data });
      return json({ error: 'Réponse RPC inattendue', detail: cmd.data }, 500);
    }

    // 2) Référence marchand (servira au matching du webhook)
    const ref = 'MK-' + String(achatId).slice(0, 8).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
    const upd = await sb.from('achats').update({ ref_openpay: ref, email: email || null }).eq('id', achatId);
    if (upd.error) { await etape(achatId, 'update_erreur', { msg: upd.error.message }); return json({ error: 'MAJ commande : ' + upd.error.message }, 500); }
    await etape(achatId, 'commande_prete', { ref, montant });

    // 3) Appel OpenPay — format EXACT de leur documentation officielle
    const tel = telCongo(telephone);
    let opStatus = 0, opRaw: any = null, opUrl: string | null = null, opErr: string | null = null;
    try {
      const r = await fetch(OPENPAY_BASE + OPENPAY_CHECKOUT, {
        method: 'POST',
        headers: { 'XO-API-KEY': OPENPAY_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          amount: montant,
          payment_phone_number: tel,
          provider: (provider || 'MTN').toUpperCase(),
          customer_external_id: ref,
          customer: { name: 'Client Mukanda', phone: tel },
          metadata: { merchant_reference: ref, produit_type, produit_id }
        })
      });
      opStatus = r.status;
      const txt = await r.text();
      try { opRaw = JSON.parse(txt); } catch { opRaw = txt; }
      opUrl = opRaw?.data?.url || opRaw?.data?.checkout_url || opRaw?.data?.payment_url || opRaw?.url || opRaw?.checkout_url || opRaw?.payment_url || null;
    } catch (e) { opErr = String(e?.message || e); }
    await etape(achatId, 'openpay_reponse', { status: opStatus, err: opErr, raw: opRaw });

    if (opErr) return json({ error: 'Connexion OpenPay impossible', detail: opErr, achat_id: achatId, ref }, 502);
    if (opUrl) return json({ ok: true, mode: 'url', achat_id: achatId, ref, montant, paiement_url: opUrl });
    if (opStatus >= 200 && opStatus < 300)
      return json({ ok: true, mode: 'push_telephone', message: 'Commande enregistrée : le client reçoit la demande de paiement MoMo/Airtel directement sur son téléphone.', achat_id: achatId, ref, montant, openpay: opRaw });
    return json({ error: 'Réponse OpenPay inattendue', openpay_status: opStatus, openpay_raw: opRaw, achat_id: achatId, ref }, 502);
  } catch (e) {
    console.error('mukanda-pay crash:', e);
    await etape(null, 'crash', { msg: String(e?.message || e) });
    return json({ error: 'Crash : ' + String(e?.message || e) }, 500);
  }
}); 