import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';

/**
 * Sonde rapidement si le serveur Next.js écoute sur localhost:3000
 */
async function isLocalServerListening(port = 3000, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const finish = (result: boolean) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(300);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
    socket.connect(port, host);
  });
}

describe('HTTP ENDPOINTS & ASSETS — Audit Réseau Réel sur Serveur Localhost:3000', async () => {
  const baseUrl = 'http://localhost:3000';
  const serverRunning = await isLocalServerListening(3000);

  const htmlRoutes = [
    { path: '/', expectedSnippet: 'DIAMA EYELASH EXTENSIONS' },
    { path: '/reserver', expectedSnippet: 'Réservez votre créneau' },
    { path: '/prestations', expectedSnippet: 'Prestations' },
    { path: '/a-savoir', expectedSnippet: 'À savoir' },
    { path: '/avis', expectedSnippet: 'Avis' },
    { path: '/contact', expectedSnippet: 'Contact' },
    { path: '/admin', expectedSnippet: 'Espace Praticienne' },
  ];

  for (const route of htmlRoutes) {
    it(`Page ${route.path} : retourne HTTP 200 OK avec contenu HTML valide`, async (t) => {
      if (!serverRunning) {
        t.skip('Serveur localhost:3000 non démarré (test réseau ignoré)');
        return;
      }
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

  it('PWA & SEO : GET /manifest.webmanifest retourne un manifest JSON valide', async (t) => {
    if (!serverRunning) {
      t.skip('Serveur localhost:3000 non démarré (test réseau ignoré)');
      return;
    }
    const response = await fetch(`${baseUrl}/manifest.webmanifest`);
    assert.strictEqual(response.status, 200);
    const contentType = response.headers.get('content-type') ?? '';
    assert.ok(
      contentType.includes('manifest') || contentType.includes('json'),
      'Doit être un type manifest JSON'
    );
    const json = await response.json();
    assert.strictEqual(json.name, 'DIAMA EYELASH EXTENSIONS — Dakar');
    assert.strictEqual(json.start_url, '/');
    assert.strictEqual(json.theme_color, '#FDF8F9');
  });

  it('Favicon dynamique : GET /icon retourne une image PNG générée', async (t) => {
    if (!serverRunning) {
      t.skip('Serveur localhost:3000 non démarré (test réseau ignoré)');
      return;
    }
    const response = await fetch(`${baseUrl}/icon`);
    assert.strictEqual(response.status, 200);
    const contentType = response.headers.get('content-type') ?? '';
    assert.ok(contentType.includes('image/png'), 'Doit retourner une image PNG');
    const buffer = await response.arrayBuffer();
    assert.ok(buffer.byteLength > 100, 'L icône doit avoir un poids binaire non vide');
  });

  const staticImages = [
    '/images/diama-logo.jpg',
    '/images/hero-studio-bg.jpg',
    '/images/studio-ambiance.jpg',
    '/images/services/cil-a-cil.jpg',
    '/images/services/pose-mixte.jpg',
    '/images/services/volume-leger.jpg',
    '/images/services/volume-intense.jpg',
    '/images/services/remplissage.jpg',
    '/images/aftercare-guide.jpg',
  ];

  for (const imgPath of staticImages) {
    it(`Image HD ${imgPath} : retourne HTTP 200 OK et format JPEG valide`, async (t) => {
      if (!serverRunning) {
        t.skip('Serveur localhost:3000 non démarré (test réseau ignoré)');
        return;
      }
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
