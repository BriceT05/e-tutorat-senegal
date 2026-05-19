// Page légale — deux onglets : CGU (Conditions Générales) et Politique de confidentialité.
// Le tab initial est passé en prop depuis main.jsx selon le lien cliqué dans le footer.
import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowLeft, Shield, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import useIsMobile from './useIsMobile';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary: '#F97316', secondary: '#FBBF24', background: '#FFFDF5',
  surface: '#FFFFFF', accent: '#FEF3C7', text: '#3E2A1F',
  muted: '#524036', light: '#6B7280', border: '#E9D5A0',
};
const SERIF = '"Playfair Display", serif';
const SANS  = '"Inter", sans-serif';

// Section accordéon — ouverte par défaut, refermable au clic sur le titre
const Section = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: '24px', marginBottom: '24px' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
        <h2 style={{ fontFamily: SERIF, fontSize: '1.2rem', color: C.text, margin: 0, fontWeight: 700 }}>{title}</h2>
        {open ? <ChevronUp size={18} color={C.light} /> : <ChevronDown size={18} color={C.light} />}
      </button>
      {open && <div style={{ marginTop: '16px', color: C.muted, lineHeight: 1.8, fontSize: '0.95rem', fontFamily: SANS }}>{children}</div>}
    </div>
  );
};

const CGU = () => (
  <div>
    <Section title="1. Objet">
      <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme <strong>e-Tutorat Sénégal</strong>, accessible à l'adresse etutorat.sn (ci-après « la Plateforme »), éditée par e-Tutorat Sénégal.</p>
      <p>En créant un compte ou en naviguant sur la Plateforme, l'Utilisateur accepte sans réserve les présentes CGU.</p>
    </Section>

    <Section title="2. Description du service">
      <p>e-Tutorat Sénégal est une plateforme de mise en relation entre :</p>
      <ul style={{ paddingLeft: '20px' }}>
        <li><strong>Élèves et Parents</strong> : cherchant un accompagnement scolaire (du CI à la Terminale)</li>
        <li><strong>Tuteurs</strong> : professeurs particuliers proposant leurs services</li>
      </ul>
      <p>La Plateforme ne réalise pas elle-même les cours et n'est pas partie au contrat entre l'Élève et le Tuteur.</p>
    </Section>

    <Section title="3. Inscription et compte">
      <p>L'inscription est gratuite et ouverte à toute personne physique résidant au Sénégal. L'Utilisateur s'engage à :</p>
      <ul style={{ paddingLeft: '20px' }}>
        <li>Fournir des informations exactes et à jour</li>
        <li>Maintenir la confidentialité de ses identifiants</li>
        <li>Notifier immédiatement tout accès non autorisé à son compte</li>
        <li>Ne pas créer plusieurs comptes</li>
      </ul>
    </Section>

    <Section title="4. Obligations des Tuteurs">
      <p>Les Tuteurs s'engagent à :</p>
      <ul style={{ paddingLeft: '20px' }}>
        <li>Fournir des informations véridiques sur leurs diplômes et expériences</li>
        <li>Respecter les engagements pris avec les Élèves</li>
        <li>Ne pas pratiquer de tarifs abusifs</li>
        <li>Se comporter de manière professionnelle et respectueuse</li>
        <li>Déclarer leurs revenus conformément à la réglementation sénégalaise</li>
      </ul>
    </Section>

    <Section title="5. Obligations des Élèves / Parents">
      <p>Les Élèves et Parents s'engagent à :</p>
      <ul style={{ paddingLeft: '20px' }}>
        <li>Respecter les Tuteurs et leurs horaires</li>
        <li>Prévenir en cas d'annulation avec un délai raisonnable</li>
        <li>Régler les prestations selon les modalités convenues</li>
      </ul>
    </Section>

    <Section title="6. Contenu interdit">
      <p>Il est strictement interdit de publier ou transmettre via la Plateforme :</p>
      <ul style={{ paddingLeft: '20px' }}>
        <li>Des contenus illicites, diffamatoires ou portant atteinte aux droits de tiers</li>
        <li>Des sollicitations commerciales non autorisées (spam)</li>
        <li>Des informations fausses ou trompeuses</li>
        <li>Tout contenu à caractère sexuel, violent ou discriminatoire</li>
      </ul>
    </Section>

    <Section title="7. Responsabilité">
      <p>e-Tutorat Sénégal agit en tant qu'intermédiaire technique. Elle ne garantit pas la qualité des prestations des Tuteurs et décline toute responsabilité quant aux litiges entre Utilisateurs.</p>
      <p>La Plateforme est fournie « en l'état ». e-Tutorat Sénégal ne saurait être tenue responsable des dommages directs ou indirects résultant de l'utilisation de la Plateforme.</p>
    </Section>

    <Section title="8. Suspension et résiliation">
      <p>e-Tutorat Sénégal se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU, sans préavis ni indemnité.</p>
      <p>L'Utilisateur peut supprimer son compte à tout moment depuis les paramètres de son profil.</p>
    </Section>

    <Section title="9. Propriété intellectuelle">
      <p>Tous les éléments de la Plateforme (logo, design, textes, code) sont la propriété exclusive d'e-Tutorat Sénégal et protégés par le droit sénégalais de la propriété intellectuelle.</p>
    </Section>

    <Section title="10. Droit applicable">
      <p>Les présentes CGU sont soumises au droit sénégalais. Tout litige sera soumis aux tribunaux compétents de Dakar.</p>
      <p>Dernière mise à jour : <strong>18 mai 2026</strong></p>
    </Section>
  </div>
);

const PrivacyPolicy = () => (
  <div>
    <Section title="1. Responsable du traitement">
      <p><strong>e-Tutorat Sénégal</strong> est responsable du traitement de vos données personnelles collectées via la Plateforme.</p>
      <p>Contact : <a href="mailto:etutorat2026@gmail.com" style={{ color: C.primary }}>etutorat2026@gmail.com</a></p>
    </Section>

    <Section title="2. Données collectées">
      <p>Nous collectons les données suivantes :</p>
      <ul style={{ paddingLeft: '20px' }}>
        <li><strong>Données d'identification</strong> : prénom, nom, adresse email, numéro de téléphone</li>
        <li><strong>Données de profil</strong> : région, niveau scolaire, matières, photo de profil</li>
        <li><strong>Données d'activité</strong> : demandes de cours, messages échangés, avis</li>
        <li><strong>Données techniques</strong> : adresse IP, navigateur, pages visitées</li>
      </ul>
    </Section>

    <Section title="3. Finalités du traitement">
      <p>Vos données sont utilisées pour :</p>
      <ul style={{ paddingLeft: '20px' }}>
        <li>Créer et gérer votre compte</li>
        <li>Mettre en relation Élèves et Tuteurs</li>
        <li>Envoyer des notifications liées à votre activité</li>
        <li>Améliorer nos services</li>
        <li>Respecter nos obligations légales</li>
      </ul>
    </Section>

    <Section title="4. Base légale">
      <p>Le traitement de vos données repose sur :</p>
      <ul style={{ paddingLeft: '20px' }}>
        <li><strong>L'exécution du contrat</strong> : pour la fourniture du service</li>
        <li><strong>Votre consentement</strong> : pour les communications marketing (si applicable)</li>
        <li><strong>L'intérêt légitime</strong> : pour la sécurité et l'amélioration de la Plateforme</li>
      </ul>
    </Section>

    <Section title="5. Durée de conservation">
      <ul style={{ paddingLeft: '20px' }}>
        <li>Données de compte : jusqu'à suppression du compte + 1 an</li>
        <li>Données de transactions : 5 ans (obligations comptables)</li>
        <li>Données de connexion : 1 an</li>
      </ul>
    </Section>

    <Section title="6. Partage des données">
      <p>Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec :</p>
      <ul style={{ paddingLeft: '20px' }}>
        <li>Les autres Utilisateurs dans le cadre normal du service (profil public des Tuteurs)</li>
        <li>Nos prestataires techniques (hébergement, email) dans le strict nécessaire</li>
        <li>Les autorités compétentes sur demande légale</li>
      </ul>
    </Section>

    <Section title="7. Vos droits">
      <p>Conformément à la loi sénégalaise n°2008-12 sur la protection des données personnelles, vous disposez des droits suivants :</p>
      <ul style={{ paddingLeft: '20px' }}>
        <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
        <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
        <li><strong>Droit à l'effacement</strong> : supprimer votre compte et vos données</li>
        <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format lisible</li>
        <li><strong>Droit d'opposition</strong> : vous opposer à certains traitements</li>
      </ul>
      <p>Pour exercer ces droits : <a href="mailto:etutorat2026@gmail.com" style={{ color: C.primary }}>etutorat2026@gmail.com</a></p>
    </Section>

    <Section title="8. Cookies">
      <p>La Plateforme utilise uniquement des cookies strictement nécessaires au fonctionnement (session, authentification). Aucun cookie publicitaire n'est utilisé.</p>
    </Section>

    <Section title="9. Sécurité">
      <p>Nous mettons en œuvre des mesures techniques appropriées : chiffrement des mots de passe (bcrypt), HTTPS, tokens JWT à durée limitée. Aucune mesure n'étant parfaite, nous vous encourageons à utiliser un mot de passe fort et unique.</p>
    </Section>

    <Section title="10. Contact et réclamations">
      <p>Pour toute question relative à vos données : <a href="mailto:etutorat2026@gmail.com" style={{ color: C.primary }}>etutorat2026@gmail.com</a></p>
      <p>Vous pouvez également saisir la <strong>CDP (Commission des Données Personnelles)</strong> du Sénégal en cas de litige non résolu.</p>
      <p>Dernière mise à jour : <strong>18 mai 2026</strong></p>
    </Section>
  </div>
);

export default function LegalPage({ tab = 'cgu', onGoHome, onGoBack }) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState(tab);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.background, fontFamily: SANS }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700;800;900&display=swap'); *, *::before, *::after { box-sizing: border-box; } p { margin: 0 0 12px; } ul { margin: 0 0 12px; }`}</style>

      {/* Header */}
      <header style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.accent}`, padding: '16px 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onGoBack || onGoHome} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '0.95rem', fontWeight: 600, fontFamily: SANS }}>
          <ArrowLeft size={18} /> Retour
        </button>
        <img src="/logo.png" alt="e-Tutorat" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
        <div style={{ width: 80 }} />
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: isMobile ? '32px 16px 80px' : '48px 24px 80px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', backgroundColor: C.surface, padding: '6px', borderRadius: '16px', border: `1px solid ${C.accent}` }}>
          {[
            { id: 'cgu', icon: FileText, label: 'Conditions d\'utilisation', labelMobile: 'CGU' },
            { id: 'privacy', icon: Shield, label: 'Politique de confidentialité', labelMobile: 'Confidentialité' },
          ].map(({ id, icon: Icon, label, labelMobile }) => (
            <motion.button key={id} onClick={() => setActiveTab(id)} whileTap={{ scale: 0.98 }}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: isMobile ? '10px 8px' : '12px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === id ? C.accent : 'transparent', color: activeTab === id ? C.primary : C.muted, fontWeight: activeTab === id ? 700 : 500, fontSize: isMobile ? '0.82rem' : '0.9rem', cursor: 'pointer', fontFamily: SANS, transition: 'all 0.2s' }}>
              <Icon size={15} /> {isMobile ? labelMobile : label}
            </motion.button>
          ))}
        </div>

        {/* Titre */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px', padding: '24px', backgroundColor: C.surface, borderRadius: '20px', border: `1px solid ${C.accent}` }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: C.accent, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              {activeTab === 'cgu' ? <FileText size={26} color={C.primary} /> : <Shield size={26} color={C.primary} />}
            </div>
            <div>
              <h1 style={{ fontFamily: SERIF, fontSize: '1.6rem', color: C.text, margin: 0, fontWeight: 700 }}>
                {activeTab === 'cgu' ? 'Conditions Générales d\'Utilisation' : 'Politique de Confidentialité'}
              </h1>
              <p style={{ color: C.light, fontSize: '0.85rem', margin: '4px 0 0', fontFamily: SANS }}>e-Tutorat Sénégal — Mise à jour : 18 mai 2026</p>
            </div>
          </div>

          <div style={{ backgroundColor: C.surface, borderRadius: '20px', padding: isMobile ? '20px 16px' : '36px', border: `1px solid ${C.accent}` }}>
            {activeTab === 'cgu' ? <CGU /> : <PrivacyPolicy />}
          </div>
        </motion.div>
      </main>

      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', display: 'flex', height: '6px', zIndex: 20 }}>
        <div style={{ flex: 1, backgroundColor: '#00853F' }} />
        <div style={{ flex: 1, backgroundColor: '#FDEF42' }} />
        <div style={{ flex: 1, backgroundColor: '#E31B23' }} />
      </div>
    </div>
  );
}
