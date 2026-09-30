// ============================================================================
// 🔔 MUKANDA-WEBHOOK — confirmation OpenPay : vérifie, débloque, journalise
// Règles : toujours HTTP 200 · idempotent · montant revérifié côté serveur
// ============================================================================
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('MUKANDA_SERVICE_KEY')!);
const SUCCES = ['success', 'succeeded', 'completed', 'paid', 'paye', 'confirm', 'done', 'approved'];
const ok = () => new Response('ok', { status: 200, headers: { 'Content-Type': 'text/plain' } });

serve(async (req) => {
  try {
    const txt = await req.text();
    let p: any = {};
    try { p = JSON.parse(txt); } catch { p = Object.fromEntries(new URLSearchParams(txt)); }
    await sb.from('mukanda_logs').insert({ action: 'openpay_webhook', details: p });

    const statut = String(p.status || p.statut || p.transaction_status || p.state || p.result || '').toLowerCase();
    if (!statut) return ok();
    const leurRef = String(p.reference || p.transaction_reference || p.txn_id || '');
        const notreRef = String(p.merchant_reference || p.customer_external_id || p.order_id || p.external_reference || (p.metadata && (p.metadata.reference || p.metadata.merchant_reference)) || '');
    const montant = parseInt(String(p.amount ?? p.montant ?? '0'), 10);
    const telDigits = String(p.paymentPhoneNumber || p.phone || p.phoneNumber || p.msisdn || '').replace(/\D/g, '');
    const estSucces = SUCCES.some(s => statut.includes(s));

    // 1) par notre référence marchand
    let achat: any = null;
    if (notreRef) achat = (await sb.from('achats').select('*').eq('ref_openpay', notreRef).maybeSingle()).data;
    // 2) repli : montant + téléphone parmi les commandes en attente (< 24 h)
    if (!achat && telDigits && montant) {
      const since = new Date(Date.now() - 86400000).toISOString();
      const r = await sb.from('achats').select('*').eq('statut', 'en_attente').eq('montant', montant).gte('created_at', since);
      achat = (r.data || []).find((a: any) => a.telephone.replace(/\D/g, '').slice(-9) === telDigits.slice(-9)) || null;
    }
    if (!achat) return ok();                      // notification inconnue : journalisée, rien à faire
    if (achat.statut === 'paye') return ok();     // idempotence : jamais de double déblocage

    if (!estSucces) {
      await sb.from('achats').update({ statut: 'echoue' }).eq('id', achat.id);
      return ok();
    }
    // Anti-fraude : le montant reçu doit égaler le montant commandé
    if (montant && montant !== achat.montant) {
      await sb.from('mukanda_logs').insert({ action: 'openpay_montant_incoherent', details: { attendu: achat.montant, recu: montant, ref: leurRef } });
      await sb.from('achats').update({ statut: 'echoue' }).eq('id', achat.id);
      return ok();
    }

    await sb.from('achats').update({ statut: 'paye', paid_at: new Date().toISOString(), ref_openpay: leurRef || achat.ref_openpay }).eq('id', achat.id);
    if (achat.user_id) {
      await sb.from('acces').upsert(
        { user_id: achat.user_id, produit_type: achat.produit_type, produit_id: achat.produit_id, achat_id: achat.id },
        { onConflict: 'user_id,produit_type,produit_id' }
      );
    }
    if (achat.produit_type === 'document') {
      await sb.from('tokens_telechargement').insert({ achat_id: achat.id, document_id: achat.produit_id });
    }
    await sb.from('mukanda_logs').insert({ action: 'paiement_confirme', details: { achat: achat.id, montant: achat.montant } });
    return ok();
  } catch (e) {
    return ok(); // on ne bloque JAMAIS les retries d'OpenPay
  }
});