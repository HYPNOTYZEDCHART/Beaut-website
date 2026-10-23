import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

async function generateDiamaAdminGuide() {
  const outputDir = path.resolve(process.cwd(), 'public/guides');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'Guide_Officiel_Gerante_Diama.pdf');
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 35, bottom: 35, left: 40, right: 40 },
    info: {
      Title: 'Guide Officiel Gérante - Diama Eyelash Extensions',
      Author: 'Diama Eyelash Studio',
      Subject: 'Guide Pratique pour Diama : Gestion des Rendez-vous, Validation Acomptes, Mode Examens & Tarifs',
      Keywords: 'Diama Eyelash, Guide Gérante, Dakar, Admin Studio',
    },
  });

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  const colors = {
    dark: '#141213',
    primary: '#241C1E',
    accentRose: '#9E2A4B',
    accentPink: '#C47482',
    gold: '#B45309',
    goldBg: '#FEF3C7',
    green: '#15803D',
    greenBg: '#DCFCE7',
    secondary: '#524549',
    lightBg: '#FAF5F6',
    border: '#E8DADB',
    white: '#FFFFFF',
  };

  // Helper pour dessiner un en-tête de section chic
  const drawSectionHeader = (title: string, yPos?: number) => {
    if (yPos) doc.y = yPos;
    doc.moveDown(0.5);
    const startY = doc.y;
    doc.rect(40, startY, 4, 16).fill(colors.accentRose);
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor(colors.accentRose)
      .text(title.toUpperCase(), 50, startY + 2, { characterSpacing: 1 });
    doc.moveDown(0.7);
  };

  // --------------------------------------------------------------------------
  // PAGE 1 : ACCÈS ADMIN, FLUX DE RÉSERVATION & VALIDATION D'ACOMPTE
  // --------------------------------------------------------------------------
  doc.rect(0, 0, 595.28, 10).fill(colors.accentRose);

  // Titre Principal
  doc.moveDown(0.4);
  doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .fillColor(colors.primary)
    .text('DIAMA EYELASH • ESPACE GÉRANTE', { align: 'center', characterSpacing: 1.5 });

  doc
    .font('Helvetica-Bold')
    .fontSize(9.5)
    .fillColor(colors.accentPink)
    .text('GUIDE PRATIQUE DE GESTION DU STUDIO & DE LA PLATEFORME WEB', {
      align: 'center',
      characterSpacing: 1,
    });

  doc.moveDown(0.3);
  doc
    .font('Helvetica-Oblique')
    .fontSize(8.5)
    .fillColor(colors.secondary)
    .text('Tout ce que vous devez savoir pour piloter vos créneaux, vos acomptes et vos clientes en direct', {
      align: 'center',
    });

  doc.moveDown(0.6);
  doc
    .moveTo(40, doc.y)
    .lineTo(555, doc.y)
    .strokeColor(colors.border)
    .lineWidth(0.8)
    .stroke();

  // 1. BOÎTE D'ACCÈS SECRET & PIN
  doc.moveDown(0.6);
  const pinBoxY = doc.y;
  doc
    .roundedRect(40, pinBoxY, 515, 60, 6)
    .fillAndStroke(colors.goldBg, colors.gold);

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(colors.gold)
    .text('🔑 ACCÈS CONFIDENTIEL À VOTRE TABLEAU DE BORD GÉRANTE', 52, pinBoxY + 10);

  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor(colors.primary)
    .text('• Adresse de connexion : ', 52, pinBoxY + 26, { continued: true })
    .font('Helvetica-Bold')
    .text('https://votre-site.com/admin', { continued: true })
    .font('Helvetica')
    .text(' (ou raccourci écran d’accueil)');

  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor(colors.primary)
    .text('• Votre Code Secret : ', 52, pinBoxY + 41, { continued: true })
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(colors.accentRose)
    .text('##DiamassA*#', { continued: true })
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor(colors.secondary)
    .text('  (Sécurisé : verrouillage automatique après 5 tentatives échouées)');

  doc.y = pinBoxY + 68;

  // 2. CYCLE COMPLET DE RÉSERVATION (4 ÉTAPES)
  drawSectionHeader('1. Le Parcours d’une Réservation (De la prise de RDV au jour J)');

  const steps = [
    {
      num: 'Étape 1',
      title: 'La cliente réserve en ligne (Verrouillage 2h)',
      desc: 'Elle choisit sa pose et son créneau. La place est immédiatement bloquée pendant 2 heures pour empêcher qu’une autre cliente la prenne. Si aucun acompte n’est reçu sous 2h, le site libère la place tout seul.',
    },
    {
      num: 'Étape 2',
      title: 'Envoi des 5 000 FCFA d’acompte sur votre Wave',
      desc: 'Le site ouvre l’application Wave ou Max it avec votre numéro officiel (+221 77 685 21 46) pré-rempli. La cliente vous transmet ensuite sa capture d’écran avec son code de réservation par WhatsApp.',
    },
    {
      num: 'Étape 3',
      title: 'Validation en 1 clic dans votre Espace Admin',
      desc: 'Vous ouvrez /admin avec le code ##DiamassA*#. Cliquez sur « Valider l’Acompte » : un bouton WhatsApp vert vous permet d’envoyer en un clic la confirmation officielle avec l’adresse exacte du Studio (Diamalaye).',
    },
    {
      num: 'Étape 4',
      title: 'Fin de la pose & Invitation à laisser un Avis VIP',
      desc: 'Après la pose et l’encaissement du solde sur place, cliquez sur « Clôturer la prestation ». Vous pouvez lui envoyer son lien WhatsApp personnalisé pour qu’elle note sa pose 5 étoiles sur le site !',
    },
  ];

  steps.forEach((st) => {
    const sY = doc.y;
    doc
      .roundedRect(40, sY, 515, 34, 4)
      .fillAndStroke(colors.lightBg, colors.border);

    doc
      .roundedRect(46, sY + 6, 44, 14, 3)
      .fill(colors.accentRose);
    doc
      .font('Helvetica-Bold')
      .fontSize(7)
      .fillColor(colors.white)
      .text(st.num.toUpperCase(), 46, sY + 9, { width: 44, align: 'center' });

    doc
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .fillColor(colors.primary)
      .text(st.title, 98, sY + 7);

    doc
      .font('Helvetica')
      .fontSize(7.5)
      .fillColor(colors.secondary)
      .text(st.desc, 46, sY + 22, { width: 500, lineGap: 1 });

    doc.y = sY + 39;
  });

  // 3. ASTUCE INSTALLATION SMARTPHONE (PWA)
  doc.moveDown(0.2);
  const pwaY = doc.y;
  doc
    .roundedRect(40, pwaY, 515, 48, 5)
    .fillAndStroke('#F0FDF4', colors.green); // Green light

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(colors.green)
    .text('📲 COMMENT INSTALLER LE SITE COMME UNE VRAIE APPLI SUR VOTRE TÉLÉPHONE', 50, pwaY + 8);

  doc
    .font('Helvetica')
    .fontSize(7.8)
    .fillColor(colors.primary)
    .text(
      'Sur iPhone (Safari) ou Android (Chrome) : Ouvrez votre site, cliquez sur « Partager » puis sur « Ajouter à l’écran d’accueil ». Une icône dorée Diama Eyelash apparaît directement sur votre écran, accessible en 1 clic sans retaper l’adresse !',
      50,
      pwaY + 22,
      { width: 495, lineGap: 1.5 }
    );

  // --------------------------------------------------------------------------
  // PAGE 2 : MODE EXAMENS, BLOQUER UN CRÉNEAU, MODIFICATION TARIFS & PROMOS
  // --------------------------------------------------------------------------
  doc.addPage();
  doc.rect(0, 0, 595.28, 8).fill(colors.accentRose);

  doc.y = 35;
  drawSectionHeader('2. Vos Outils de Contrôle : Gérer les Imprévus & Études');

  // MODE EXAMENS BOX
  const examY = doc.y;
  doc
    .roundedRect(40, examY, 515, 66, 6)
    .fillAndStroke(colors.lightBg, colors.border);

  doc
    .font('Helvetica-Bold')
    .fontSize(9.5)
    .fillColor(colors.accentRose)
    .text('🎓 LE MODE EXAMENS (POUR VOS RÉVISIONS ET PARTIELS UNIVERSITAIRES)', 50, examY + 9);

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor(colors.primary)
    .text(
      'Vous avez des révisions ou une semaine d’examens ? Allez dans l’onglet « Examens & Planning » et activez l’interrupteur « Activer le Mode Examens ».\n' +
      '• Effet immédiat : Le site reste en ligne et sublime, mais le calendrier se met en pause avec un message doux pour vos clientes.\n' +
      '• Dès vos examens terminés : Décochez l’interrupteur, les réservations réouvrent instantanément !',
      50,
      examY + 24,
      { width: 495, lineGap: 2 }
    );

  doc.y = examY + 74;

  // FERMETURE RAPIDE D'UN CRÉNEAU (BLACKOUT)
  const blockY = doc.y;
  doc
    .roundedRect(40, blockY, 515, 68, 6)
    .fillAndStroke(colors.lightBg, colors.border);

  doc
    .font('Helvetica-Bold')
    .fontSize(9.5)
    .fillColor(colors.accentRose)
    .text('⏱ BLOQUER UN CRÉNEAU EXCEPTIONNEL (IMPRÉVU, COURS, REPOS)', 50, blockY + 9);

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor(colors.primary)
    .text(
      'Vous devez vous absenter un après-midi (ex : mardi de 14h00 à 17h00) sans toucher à vos horaires habituels ?\n' +
      '1. Allez dans « Examens & Planning » > section « Bloquer un créneau exceptionnel ».\n' +
      '2. Indiquez la Date, l’Heure de début et l’Heure de fin, puis cliquez sur « Bloquer ce créneau ».\n' +
      '3. Résultat : Ces heures disparaissent aussitôt du site public. Un clic sur la poubelle rouge les réouvre dès que vous êtes libre.',
      50,
      blockY + 24,
      { width: 495, lineGap: 2 }
    );

  doc.y = blockY + 76;

  // SECTION GESTION DES TARIFS & PROMOS
  drawSectionHeader('3. Tarifs, Mode Promo Globale & Avis Clientes');

  const promoCardsY = doc.y;

  // Colonne Gauche : Tarifs & Promo Flash
  doc
    .roundedRect(40, promoCardsY, 252, 105, 6)
    .fillAndStroke(colors.lightBg, colors.border);

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(colors.accentRose)
    .text('TARIFS & PROMO FLASH', 50, promoCardsY + 9);

  doc
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor(colors.primary)
    .text(
      '• Changer un prix : Dans l’onglet « Tarifs », modifiez les montants en FCFA et cliquez sur Enregistrer.\n\n' +
      '• Promo Spéciale (Tabaski / Fêtes) : Activez « Activer la promo globale » et fixez un tarif unique (ex : 15 000 FCFA). Un ruban doré apparaît sur tout le site avec votre message personnalisé !',
      50,
      promoCardsY + 24,
      { width: 232, lineGap: 2 }
    );

  // Colonne Droite : Modération des Avis
  doc
    .roundedRect(302, promoCardsY, 253, 105, 6)
    .fillAndStroke(colors.lightBg, colors.border);

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(colors.accentRose)
    .text('MODÉRATION DES AVIS CLIENTES', 312, promoCardsY + 9);

  doc
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor(colors.primary)
    .text(
      '• Seules vos vraies clientes (dont vous avez clôturé la pose) reçoivent un lien d’avis unique.\n\n' +
      '• Dans l’onglet « Avis », vous visualisez les témoignages et notes 5 étoiles reçus.\n\n' +
      '• Vous pouvez approuver ou masquer un avis en 1 clic pour préserver l’excellence de votre image de marque.',
      312,
      promoCardsY + 24,
      { width: 233, lineGap: 2 }
    );

  doc.y = promoCardsY + 114;

  // RAPPEL CHARTE DU STUDIO
  drawSectionHeader('4. Vos 4 Règles d’Or pour Garder la Sérénité au Studio');

  const rules = [
    'Acompte obligatoire (5 000 FCFA) : Aucun créneau n’est garanti sans acompte. C’est votre assurance anti-lapin.',
    'Tolérance retard max 15 minutes : Passé ce délai, le rendez-vous est annulé et l’acompte est conservé.',
    'Studio Privé sans accompagnant : Pas d’ami, pas d’enfant pour travailler au calme avec une concentration maximale.',
    'Report prévenu 24h avant : La cliente peut déplacer son créneau sur WhatsApp si elle vous prévient 24h à l’avance.',
  ];

  rules.forEach((r) => {
    const rY = doc.y;
    doc
      .roundedRect(40, rY, 515, 20, 3)
      .fillAndStroke(colors.lightBg, colors.border);
    doc
      .font('Helvetica-Bold')
      .fontSize(7.8)
      .fillColor(colors.primary)
      .text(`✔ ${r}`, 50, rY + 5, { width: 495 });
    doc.y = rY + 24;
  });

  // PIED DE PAGE RÉCAPITULATIF
  doc.moveDown(0.2);
  const footerY = doc.y;
  doc
    .roundedRect(40, footerY, 515, 36, 5)
    .fillAndStroke(colors.dark, colors.dark);

  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor('#FAD2E1')
    .text('DIAMA EYELASH EXTENSIONS • STUDIO PRIVÉ DAKAR DIAMALAYE', 50, footerY + 8, {
      align: 'center',
    });

  doc
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor('#D8B4BC')
    .text('WhatsApp Officiel : +221 77 685 21 46   •   Instagram : @diamassa_   •   TikTok : @diamassa4', 50, footerY + 21, {
      align: 'center',
    });

  // Fin du document
  doc.end();

  return new Promise<void>((resolve, reject) => {
    writeStream.on('finish', () => resolve());
    writeStream.on('error', (err) => reject(err));
  });
}

generateDiamaAdminGuide()
  .then(() => {
    console.log('PDF Guide Gérante généré avec succès dans public/guides/Guide_Officiel_Gerante_Diama.pdf');
  })
  .catch((err) => {
    console.error('Erreur génération PDF Gérante :', err);
    process.exit(1);
  });
