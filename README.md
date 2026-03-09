# HeroVerse

> A comic-book styled mobile app to explore, search, and discover superheroes from across the universe.

Built with **React Native + Expo** by **Santiago Duque Robledo & Cesar David Arias Posada**.

---

##  Screenshots

| Search | Hero Modal | Full Profile |
|--------|-----------|--------------|
| Search by name or ID | Quick stats popup | Complete hero data |

---

##  Features

- **Smart Search** — type a name like `Batman` or a numeric ID like `70` and the app auto-detects the mode
- **Instant Modal** — every search result pops up in a compact comic-style sheet showing image, stats, and alignment
- **Full Profile Screen** — tap *View Full Profile* to see biography, appearance, work, connections, and all power stats
- **Comic Book UI** — Bangers + Oswald fonts, halftone overlays, hard ink shadows, and a dark-ink color palette
- **ID Mode** — fetch any hero directly by numeric ID (1–731) with 3 parallel API calls for speed
- **Results List** — name searches with multiple matches show an expandable accordion list

---

## Project Structure

```
app/
├── (tabs)/
│   ├── index.tsx          # Inicio tab — random hero on load
│   └── search.tsx         # Search tab — name + ID search
├── heroes/
│   └── [id].tsx           # Full hero profile screen
src/
└── components/
    ├── AnimatedStatBar/   # Animated power stat bar
    ├── ComicButton/       # Comic-style button with ink shadow
    ├── HalftoneOverlay/   # Ben-Day dot background overlay
    ├── HeroDetailCard/    # Accordion card for search results
    ├── HeroModal/         # Bottom-sheet modal popup
    ├── InfoRow/           # Label + value row for detail sections
    └── StatBar/           # Static stat bar variant
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- Android Studio or Xcode (for emulator), or the Expo Go app on a physical device

### Install

```bash
git clone https://github.com/SDuque28/SuperHeroApp.git
cd SuperHeroApp
git checkout tabs
npm install
```

### Dependencies

```bash
npx expo install expo-linear-gradient
npx expo install @expo-google-fonts/bangers @expo-google-fonts/oswald
npx expo install react-native-reanimated
npx expo install expo-image
npm install axios
```

> **Important:** add the Reanimated plugin to `babel.config.js`:
> ```js
> module.exports = {
>   presets: ['babel-preset-expo'],
>   plugins: ['react-native-reanimated/plugin'],
> };
> ```

### Run

```bash
npx expo start
```

Then press `a` for Android, `i` for iOS, or scan the QR code with Expo Go.

---

## API

This app consumes the [SuperHero API](https://superheroapi.com/).

| Endpoint | Used for |
|----------|----------|
| `GET /{id}` | Full hero by ID (Inicio tab random hero) |
| `GET /search/{name}` | Hero search by name |
| `GET /{id}/biography` | Biography data for modal (ID mode) |
| `GET /{id}/powerstats` | Power stats for modal (ID mode) |
| `GET /{id}/image` | Hero image for modal (ID mode) |

**API Key:** configured in `search.tsx` and `index.tsx` as `API_KEY`.  
Total heroes available: **731**.

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Ink | `#1A1028` | Borders, shadows, text |
| Yellow | `#FFD600` | Primary accent, headlines |
| Red | `#E8173D` | CTAs, villain badge, errors |
| Blue | `#0057FF` | Biography section |
| Green | `#00C853` | Hero badge, high stats |
| Dark BG | `#0A0A2E` | Cards, modals, screens |
| Paper | `#FFF9EE` | Light background |

**Fonts:** `Bangers_400Regular` (display) · `Oswald_700Bold` / `Oswald_400Regular` (UI)

---

## Key Components

### `HeroModal`
Bottom-sheet popup triggered after every search. Shows hero image, name, publisher, alignment badge, top 3 power stats, and a *View Full Profile* CTA. Animated with `SlideInDown` spring + `FadeIn` backdrop.

### `HeroDetailCard`
Accordion card used in the multi-result list. Collapsed view shows name, publisher, and top stat. Expanded view reveals all 6 power stats with animated bars, full biography, appearance, work, and connections sections.

### `AnimatedStatBar`
Fills from 0 to the stat value on mount using `withTiming` + `Easing.out(Easing.cubic)`. Color-coded: green ≥ 80, yellow ≥ 50, red ≥ 25, grey below.

### `HalftoneOverlay`
Renders a Ben-Day dot grid as a decorative background layer using absolute positioning, adding the comic-print texture to headers and cards.

---

## Authors

**Santiago Duque Robledo** · **Cesar David Arias Posada**

---

## License

This project was built for educational purposes. Hero data provided by [SuperHero API](https://superheroapi.com/).
