import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

async function generateClientPdfGuide() {
  const outputDir = path.resolve(process.cwd(), 'public/guides');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'Guide_Reservation_Diama_Eyelash.pdf');
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 40, left: 45, right: 45 },
    info: {
      Title: 'Guide de Réservation & Expérience Studio - Diama Eyelash',
      Author: 'Diama Eyelash Studio Dakar',
      Subject: 'Guide officiel pour les clientes : Réservation en ligne, Acompte et Entretien des Cils',
      Keywords: 'Diama Eyelash, Extensions de Cils Dakar, Réservation, Guide Cliente',
    },
  });

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  const colors = {
    primary: '#18181B', // Zinc 900
    accent: '#9D174D', // Deep Rose 800
    accentLight: '#FDF2F8', // Rose 50
    secondary: '#4B5563', // Gray 600
    gold: '#B45309', // Amber 700
    border: '#E4E4E7', // Zinc 200
    cardBg: '#FAFAFA',
  };

  // Helper pour dessiner un en-tête de section chic
  const drawSectionHeader = (title: string, yPos?: number) => {
    if (yPos) doc.y = yPos;
    doc.moveDown(0.6);
    const startY = doc.y;
    doc
      .rect(45, startY, 4, 18)
      .fill(colors.accent);
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor(colors.primary)
      .text(title.toUpperCase(), 55, startY + 2, { characterSpacing: 1 });
    doc.moveDown(0.8);
  };

  // --------------------------------------------------------------------------
  // PAGE 1 : EN-TÊTE & PRÉSENTATION HAUTE COUTURE
  // --------------------------------------------------------------------------
  // Bannière supérieure décorative
  doc.rect(0, 0, 595.28, 12).fill(colors.accent);

  doc.moveDown(0.5);
  doc
    .font('Helvetica-Bold')
    .fontSize(22)
    .fillColor(colors.primary)
    .text('DIAMA EYELASH', { align: 'center', characterSpacing: 2 });

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(colors.accent)
    .text('STUDIO PRIVÉ D’EXTENSIONS DE CILS • DAKAR', {
      align: 'center',
      characterSpacing: 1.5,
    });

  doc.moveDown(0.3);
  doc
    .font('Helvetica-Oblique')
    .fontSize(9)
    .fillColor(colors.secondary)
    .text('Guide officiel d’utilisation du site & Carnet d’accueil pour nos clientes', {
      align: 'center',
    });

  doc.moveDown(0.8);
  doc
    .moveTo(45, doc.y)
    .lineTo(550, doc.y)
    .strokeColor(colors.border)
    .lineWidth(0.8)
    .stroke();

  // Encadré de Bienvenue
  doc.moveDown(0.8);
  const welcomeY = doc.y;
  doc
    .roundedRect(45, welcomeY, 505, 55, 6)
    .fillAndStroke(colors.accentLight, colors.accent);

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(colors.accent)
    .text('BIENVENUE DANS VOTRE ESPACE BEAUTÉ EN LIGNE', 60, welcomeY + 12);

  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor(colors.primary)
    .text(
      'Découvrez la nouvelle plateforme officielle de Diama Eyelash. Vous pouvez désormais consulter en temps réel nos disponibilités, choisir votre style de pose sur-mesure, bloquer instantanément votre créneau et sécuriser votre rendez-vous 24h/24 en toute sérénité.',
      60,
      welcomeY + 26,
      { width: 475, lineGap: 2 }
    );

  doc.y = welcomeY + 68;

  // SECTION 1 : CHOISIR SA PRESTATION
  drawSectionHeader('1. Le Menu des Poses : Quelle prestation choisir ?');

  const services = [
    {
      name: 'Pose Cil à Cil',
      desc: 'Une extension appliquée sur chaque cil naturel. Effet mascara délicat, ultra-naturel et élégant pour le quotidien.',
      tag: 'Naturel & Discret',
    },
    {
      name: 'Pose Mixte (Hybride) - Nôtre Best-Seller',
      desc: 'Mélange subtil de cil à cil et de légers bouquets volume. Regard habillé, texture modulée et éclat envoûtant.',
      tag: 'Coup de Cœur',
    },
    {
      name: 'Pose Volume Russe',
      desc: 'Bouquets légers en éventail créant une frange vaporeuse, intense et glamour, sans alourdir le cil naturel.',
      tag: 'Intensité & Glamour',
    },
    {
      name: 'Pose Mega Volume',
      desc: 'Densité maximale avec des bouquets ultra-fins pour un regard noir intense et spectaculaire digne des tapis rouges.',
      tag: 'Densité Maximale',
    },
    {
      name: 'Remplissages (2 ou 3 Semaines)',
      desc: 'Indispensable pour préserver la perfection de votre pose en comblant la repousse naturelle de vos cils.',
      tag: 'Entretien Périodique',
    },
  ];

  services.forEach((s) => {
    const cardY = doc.y;
    doc
      .roundedRect(45, cardY, 505, 34, 4)
      .fillAndStroke(colors.cardBg, colors.border);

    doc
      .font('Helvetica-Bold')
      .fontSize(9.5)
      .fillColor(colors.primary)
      .text(s.name, 55, cardY + 7);

    doc
      .font('Helvetica-Bold')
      .fontSize(7.5)
      .fillColor(colors.accent)
      .text(`[ ${s.tag} ]`, 380, cardY + 8, { align: 'right', width: 155 });

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(colors.secondary)
      .text(s.desc, 55, cardY + 20, { width: 480 });

    doc.y = cardY + 38;
  });

  // SECTION 2 : LES 5 ÉTAPES DE RÉSERVATION
  doc.moveDown(0.4);
  drawSectionHeader('2. Comment réserver en 5 étapes simples sur le site');

  const steps = [
    {
      num: '01',
      title: 'Sélectionnez votre prestation',
      desc: 'Cliquez sur « Réserver cette pose » pour découvrir les détails et le tarif en vigueur.',
    },
    {
      num: '02',
      title: 'Choisissez votre date & créneau libre',
      desc: 'Le calendrier affiche en direct les créneaux réels disponibles. Zéro double réservation possible.',
    },
    {
      num: '03',
      title: 'Renseignez vos coordonnées',
      desc: 'Indiquez votre nom, votre numéro WhatsApp actif et votre compte Instagram pour le suivi.',
    },
    {
      num: '04',
      title: 'Verrouillage immédiat (2 heures)',
      desc: 'Votre créneau est temporairement bloqué pendant 2h pour vous permettre de régler l’acompte.',
    },
    {
      num: '05',
      title: 'Validation de l’Acompte & Confirmation',
      desc: 'Envoyez votre preuve de paiement par WhatsApp. Votre rendez-vous est alors confirmé avec l’adresse exacte.',
    },
  ];

  steps.forEach((step) => {
    const stepY = doc.y;
    doc.circle(58, stepY + 8, 9).fill(colors.accent);
    doc
      .font('Helvetica-Bold')
      .fontSize(7.5)
      .fillColor('#FFFFFF')
      .text(step.num, 51, stepY + 5, { width: 14, align: 'center' });

    doc
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .fillColor(colors.primary)
      .text(step.title, 75, stepY + 2);

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(colors.secondary)
      .text(step.desc, 75, stepY + 13, { width: 470 });

    doc.y = stepY + 26;
  });

  // --------------------------------------------------------------------------
  // PAGE 2 : PAIEMENT SÉCURISÉ, CHARTE DU STUDIO & ENTRETIEN (AFTERCARE)
  // --------------------------------------------------------------------------
  doc.addPage();

  // Bannière supérieure
  doc.rect(0, 0, 595.28, 8).fill(colors.accent);

  // SECTION 3 : RÈGLEMENT DE L'ACOMPTE OBLIGATOIRE
  doc.y = 35;
  drawSectionHeader('3. Règlement de l’Acompte Obligatoire & Moyens de Paiement');

  const depositY = doc.y;
  doc
    .roundedRect(45, depositY, 505, 80, 6)
    .fillAndStroke('#FEF3C7', colors.gold); // Amber light

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(colors.gold)
    .text('POURQUOI L’ACOMPTE EST-IL STRICTEMENT OBLIGATOIRE ?', 60, depositY + 10);

  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor(colors.primary)
    .text(
      'Chaque pose d’extension demande entre 1h30 et 3h de travail méticuleux et monopolise un créneau exclusif dans notre studio privé. L’acompte (indiqué pour chaque prestation) confirme formellement votre engagement et bloque définitivement le temps qui vous est dédié. Sans acompte dans les 2 heures suivant la réservation en ligne, le créneau est automatiquement libéré pour d’autres clientes.',
      60,
      depositY + 25,
      { width: 475, lineGap: 2 }
    );

  doc.y = depositY + 92;

  // Box Numéros Wave & Orange Money
  const payCardY = doc.y;
  doc
    .roundedRect(45, payCardY, 505, 60, 6)
    .fillAndStroke(colors.cardBg, colors.border);

  doc
    .font('Helvetica-Bold')
    .fontSize(9.5)
    .fillColor(colors.primary)
    .text('NUMÉRO OFFICIEL POUR LE TRANSFERT D’ACOMPTE (WAVE & ORANGE MONEY)', 60, payCardY + 10);

  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor(colors.accent)
    .text('+221 77 395 69 66', 60, payCardY + 25);

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor(colors.secondary)
    .text(
      'Après avoir effectué votre transfert Wave ou Orange Money, cliquez sur le bouton WhatsApp sur la page de confirmation du site pour envoyer la capture d’écran de votre transaction.',
      60,
      payCardY + 44,
      { width: 475 }
    );

  doc.y = payCardY + 70;

  // SECTION 4 : CHARTE DE SAVOIR-VIVRE & CONDITIONS DU STUDIO
  drawSectionHeader('4. Charte d’Accueil & Ponctualité au Studio');

  const rules = [
    {
      title: 'Ponctualité stricte (Tolérance max : 15 minutes)',
      desc: 'Tout retard de plus de 15 minutes entraîne l’annulation du rendez-vous sans remboursement de l’acompte, afin de ne pas pénaliser les clientes suivantes.',
    },
    {
      title: 'Studio privé : Rendez-vous strictement individuel',
      desc: 'Pour des raisons de confort, de calme et d’hygiène, aucun accompagnant, enfant ou animal de compagnie n’est accepté en cabine.',
    },
    {
      title: 'Modification & Report de rendez-vous',
      desc: 'Tout report doit être signalé sur WhatsApp au moins 24 heures à l’avance pour conserver la validité de votre acompte.',
    },
  ];

  rules.forEach((r) => {
    const ry = doc.y;
    doc
      .roundedRect(45, ry, 505, 30, 4)
      .fillAndStroke(colors.cardBg, colors.border);

    doc
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .fillColor(colors.primary)
      .text(`• ${r.title}`, 55, ry + 6);

    doc
      .font('Helvetica')
      .fontSize(7.8)
      .fillColor(colors.secondary)
      .text(r.desc, 65, ry + 17, { width: 470 });

    doc.y = ry + 34;
  });

  // SECTION 5 : PRÉPARATION & ENTRETIEN (AFTERCARE)
  doc.moveDown(0.3);
  drawSectionHeader('5. Carnet d’Entretien : Conserver vos cils 3 à 4 semaines');

  const careColsY = doc.y;

  // Colonne Gauche : Avant le Rendez-vous
  doc
    .roundedRect(45, careColsY, 245, 110, 6)
    .fillAndStroke(colors.cardBg, colors.border);

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(colors.accent)
    .text('AVANT LE RENDEZ-VOUS', 55, careColsY + 10);

  const beforeItems = [
    'Arriver les yeux parfaitement démaquillés.',
    'Ne pas appliquer de mascara dans les 48h précédentes.',
    'Éviter toute crème ou huile sur le contour des yeux.',
    'Retirer vos lentilles de contact avant la pose.',
  ];

  let bY = careColsY + 26;
  beforeItems.forEach((item) => {
    doc
      .font('Helvetica')
      .fontSize(7.8)
      .fillColor(colors.primary)
      .text(`✔ ${item}`, 55, bY, { width: 225 });
    bY += 19;
  });

  // Colonne Droite : Après la Pose (Aftercare)
  doc
    .roundedRect(305, careColsY, 245, 110, 6)
    .fillAndStroke(colors.cardBg, colors.border);

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(colors.accent)
    .text('APRÈS LA POSE (RÈGLES D’OR)', 315, careColsY + 10);

  const afterItems = [
    'Éviter l’eau, hammam et sauna pendant 24 heures.',
    'Brosser délicatement vos cils 1 fois par jour avec le goupillon offert.',
    'Bannir tout démaquillant biphasé ou corps gras (huile).',
    'Ne jamais tirer sur les extensions ni tenter de les arracher.',
  ];

  let aY = careColsY + 26;
  afterItems.forEach((item) => {
    doc
      .font('Helvetica')
      .fontSize(7.8)
      .fillColor(colors.primary)
      .text(`★ ${item}`, 315, aY, { width: 225 });
    aY += 19;
  });

  doc.y = careColsY + 118;

  // PIED DE PAGE & CONTACT ASSISTANCE
  const footerY = doc.y;
  doc
    .roundedRect(45, footerY, 505, 42, 6)
    .fillAndStroke(colors.accentLight, colors.accent);

  doc
    .font('Helvetica-Bold')
    .fontSize(8.5)
    .fillColor(colors.accent)
    .text('UNE QUESTION OU BESOIN D’ASSISTANCE ?', 60, footerY + 8);

  doc
    .font('Helvetica')
    .fontSize(7.8)
    .fillColor(colors.primary)
    .text(
      'Notre équipe vous répond sur WhatsApp au +221 77 395 69 66 pour tout conseil personnalisé ou assistance technique lors de votre réservation sur le site.',
      60,
      footerY + 20,
      { width: 475 }
    );

  // Fin du document
  doc.end();

  return new Promise<void>((resolve, reject) => {
    writeStream.on('finish', () => resolve());
    writeStream.on('error', (err) => reject(err));
  });
}

generateClientPdfGuide()
  .then(() => {
    console.log('PDF client guide généré avec succès dans public/guides/Guide_Reservation_Diama_Eyelash.pdf');
  })
  .catch((err) => {
    console.error('Erreur lors de la génération du PDF :', err);
    process.exit(1);
  });
