# Design System — e-Tutorat Sénégal
## Vibe: Teranga (Chaleureux & Culturel)

---

## Colors

```js
const COLORS = {
  primary: '#F97316',        // Orange vif — CTA principal, accents forts
  secondary: '#FBBF24',      // Jaune or — ombres boutons, dégradés, détails
  background: '#FFFDF5',     // Crème ivoire — fond de page
  surface: '#FFFFFF',        // Blanc pur — cartes, modales
  accent: '#FEF3C7',         // Ambre pâle — badges, icône backgrounds
  text: '#3E2A1F',           // Brun terre foncé — titres, corps de texte
  textMuted: '#524036',      // Brun moyen — paragraphes secondaires
  textLight: '#6B7280',      // Gris chaud — labels, meta
};
```

---

## Typography

```js
const FONTS = {
  serif: '"Playfair Display", serif',   // Headlines, titres hero
  sans: '"Inter", sans-serif',          // Corps, boutons, labels, nav
};

// Google Fonts import:
// @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;500;700;800;900&display=swap');
```

### Scale (zoomed)
| Usage | Font | Size | Weight |
|---|---|---|---|
| Hero H1 | Playfair Display | clamp(3.5rem, 5vw, 5rem) | 900 |
| Section H2 | Playfair Display | clamp(2.5rem, 4vw, 3.5rem) | 700 |
| Sub-heading | Inter | 1.4rem | 700 |
| Body large | Inter | 1.35rem | 400 |
| Body | Inter | 1.1rem | 400 |
| Label/badge | Inter | 0.9rem | 700 |
| Caption | Inter | 0.85rem | 500 |

---

## Spacing & Layout

- **Max content width:** 1400px, centered
- **Page horizontal padding:** 5%
- **Section vertical padding:** 80px top/bottom
- **Grid gap (2-col):** 60px
- **Component gap:** 24px
- **Card padding:** 1.4rem 1.8rem

---

## Decorative Patterns

### Geometric background pattern (SVG, opacity 0.04)
```css
background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23F97316' fill-rule='evenodd'/%3E%3C/svg%3E");
background-size: 40px 40px;
```

### Bottom stripe (African wax print)
```css
background: repeating-linear-gradient(45deg, #F97316, #F97316 40px, #FBBF24 40px, #FBBF24 80px);
height: 10px;
```

### Gold ambient glow (decorative orb)
```css
background: radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%);
filter: blur(60px);
border-radius: 50%;
```

---

## Components

### Primary Button
```jsx
// Rounded pill, orange, golden shadow
{
  padding: '1.2rem 2.8rem',
  fontSize: '1.2rem',
  fontWeight: 700,
  borderRadius: '999px',
  border: 'none',
  backgroundColor: '#F97316',
  color: '#fff',
  boxShadow: '0 10px 25px -5px rgba(249,115,22,0.4)',
  display: 'flex', alignItems: 'center', gap: '12px',
  cursor: 'pointer',
}
// Hover: scale(1.03) translateY(-2px)
```

### Secondary Button
```jsx
// Rounded pill, white outline orange
{
  padding: '1.2rem 2.8rem',
  fontSize: '1.2rem',
  fontWeight: 700,
  borderRadius: '999px',
  backgroundColor: '#FFFFFF',
  color: '#F97316',
  border: '2px solid #F97316',
  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  display: 'flex', alignItems: 'center', gap: '12px',
  cursor: 'pointer',
}
// Hover: scale(1.03) translateY(-2px)
```

### Badge / Tag
```jsx
{
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  backgroundColor: '#FEF3C7',
  padding: '8px 16px',
  borderRadius: '100px',
  color: '#F97316',
  fontWeight: 700,
  fontSize: '0.9rem',
  border: '1px solid rgba(251,191,36,0.4)',
}
```

### Stat Card
```jsx
{
  backgroundColor: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(10px)',
  padding: '1.4rem 1.8rem',
  borderRadius: '24px',
  border: '1px solid #FEF3C7',
  minWidth: '160px',
  boxShadow: '0 4px 20px rgba(62,42,31,0.03)',
}
// Icon container: backgroundColor '#FEF3C7', padding 10px, borderRadius 12px
// Value: fontSize '2rem', fontWeight 900, color '#3E2A1F'
// Label: fontSize '0.9rem', color '#6B7280', fontWeight 500, textTransform uppercase, letterSpacing 1px
```

### Content Card (floating / tutor card)
```jsx
{
  background: '#FFFFFF',
  padding: '18px',
  borderRadius: '20px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  display: 'flex', alignItems: 'center', gap: '14px',
}
// Avatar: 48px circle, backgroundColor primary
// Name: fontWeight 800, fontSize '1.1rem'
// Subtitle: fontSize '0.9rem', color '#666'
```

### Image Container (hero right)
```jsx
{
  borderRadius: '40px',
  overflow: 'hidden',
  boxShadow: '28px 28px 0px #FBBF24',   // Offset gold shadow
  border: '8px solid #FFFFFF',
  background: 'linear-gradient(135deg, #FEF3C7 0%, rgba(251,191,36,0.15) 100%)',
}
```

### Quoted paragraph (body with left border)
```jsx
{
  borderLeft: '4px solid #FBBF24',
  paddingLeft: '24px',
  fontSize: '1.35rem',
  lineHeight: 1.6,
  color: '#524036',
}
```

---

## Animations

- **Entry:** `opacity: 0 → 1`, `x: -50 → 0` or `y: 20 → 0`, duration 0.8s ease-out (framer-motion)
- **Hover buttons:** `scale(1.03) translateY(-2px)`
- **Floating card:** `y: [0, -10, 0]` repeat Infinity, duration 4s easeInOut
- **Image entrance:** `scale: 0.85 → 1`, duration 1s circOut

---

## Layout Sections (homepage)

The full homepage should include these sections in order:
1. **Navbar** — Logo left, nav links center/right, CTA button
2. **Hero** — 2-col grid: headline + CTAs + stats left / visual illustration right
3. **How it works** — 3-step process with numbered icons
4. **Featured tutors** — Card grid with tutor avatars, subjects, ratings
5. **Subjects** — Icon grid of available subjects
6. **Testimonials** — Student/parent quotes with photo
7. **CTA Banner** — Full-width orange gradient with enrollment CTA
8. **Footer** — Logo, links, social, flag 🇸🇳

---

## Tone & Copy

- Language: **French** (Sénégal)
- Tone: Warm, inclusive, confident — "Teranga" (hospitalité sénégalaise)
- Flag emoji 🇸🇳 used sparingly for cultural anchor
- Headlines: serif italic for emotional words (réussite, excellence, avenir)
- Avoid: cold corporate language, overly technical terms
