'use strict';
// Pure parsing: no network, eval, model, credentials or purchase actions.
function extractOffers(input) {
  if (!input || typeof input.html !== 'string' || input.html.length > 1000000) throw new Error('html requerido, maximo 1000000 caracteres');
  const source = safeUrl(input.sourceUrl);
  if (!source) throw new Error('sourceUrl debe ser URL HTTPS admitida sin credenciales (sin verificacion DNS)');
  if (typeof input.observedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(input.observedAt) || !Number.isFinite(Date.parse(input.observedAt))) throw new Error('observedAt ISO requerido');
  const warnings = [], products = [], offers = [];
  const blocks = [...input.html.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].filter(m => /(?:^|\s)type\s*=\s*["']application\/ld\+json["']/i.test(m[1]));
  if (blocks.length > 100) throw new Error('demasiados bloques JSON-LD');
  function visit(x, depth = 0) {
    if (depth > 30 || !x || typeof x !== 'object') return;
    if (Array.isArray(x)) { x.forEach(v => visit(v, depth + 1)); return; }
    if ([].concat(x['@type'] || []).includes('Product')) products.push(x);
    if (x['@graph']) visit(x['@graph'], depth + 1);
    if (x.mainEntity) visit(x.mainEntity, depth + 1);
  }
  for (const block of blocks) { try { visit(JSON.parse(block[2])); } catch { warnings.push('json_ld_invalido'); } }
  for (const p of products) {
    for (const o of [].concat(p.offers || [])) {
      if (!o || typeof o !== 'object') continue;
      if (![ ].concat(o['@type'] || []).includes('Offer')) { warnings.push('tipo_oferta_no_soportado'); continue; }
      const offerUrl = safeUrl(o.url);
      const productUrl = safeUrl(p.url) || safeUrl(p['@id']);
      const sameProduct = (a,b) => { const x=new URL(a), y=new URL(b); return x.hostname.replace(/^www\./,'') === y.hostname.replace(/^www\./,'') && x.pathname.replace(/\/$/,'') === y.pathname.replace(/\/$/,''); };
      if ([offerUrl,productUrl].filter(Boolean).some(url => !sameProduct(url, source))) { warnings.push('producto_relacionado_excluido'); continue; }
      // Schema.org price uses a decimal point. Locale-formatted display prices are ambiguous.
      const raw = o.price;
      const amount = (typeof raw === 'number' || typeof raw === 'string' && /^\d+(\.\d+)?$/.test(raw)) ? Number(raw) : null;
      const price = amount !== null && Number.isFinite(amount) && amount > 0 ? amount : null;
      const currency = typeof o.priceCurrency === 'string' && /^[A-Z]{3}$/.test(o.priceCurrency) ? o.priceCurrency : null;
      const availabilityRaw = typeof o.availability === 'string' ? o.availability : null;
      const availability = /^https?:\/\/schema\.org\/(InStock|OutOfStock|SoldOut|PreOrder|PreSale|BackOrder|Discontinued|LimitedAvailability|OnlineOnly|InStoreOnly)$/.test(availabilityRaw || '') ? availabilityRaw : null;
      const missing = [];
      if (!offerUrl && !productUrl) missing.push('identidad_de_ficha_sin_url');
      if (price === null) missing.push('precio_contado_no_verificado');
      if (!currency) missing.push('moneda');
      if (!availability) missing.push('stock');
      offers.push({ product: typeof p.name === 'string' ? p.name : null, sku: typeof p.sku === 'string' ? p.sku : null,
        seller: typeof o.seller?.name === 'string' ? o.seller.name : null,
        price, priceRaw: raw ?? null, currency, availability, availabilityRaw,
        offerUrl: offerUrl || productUrl || null, identityStatus: offerUrl || productUrl ? 'url_matches_page' : 'unknown', sourceUrl: source, observedAt: input.observedAt,
        evidence: {type:'publisher_json_ld', independentlyVerified:false},
        missing: [...missing,'variante_y_condiciones_de_pago','envio_e_impuestos','requisitos_tecnicos'],
        status:'human_review_required', purchaseApproved:false });
    }
  }
  return { status: offers.length ? 'human_review_required' : 'no_supported_offers', offers, warnings,
    purchaseApproved:false, total:null, ranking:null, modelInvoked:false };
}
function safeUrl(value) {
  try {
    const u = new URL(value);
    const host = u.hostname.toLowerCase().replace(/\.$/, '');
    // This validates provenance labels only. NOT an SSRF guard: this module never fetches URLs.
    if (u.protocol !== 'https:' || u.username || u.password || u.port && u.port !== '443' ||
        !host.includes('.') || /[:\[\]]/.test(host) || /^\d+(\.\d+){3}$/.test(host) ||
        /(^|\.)(localhost|local|internal|test|invalid)$/.test(host)) return null;
    return u.href;
  } catch { return null; }
}
module.exports = {extractOffers};
