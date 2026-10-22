import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TON ESPACE BEAUTÉ — Extensions de Cils Dakar',
    short_name: 'Espace Beauté',
    description:
      'Réservation d’extensions de cils sur-mesure à Dakar. Choix de prestation, créneaux en direct et acompte sécurisé Wave / Orange Money.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FDF8F9',
    theme_color: '#FDF8F9',
    icons: [
      {
        src: '/icon',
        sizes: '64x64',
        type: 'image/png',
      },
    ],
  };
}
