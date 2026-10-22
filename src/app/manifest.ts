import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TON ESPACE BEAUTÉ — Administration',
    short_name: 'Espace Beauté',
    description:
      'Gestion mobile des réservations, acomptes Wave/OM, Mode Examens et modération des avis.',
    start_url: '/admin',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#FFFFFF',
    icons: [
      {
        src: '/icon',
        sizes: '64x64',
        type: 'image/png',
      },
    ],
  };
}
