const FRONTEND = process.env.FRONTEND_URL || 'https://etutorat.sn';

// ─── Layout de base ────────────────────────────────────────────────────────────
function base({ title, content }) {
  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${title}</title>
  <style>
    body,html{margin:0;padding:0;background:#FFFDF5;font-family:Arial,Helvetica,sans-serif;}
    a{color:#F97316;text-decoration:none;}
    @media only screen and (max-width:600px){
      .card{border-radius:0!important;}
      .pad{padding:28px 20px!important;}
      .btn{padding:14px 28px!important;font-size:0.95rem!important;}
    }
  </style>
</head>
<body>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFDF5;min-height:100vh;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table class="card" width="100%" cellpadding="0" cellspacing="0"
        style="max-width:560px;background:#FFFFFF;border-radius:20px;overflow:hidden;
               box-shadow:0 4px 32px rgba(62,42,31,0.09);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#F97316 0%,#FBBF24 100%);
                     padding:28px 40px;text-align:center;">
            <img src="https://e-tutorat.vercel.app/logo.png" alt="e-Tutorat Sénégal"
                 width="64" height="64"
                 style="display:block;margin:0 auto 10px;border-radius:14px;
                        box-shadow:0 2px 12px rgba(0,0,0,0.18);" />
            <div style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">
              e-Tutorat Sénégal
            </div>
            <div style="font-size:11px;color:rgba(255,255,255,0.82);
                        letter-spacing:3px;text-transform:uppercase;margin-top:4px;">
              Le tutorat de qualité 🇸🇳
            </div>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td class="pad" style="padding:40px 40px 32px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#FEF3C7;padding:20px 40px;text-align:center;
                     border-top:1px solid #E9D5A0;">
            <p style="margin:0;color:#9CA3AF;font-size:12px;line-height:1.7;">
              © 2026 e-Tutorat Sénégal &nbsp;·&nbsp;
              <a href="${FRONTEND}" style="color:#F97316;">etutorat.sn</a> &nbsp;·&nbsp;
              <a href="${FRONTEND}?legal=privacy" style="color:#F97316;">Confidentialité</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// ─── Composant bouton CTA ───────────────────────────────────────────────────────
function btn(label, url) {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0;">
  <tr>
    <td align="center">
      <a class="btn" href="${url}"
        style="display:inline-block;background:#F97316;color:#fff;font-weight:800;
               font-size:1rem;text-decoration:none;padding:16px 40px;border-radius:100px;
               box-shadow:0 8px 20px rgba(249,115,22,0.32);font-family:Arial,sans-serif;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

// ─── Composant boîte info ───────────────────────────────────────────────────────
function infoBox(text, color = '#FEF3C7', textColor = '#92400E') {
  return `
<div style="background:${color};border-radius:12px;padding:16px 20px;margin:20px 0 0;">
  <p style="margin:0;color:${textColor};font-size:14px;line-height:1.7;">${text}</p>
</div>`;
}

// ─── 1. Email de bienvenue ──────────────────────────────────────────────────────
function welcomeEmail({ prenom, role }) {
  const isTuteur = role === 'TUTEUR';
  const steps = isTuteur
    ? ['Vérifiez votre adresse email', 'Complétez votre profil tuteur', 'Ajoutez vos matières et tarifs', 'Attendez vos premières demandes']
    : ['Vérifiez votre adresse email', 'Explorez les tuteurs disponibles', 'Envoyez votre première demande de cours', 'Choisissez en ligne ou à domicile'];

  return base({
    title: `Bienvenue sur e-Tutorat, ${prenom} !`,
    content: `
<div style="text-align:center;margin-bottom:28px;">
  <div style="font-size:52px;margin-bottom:12px;">${isTuteur ? '🎓' : '📖'}</div>
  <h1 style="margin:0 0 6px;color:#3E2A1F;font-size:26px;font-weight:800;font-family:Georgia,serif;">
    Bienvenue, ${prenom} !
  </h1>
  <p style="margin:0;color:#6B7280;font-size:15px;">
    Votre compte ${isTuteur ? 'tuteur' : 'élève'} est prêt
  </p>
</div>

<p style="color:#524036;line-height:1.75;font-size:15px;margin:0 0 24px;">
  Nous sommes ravis de vous accueillir sur <strong>e-Tutorat Sénégal</strong>.
  ${isTuteur
    ? 'Complétez votre profil pour être visible par des milliers d\'élèves au Sénégal.'
    : 'Explorez nos tuteurs qualifiés et réservez votre première séance dès aujourd\'hui.'}
</p>

<div style="background:#FEF3C7;border-radius:14px;padding:20px 24px;margin:0 0 28px;">
  <p style="margin:0 0 12px;color:#3E2A1F;font-weight:800;font-size:14px;">✨ Pour bien démarrer :</p>
  <ol style="margin:0;padding-left:20px;color:#524036;font-size:14px;line-height:2;">
    ${steps.map(s => `<li>${s}</li>`).join('')}
  </ol>
</div>

${btn('🚀 Accéder à mon tableau de bord', FRONTEND)}
`,
  });
}

// ─── 2. Vérification d'email ────────────────────────────────────────────────────
function verifyEmail({ prenom, url }) {
  return base({
    title: 'Vérifiez votre adresse email — e-Tutorat',
    content: `
<div style="text-align:center;margin-bottom:28px;">
  <div style="font-size:52px;margin-bottom:12px;">📧</div>
  <h1 style="margin:0 0 6px;color:#3E2A1F;font-size:26px;font-weight:800;font-family:Georgia,serif;">
    Vérifiez votre email
  </h1>
  <p style="margin:0;color:#6B7280;font-size:15px;">Un clic pour activer votre compte</p>
</div>

<p style="color:#524036;line-height:1.75;font-size:15px;margin:0 0 28px;">
  Bonjour <strong>${prenom}</strong>, cliquez sur le bouton ci-dessous pour confirmer
  votre adresse email et accéder à toutes les fonctionnalités de la plateforme.
</p>

${btn('✅ Vérifier mon adresse email', url)}

${infoBox(
  `⏱️ Ce lien expire dans <strong>24 heures</strong>.<br>
   Si vous n'avez pas créé de compte, ignorez cet email.<br>
   Lien de secours : <a href="${url}" style="color:#F97316;word-break:break-all;">${url}</a>`,
  '#FEF3C7',
  '#92400E'
)}
`,
  });
}

// ─── 3. Réinitialisation de mot de passe ──────────────────────────────────────
function resetPasswordEmail({ prenom, url }) {
  return base({
    title: 'Réinitialisation de mot de passe — e-Tutorat',
    content: `
<div style="text-align:center;margin-bottom:28px;">
  <div style="font-size:52px;margin-bottom:12px;">🔐</div>
  <h1 style="margin:0 0 6px;color:#3E2A1F;font-size:26px;font-weight:800;font-family:Georgia,serif;">
    Nouveau mot de passe
  </h1>
  <p style="margin:0;color:#6B7280;font-size:15px;">Ce lien expire dans 1 heure</p>
</div>

<p style="color:#524036;line-height:1.75;font-size:15px;margin:0 0 28px;">
  Bonjour <strong>${prenom}</strong>, vous avez demandé la réinitialisation de votre mot de passe.
  Cliquez ci-dessous pour en créer un nouveau.
</p>

${btn('🔑 Réinitialiser mon mot de passe', url)}

${infoBox(
  `⚠️ Si vous n'avez pas fait cette demande, ignorez cet email — votre mot de passe reste inchangé.<br>
   Ce lien est valable <strong>1 heure seulement</strong> et ne peut être utilisé qu'une fois.`,
  '#FEE2E2',
  '#991B1B'
)}
`,
  });
}

// ─── 4. Code OTP de connexion ──────────────────────────────────────────────────
function otpEmail({ prenom, code }) {
  // Formater le code en deux blocs de 3 pour la lisibilité : 123 456
  const formatted = `${code.slice(0, 3)}&nbsp;&nbsp;${code.slice(3)}`;
  return base({
    title: 'Votre code de connexion — e-Tutorat',
    content: `
<div style="text-align:center;margin-bottom:28px;">
  <div style="font-size:52px;margin-bottom:12px;">🔢</div>
  <h1 style="margin:0 0 6px;color:#3E2A1F;font-size:26px;font-weight:800;font-family:Georgia,serif;">
    Code de connexion
  </h1>
  <p style="margin:0;color:#6B7280;font-size:15px;">Valable 10 minutes — usage unique</p>
</div>

<p style="color:#524036;line-height:1.75;font-size:15px;margin:0 0 24px;">
  Bonjour <strong>${prenom}</strong>, voici votre code de connexion temporaire pour accéder à e-Tutorat Sénégal.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
  <tr>
    <td align="center">
      <div style="display:inline-block;background:linear-gradient(135deg,#FEF3C7,#FFF7ED);
                  border:2.5px solid #F97316;border-radius:18px;padding:28px 48px;
                  box-shadow:0 4px 20px rgba(249,115,22,0.15);">
        <div style="font-size:42px;font-weight:900;letter-spacing:10px;color:#F97316;
                    font-family:'Courier New',monospace;line-height:1;">
          ${formatted}
        </div>
      </div>
    </td>
  </tr>
</table>

${infoBox(
  `⏱️ Ce code expire dans <strong>10 minutes</strong>.<br>
   🔒 Ne communiquez jamais ce code à quelqu'un d'autre.<br>
   ❌ Si vous n'avez pas demandé ce code, ignorez cet email.`,
  '#FEF3C7',
  '#92400E'
)}
`,
  });
}

// ─── 5. Nouvelle demande reçue (→ tuteur) ──────────────────────────────────────
function newRequestEmail({ tuteur, eleve, matiere, niveau, message: msg }) {
  return base({
    title: `Nouvelle demande de cours — ${eleve.prenom} ${eleve.nom}`,
    content: `
<div style="text-align:center;margin-bottom:28px;">
  <div style="font-size:52px;margin-bottom:12px;">📬</div>
  <h1 style="margin:0 0 6px;color:#3E2A1F;font-size:26px;font-weight:800;font-family:Georgia,serif;">
    Nouvelle demande reçue
  </h1>
  <p style="margin:0;color:#6B7280;font-size:15px;">Un élève souhaite des cours avec vous</p>
</div>

<p style="color:#524036;line-height:1.75;font-size:15px;margin:0 0 20px;">
  Bonjour <strong>${tuteur.prenom}</strong>, vous avez reçu une nouvelle demande de tutorat !
</p>

<div style="background:#FEF3C7;border-radius:14px;padding:20px 24px;margin:0 0 28px;">
  <p style="margin:0 0 14px;color:#3E2A1F;font-weight:800;font-size:14px;">📋 Détails de la demande</p>
  <table width="100%" cellpadding="5" cellspacing="0" style="font-size:14px;color:#524036;">
    <tr>
      <td style="font-weight:700;width:30%;vertical-align:top;">Élève :</td>
      <td>${eleve.prenom} ${eleve.nom}</td>
    </tr>
    <tr>
      <td style="font-weight:700;vertical-align:top;">Matière :</td>
      <td><strong style="color:#F97316;">${matiere}</strong></td>
    </tr>
    ${niveau ? `<tr><td style="font-weight:700;vertical-align:top;">Niveau :</td><td>${niveau}</td></tr>` : ''}
    ${msg ? `
    <tr>
      <td style="font-weight:700;vertical-align:top;">Message :</td>
      <td style="font-style:italic;color:#6B7280;">"${msg}"</td>
    </tr>` : ''}
  </table>
</div>

${btn('📩 Voir la demande et répondre', `${FRONTEND}?page=dashboard`)}

<p style="color:#9CA3AF;font-size:13px;line-height:1.6;margin:20px 0 0;text-align:center;">
  Connectez-vous pour accepter ou refuser cette demande depuis votre tableau de bord.
</p>
`,
  });
}

// ─── 6. Statut de demande (→ élève) ────────────────────────────────────────────
function requestStatusEmail({ eleve, tuteur, matiere, status }) {
  const ok = status === 'CONFIRMEE';
  return base({
    title: ok ? 'Séance confirmée ! — e-Tutorat' : 'Demande non retenue — e-Tutorat',
    content: `
<div style="text-align:center;margin-bottom:28px;">
  <div style="font-size:52px;margin-bottom:12px;">${ok ? '✅' : '😔'}</div>
  <h1 style="margin:0 0 6px;color:#3E2A1F;font-size:26px;font-weight:800;font-family:Georgia,serif;">
    ${ok ? 'Séance confirmée !' : 'Demande non retenue'}
  </h1>
  <p style="margin:0;color:#6B7280;font-size:15px;">
    ${ok ? 'Votre tuteur est prêt à vous accompagner' : 'Continuez à chercher le tuteur idéal'}
  </p>
</div>

<p style="color:#524036;line-height:1.75;font-size:15px;margin:0 0 20px;">
  Bonjour <strong>${eleve.prenom}</strong>,
  ${ok
    ? ` <strong>${tuteur.prenom} ${tuteur.nom}</strong> a <span style="color:#10B981;font-weight:700;">accepté</span>
        votre demande de cours de <strong>${matiere}</strong>. Contactez-le pour fixer les modalités.`
    : ` <strong>${tuteur.prenom} ${tuteur.nom}</strong> n'est malheureusement pas disponible pour
        votre demande de cours de <strong>${matiere}</strong>. Ne vous découragez pas !`}
</p>

<div style="background:${ok ? '#ECFDF5' : '#FEF2F2'};border-radius:14px;padding:20px 24px;
            margin:0 0 28px;border-left:4px solid ${ok ? '#10B981' : '#EF4444'};">
  <p style="margin:0;color:${ok ? '#065F46' : '#991B1B'};font-size:14px;line-height:1.7;">
    ${ok
      ? '👉 Rendez-vous dans vos messages pour coordonner le planning avec votre tuteur.'
      : '👉 D\'autres tuteurs qualifiés vous attendent sur e-Tutorat. Trouvez votre profil idéal.'}
  </p>
</div>

${btn(
  ok ? '💬 Accéder à mes messages' : '🔍 Trouver un autre tuteur',
  ok ? `${FRONTEND}?page=dashboard` : `${FRONTEND}?page=tuteurs`
)}
`,
  });
}

module.exports = {
  welcomeEmail,
  verifyEmail,
  resetPasswordEmail,
  otpEmail,
  newRequestEmail,
  requestStatusEmail,
};
