const PRODUCT_IMAGE_FALLBACKS = {
  tv: '/recompensas/images/tv1.jpg',
  lavar: '/recompensas/images/lavar1.jpg',
  kitferramenta: '/recompensas/images/ferramenta.jpg',
  microo: '/recompensas/images/m1.jpg',
  ar: '/recompensas/images/ar1.webp',
  geladeira: '/recompensas/images/geladeira.jpg',
  jbl01: '/recompensas/images/poco_preto.png',
  fritadeira: '/recompensas/images/f1.jpg',
  fogao: '/recompensas/images/f1_1.jpg',
  aspirador: '/recompensas/images/as1.jpg',
  sofa: '/recompensas/images/s1_2.jpg',
  jbl02: '/recompensas/images/JBL2.webp',
  'guarda-branco': '/recompensas/images/g1_1.jpg',
  'guarda-preto': '/recompensas/images/g1.jpg',
  projetor04: '/recompensas/images/1.webp',
  lilo: '/recompensas/images/1.jpg',
  ps5: '/recompensas/images/s1_1.jpg',
  sam25: '/recompensas/images/s1.jpg',
  xiaomex7: '/recompensas/images/x1.jpg',
  xiaome: '/recompensas/images/x1_1.jpg',
  xiaomex6: '/recompensas/images/x1_2.jpg',
  'iphone16-preto': '/recompensas/images/iphon1.jpg',
  iph09: '/recompensas/images/iphone_15_pro_titanio.jpg',
  iph08: '/recompensas/images/iphone_15_pro_max_titanio_preto.jpg',
  iph07: '/recompensas/images/iphone_15_rosa.jpg',
  iph06: '/recompensas/images/iphone_15_pro_max_titanio_branco.jpg'
};

const INDEXDABD_REDIRECTS = {
  aspirador: true,
  ar: true,
  fogao: true,
  fritadeira: true,
  geladeira: true,
  'guarda-branco': true,
  'guarda-preto': true,
  jbl01: true,
  jbl02: true,
  kitferramenta: true,
  lavar: true,
  lilo: true,
  microo: true,
  projetor04: true,
  ps5: true,
  sam25: true,
  sofa: true,
  xiaome: true,
  xiaomex6: true,
  xiaomex7: true
};

function parseProdutoIdFromPath(pathname) {
  const match = pathname.match(/^\/produtos\/([^/]+)\/index\.html\/images\//i);
  return match ? match[1] : null;
}

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (requestUrl.pathname.startsWith('/cdn.utmify.com.br/')) {
    const targetUrl = `https://cdn.utmify.com.br${requestUrl.pathname.slice('/cdn.utmify.com.br'.length)}${requestUrl.search}`;
    event.respondWith(fetch(new Request(targetUrl, { mode: 'no-cors' })));
    return;
  }

  if (requestUrl.pathname.startsWith('/connect.facebook.net/')) {
    const targetUrl = `https://connect.facebook.net${requestUrl.pathname.slice('/connect.facebook.net'.length)}${requestUrl.search}`;
    event.respondWith(fetch(new Request(targetUrl, { mode: 'no-cors' })));
    return;
  }

  const cartScriptMatch = requestUrl.pathname.match(/^\/produtos\/[^/]+\/index\.html\/js\/cart\.(js|html)$/i);
  if (cartScriptMatch) {
    event.respondWith(
      fetch(new Request('/checkout/js/cart.js', {
        method: 'GET',
        cache: 'no-cache',
        redirect: 'follow',
        credentials: 'same-origin'
      }))
    );
    return;
  }

  if (event.request.mode === 'navigate') {
    const navInnerMatch = requestUrl.pathname.match(/^\/produtos\/([^/]+)\/index\.html\/index\.html$/i);
    if (navInnerMatch) {
      const produtoId = navInnerMatch[1];
      if (INDEXDABD_REDIRECTS[produtoId]) {
        event.respondWith(
          Response.redirect(
            `/produtos/${produtoId}/index.html/indexdabd.html${requestUrl.search}`,
            302
          )
        );
        return;
      }
    }

    const navMatch = requestUrl.pathname.match(/^\/produtos\/([^/]+)\/index\.html\/?$/i);
    if (navMatch) {
      const produtoId = navMatch[1];
      if (INDEXDABD_REDIRECTS[produtoId]) {
        event.respondWith(
          Response.redirect(
            `/produtos/${produtoId}/index.html/indexdabd.html${requestUrl.search}`,
            302
          )
        );
        return;
      }
    }
  }

  if (!requestUrl.pathname.startsWith('/produtos/')) return;
  if (!requestUrl.pathname.includes('/index.html/images/')) return;

  const produtoId = parseProdutoIdFromPath(requestUrl.pathname);
  if (!produtoId) return;

  const lastSegment = requestUrl.pathname.split('/').pop() || '';
  const lowerLast = lastSegment.toLowerCase();

  const shouldOverride =
    lowerLast.endsWith('.html') ||
    lowerLast === 'favicon.html' ||
    lowerLast === 'logo.html' ||
    lowerLast === 'favicon.htm' ||
    lowerLast === 'logo.htm';

  if (!shouldOverride) return;

  const targetPath =
    lowerLast.startsWith('favicon.') ? '/recompensas/images/favicon.png'
    : lowerLast.startsWith('logo.') ? '/recompensas/images/logo.webp'
    : PRODUCT_IMAGE_FALLBACKS[produtoId];

  if (!targetPath) return;

  event.respondWith(
    fetch(new Request(targetPath, {
      method: 'GET',
      headers: event.request.headers,
      cache: 'no-cache',
      redirect: 'follow',
      credentials: 'same-origin'
    }))
  );
});
