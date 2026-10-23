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
    margins: { top: 35, bottom: 35, left: 40, right: 40 },
    info: {
      Title: 'Guide de Réservation & Expérience Studio - Diama Eyelash',
      Author: 'Diama Eyelash Studio Dakar',
      Subject: 'Guide officiel pour les clientes : Réservation en ligne, Acompte Wave/Max it et Entretien des Cils',
      Keywords: 'Diama Eyelash, Extensions de Cils Dakar, Réservation, Guide Cliente, Wave, Max it',
    },
  });

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  const colors = {
    dark: '#141213',
    primary: '#241C1E',
    accent: '#9E2A4B',
    accentLight: '#FDF2F8',
    secondary: '#5C4E52',
    gold: '#B45309',
    goldLight: '#FEF3C7',
    border: '#E8DADB',
    cardBg: '#FAFAFA',
    white: '#FFFFFF',
  };

  const waveLogoPath = path.resolve(process.cwd(), 'public/images/wave-logo.png');
  const maxitLogoPath = path.resolve(process.cwd(), 'public/images/maxit-logo.png');

  // Helper pour dessiner un en-tête de section chic
  const drawSectionHeader = (title: string, yPos?: number) => {
    if (yPos) doc.y = yPos;
    doc.moveDown(0.5);
    const startY = doc.y;
    doc.rect(40, startY, 4, 16).fill(colors.accent);
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor(colors.accent)
      .text(title.toUpperCase(), 50, startY + 2, { characterSpacing: 1 });
    doc.moveDown(0.7);
  };

  // --------------------------------------------------------------------------
  // PAGE 1 : EN-TÊTE, TARIFS OFFICIELS & ÉTAPES DE RÉSERVATION
  // --------------------------------------------------------------------------
  doc.rect(0, 0, 595.28, 10).fill(colors.accent);

  doc.moveDown(0.4);
  doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .fillColor(colors.primary)
    .text('DIAMA EYELASH EXTENSIONS', { align: 'center', characterSpacing: 2 });

  doc
    .font('Helvetica')
    .fontSize(9.5)
    .fillColor(colors.accent)
    .text('STUDIO PRIVÉ HAUTE COUTURE • DAKAR DIAMALAYE', {
      align: 'center',
      characterSpacing: 1.5,
    });

  doc.moveDown(0.2);
  doc
    .font('Helvetica-Oblique')
    .fontSize(8.5)
    .fillColor(colors.secondary)
    .text('Guide officiel d’utilisation du site & Carnet d’accueil pour nos clientes', {
      align: 'center',
    });

  doc.moveDown(0.5);
  doc
    .moveTo(40, doc.y)
    .lineTo(555, doc.y)
    .strokeColor(colors.border)
    .lineWidth(0.8)
    .stroke();

  // Encadré de Bienvenue
  doc.moveDown(0.5);
  const welcomeY = doc.y;
  doc
    .roundedRect(40, welcomeY, 515, 48, 6)
    .fillAndStroke(colors.accentLight, colors.accent);

  doc
    .font('Helvetica-Bold')
    .fontSize(9.5)
    .fillColor(colors.accent)
    .text('BIENVENUE DANS VOTRE ESPACE BEAUTÉ EN LIGNE', 52, welcomeY + 9);

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor(colors.primary)
    .text(
      'Découvrez la plateforme officielle de Diama Eyelash. Vous pouvez désormais consulter en temps réel mes créneaux disponibles, choisir votre modèle de pose sur-mesure, bloquer instantanément votre rendez-vous et sécuriser votre créneau 24h/24 en toute sérénité.',
      52,
      welcomeY + 22,
      { width: 490, lineGap: 1.5 }
    );

  doc.y = welcomeY + 58;

  // SECTION 1 : MENU DES POSES & TARIFS OFFICIELS
  drawSectionHeader('1. Le Menu des Poses : Tarifs & Acomptes en direct');

  const services = [
    {
      name: 'Pose Cil à Cil',
      price: '15 000 FCFA',
      deposit: '5 000 FCFA',
      desc: 'Une extension sur chaque cil naturel. Effet mascara délicat, ultra-naturel et raffiné.',
      tag: 'Naturel & Discret',
    },
    {
      name: 'Pose Mixte (Hybride) — Best-Seller',
      price: '16 000 FCFA',
      deposit: '5 000 FCFA',
      desc: 'Mélange subtil de cil à cil et bouquets vaporeux. Regard habillé, texture et éclat envoûtant.',
      tag: 'Coup de Cœur',
    },
    {
      name: 'Pose Volume Léger (Volume Russe)',
      price: '17 000 FCFA',
      deposit: '5 000 FCFA',
      desc: 'Bouquets en éventail soyeux créant une frange dense et glamour, sans alourdir le cil naturel.',
      tag: 'Intensité & Glamour',
    },
    {
      name: 'Pose Volume Intense (Mega Volume)',
      price: '18 000 FCFA',
      deposit: '5 000 FCFA',
      desc: 'Densité maximale avec des bouquets ultra-fins pour un regard noir intense et spectaculaire.',
      tag: 'Densité Maximale',
    },
    {
      name: 'Remplissage (2 ou 3 Semaines)',
      price: '10 000 FCFA',
      deposit: '5 000 FCFA',
      desc: 'Idéal pour préserver la perfection de votre pose en comblant la repousse naturelle de vos cils.',
      tag: 'Entretien Périodique',
    },
  ];

  services.forEach((s) => {
    const cardY = doc.y;
    doc
      .roundedRect(40, cardY, 515, 33, 4)
      .fillAndStroke(colors.cardBg, colors.border);

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(colors.primary)
      .text(s.name, 50, cardY + 6);

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(colors.accent)
      .text(`${s.price}  (Acompte ${s.deposit})`, 330, cardY + 6, { align: 'right', width: 215 });

    doc
      .font('Helvetica')
      .fontSize(7.5)
      .fillColor(colors.secondary)
      .text(s.desc, 50, cardY + 19, { width: 495 });

    doc.y = cardY + 38;
  });

  // SECTION 2 : COMMENT RÉSERVER EN 5 ÉTAPES
  doc.moveDown(0.2);
  drawSectionHeader('2. Comment Réserver en 5 Étapes Simples sur le Site');

  const steps = [
    {
      num: '01',
      title: 'Sélectionnez votre pose',
      desc: 'Cliquez sur « Réserver cette pose » pour découvrir les détails, la durée et le tarif officiel.',
    },
    {
      num: '02',
      title: 'Choisissez votre date & créneau libre',
      desc: 'Le calendrier affiche en direct mes créneaux réels disponibles. Zéro double réservation possible.',
    },
    {
      num: '03',
      title: 'Renseignez vos coordonnées',
      desc: 'Indiquez votre nom, votre numéro WhatsApp actif et votre compte Instagram pour le suivi VIP.',
    },
    {
      num: '04',
      title: 'Verrouillage immédiat (2 heures)',
      desc: 'Votre créneau est temporairement bloqué pendant 2h pour vous permettre de régler votre acompte.',
    },
    {
      num: '05',
      title: 'Validation de l’Acompte & Confirmation WhatsApp',
      desc: 'Ouvrez Wave ou Max it en 1 clic sur le site, puis transmettez votre preuve par WhatsApp.',
    },
  ];

  steps.forEach((step) => {
    const stepY = doc.y;
    doc.circle(52, stepY + 8, 8).fill(colors.accent);
    doc
      .font('Helvetica-Bold')
      .fontSize(7.5)
      .fillColor('#FFFFFF')
      .text(step.num, 45, stepY + 5, { width: 14, align: 'center' });

    doc
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .fillColor(colors.primary)
      .text(step.title, 68, stepY + 2);

    doc
      .font('Helvetica')
      .fontSize(7.5)
      .fillColor(colors.secondary)
      .text(step.desc, 68, stepY + 13, { width: 475 });

    doc.y = stepY + 25;
  });

  // --------------------------------------------------------------------------
  // PAGE 2 : ACOMPTE WAVE & MAX IT (AVEC VRAIS LOGOS), CHARTE & AFTERCARE
  // --------------------------------------------------------------------------
  doc.addPage();
  doc.rect(0, 0, 595.28, 8).fill(colors.accent);

  doc.y = 35;
  drawSectionHeader('3. Règlement Sécurisé de l’Acompte (Wave & Max it)');

  // Box Explication Acompte
  const depositY = doc.y;
  doc
    .roundedRect(40, depositY, 515, 68, 6)
    .fillAndStroke(colors.goldLight, colors.gold);

  doc
    .font('Helvetica-Bold')
    .fontSize(9.5)
    .fillColor(colors.gold)
    .text('POURQUOI L’ACOMPTE DE 5 000 FCFA EST STRICTEMENT OBLIGATOIRE ?', 52, depositY + 8);

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor(colors.primary)
    .text(
      'Chaque pose d’extension demande entre 1h30 et 3h de minutie et monopolise un créneau exclusif dans notre studio privé. L’acompte de 5 000 FCFA confirme formellement votre engagement et bloque définitivement le temps qui vous est réservé.\n\n' +
      '• Cet acompte est intégralement déduit du solde total à régler sur place après votre pose.\n' +
      '• Sans acompte dans les 2 heures suivant votre réservation en ligne, le créneau est automatiquement libéré.',
      52,
      depositY + 22,
      { width: 495, lineGap: 1.5 }
    );

  doc.y = depositY + 76;

  // Box Numéro Officiel avec VRAIS LOGOS Wave et Max it
  const payCardY = doc.y;
  doc
    .roundedRect(40, payCardY, 515, 68, 6)
    .fillAndStroke(colors.cardBg, colors.border);

  // Insertion des vraies images d'application Wave et Max it
  if (fs.existsSync(waveLogoPath)) {
    doc.image(waveLogoPath, 52, payCardY + 14, { width: 38 });
  }
  if (fs.existsSync(maxitLogoPath)) {
    doc.image(maxitLogoPath, 98, payCardY + 14, { width: 38 });
  }

  doc
    .font('Helvetica-Bold')
    .fontSize(9.5)
    .fillColor(colors.primary)
    .text('NUMÉRO OFFICIEL POUR LE TRANSFERT (WAVE & MAX IT)', 150, payCardY + 12);

  doc
    .font('Helvetica-Bold')
    .fontSize(15)
    .fillColor(colors.accent)
    .text('+221 77 685 21 46', 150, payCardY + 26);

  doc
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor(colors.secondary)
    .text(
      'Sur le site mobile, cliquez sur « Ouvrir l’application Wave » ou « Ouvrir Max it » pour copier le numéro et ouvrir directement votre application. Ensuite, cliquez sur WhatsApp pour envoyer votre capture d’écran avec votre référence unique.',
      150,
      payCardY + 45,
      { width: 395, lineGap: 1 }
    );

  doc.y = payCardY + 76;

  // SECTION 4 : CHARTE D'ACCUEIL & PONCTUALITÉ
  drawSectionHeader('4. Charte d’Accueil & Ponctualité au Studio Privé');

  const rules = [
    {
      title: 'Ponctualité stricte (Tolérance max : 15 minutes)',
      desc: 'Tout retard supérieur à 15 minutes entraîne l’annulation du rendez-vous sans remboursement de l’acompte, pour ne pas pénaliser la cliente suivante.',
    },
    {
      title: 'Studio privé : Rendez-vous strictement individuel',
      desc: 'Pour des raisons de calme, de confort et d’hygiène, aucun accompagnant, enfant ou ami n’est accepté en cabine de pose.',
    },
    {
      title: 'Modification & Report de rendez-vous',
      desc: 'Tout report doit être signalé sur WhatsApp au moins 24 heures à l’avance pour conserver la validité intégrale de votre acompte.',
    },
  ];

  rules.forEach((r) => {
    const ry = doc.y;
    doc
      .roundedRect(40, ry, 515, 28, 4)
      .fillAndStroke(colors.cardBg, colors.border);

    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor(colors.primary)
      .text(`• ${r.title}`, 48, ry + 5);

    doc
      .font('Helvetica')
      .fontSize(7.2)
      .fillColor(colors.secondary)
      .text(r.desc, 56, ry + 16, { width: 485 });

    doc.y = ry + 32;
  });

  // SECTION 5 : PRÉPARATION & ENTRETIEN (AFTERCARE)
  doc.moveDown(0.2);
  drawSectionHeader('5. Carnet d’Entretien : Conserver vos cils 3 à 4 semaines');

  const careColsY = doc.y;

  // Colonne Gauche : Avant le Rendez-vous
  doc
    .roundedRect(40, careColsY, 252, 95, 6)
    .fillAndStroke(colors.cardBg, colors.border);

  doc
    .font('Helvetica-Bold')
    .fontSize(8.5)
    .fillColor(colors.accent)
    .text('AVANT LE RENDEZ-VOUS', 50, careColsY + 8);

  const beforeItems = [
    'Arriver les yeux parfaitement démaquillés.',
    'Ne pas appliquer de mascara dans les 48h précédentes.',
    'Éviter toute crème ou huile sur le contour des yeux.',
    'Retirer vos lentilles de contact avant la pose.',
  ];

  let bY = careColsY + 22;
  beforeItems.forEach((item) => {
    doc
      .font('Helvetica')
      .fontSize(7.5)
      .fillColor(colors.primary)
      .text(`✔ ${item}`, 50, bY, { width: 232 });
    bY += 17;
  });

  // Colonne Droite : Après la Pose (Aftercare)
  doc
    .roundedRect(302, careColsY, 253, 95, 6)
    .fillAndStroke(colors.cardBg, colors.border);

  doc
    .font('Helvetica-Bold')
    .fontSize(8.5)
    .fillColor(colors.accent)
    .text('APRÈS LA POSE (RÈGLES D’OR)', 312, careColsY + 8);

  const afterItems = [
    'Éviter l’eau, hammam et sauna pendant 24 heures.',
    'Brosser délicatement vos cils 1 fois/jour avec le goupillon.',
    'Bannir tout démaquillant biphasé ou huile sur les yeux.',
    'Ne jamais tirer sur les extensions ni les arracher.',
  ];

  let aY = careColsY + 22;
  afterItems.forEach((item) => {
    doc
      .font('Helvetica')
      .fontSize(7.5)
      .fillColor(colors.primary)
      .text(`★ ${item}`, 312, aY, { width: 233 });
    aY += 17;
  });

  doc.y = careColsY + 102;

  // PIED DE PAGE & CONTACT OFFICIEL
  const footerY = doc.y;
  doc
    .roundedRect(40, footerY, 515, 38, 6)
    .fillAndStroke(colors.accentLight, colors.accent);

  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor(colors.accent)
    .text('DIAMA EYELASH EXTENSIONS • STUDIO PRIVÉ DAKAR DIAMALAYE', 50, footerY + 8, {
      align: 'center',
    });

  doc
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor(colors.primary)
    .text(
      'WhatsApp Officiel : +221 77 685 21 46   •   Instagram : @diamassa_   •   TikTok : @diamassa4',
      50,
      footerY + 21,
      { align: 'center' }
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
    console.log('PDF Guide Réservation Cliente généré avec succès dans public/guides/Guide_Reservation_Diama_Eyelash.pdf');
  })
  .catch((err) => {
    console.error('Erreur lors de la génération du PDF :', err);
    process.exit(1);
  });
