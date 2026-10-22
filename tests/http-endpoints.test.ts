import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('HTTP ENDPOINTS & ASSETS — Audit Réseau Réel sur Serveur Localhost:3000', () => {
  const baseUrl = 'http://localhost:3000';

  const htmlRoutes = [
    { path: '/', expectedSnippet: 'TON ESPACE BEAUTÉ' },
    { path: '/reserver', expectedSnippet: 'Réservez votre créneau' },
    { path: '/prestations', expectedSnippet: 'Prestations' },
    { path: '/a-savoir', expectedSnippet: 'À savoir' },
    { path: '/avis', expectedSnippet: 'Avis' },
    { path: '/contact', expectedSnippet: 'Contact' },
    { path: '/admin', expectedSnippet: 'Espace Praticienne' },
  ];

  for (const route of htmlRoutes) {
    it(`Page ${route.path} : retourne HTTP 200 OK avec contenu HTML valide`, async () => {
      const response = await fetch(`${baseUrl}${route.path}`);
      assert.strictEqual(
        response.status,
        200,
        `La route ${route.path} doit retourner un statut HTTP 200`
      );
      const contentType = response.headers.get('content-type') ?? '';
      assert.ok(
        contentType.includes('text/html'),
        `Le content-type de ${route.path} doit être text/html`
      );
      const body = await response.text();
      assert.ok(
        body.includes(route.expectedSnippet),
        `Le contenu de ${route.path} doit contenir le texte "${route.expectedSnippet}"`
      );
    });
  }

  it('PWA & SEO : GET /manifest.webmanifest retourne un manifest JSON valide', async () => {
    const response = await fetch(`${baseUrl}/manifest.webmanifest`);
    assert.strictEqual(response.status, 200);
    const contentType = response.headers.get('content-type') ?? '';
    assert.ok(
      contentType.includes('manifest') || contentType.includes('json'),
      'Doit être un type manifest JSON'
    );
    const json = await response.json();
    assert.strictEqual(json.name, 'TON ESPACE BEAUTÉ — Extensions de Cils Dakar');
    assert.strictEqual(json.start_url, '/');
    assert.strictEqual(json.theme_color, '#FDF8F9');
  });

  it('Favicon dynamique : GET /icon retourne une image PNG générée', async () => {
    const response = await fetch(`${baseUrl}/icon`);
    assert.strictEqual(response.status, 200);
    const contentType = response.headers.get('content-type') ?? '';
    assert.ok(contentType.includes('image/png'), 'Doit retourner une image PNG');
    const buffer = await response.arrayBuffer();
    assert.ok(buffer.byteLength > 100, 'L icône doit avoir un poids binaire non vide');
  });

  const staticImages = [
    '/images/hero-studio-bg.jpg',
    '/images/studio-ambiance.jpg',
    '/images/services/cil-a-cil.jpg',
    '/images/services/pose-mixte.jpg',
    '/images/services/volume-leger.jpg',
    '/images/services/volume-intense.jpg',
    '/images/services/remplissage.jpg',
  ];

  for (const imgPath of staticImages) {
    it(`Image HD ${imgPath} : retourne HTTP 200 OK et format JPEG valide`, async () => {
      const response = await fetch(`${baseUrl}${imgPath}`);
      assert.strictEqual(
        response.status,
        200,
        `L image ${imgPath} doit être servie en HTTP 200`
      );
      const contentType = response.headers.get('content-type') ?? '';
      assert.ok(
        contentType.includes('image/jpeg') || contentType.includes('image/jpg'),
        `Le type MIME de ${imgPath} doit être JPEG`
      );
      const buffer = await response.arrayBuffer();
      assert.ok(
        buffer.byteLength > 10_000,
        `L image ${imgPath} doit avoir une taille > 10 Ko (obtenu: ${buffer.byteLength} octets)`
      );
    });
  }
});
