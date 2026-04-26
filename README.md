# 🎙️ MemoryMesh

_A living map of how your thinking evolves_

[![React](https://img.shields.io/badge/React-19.2.0-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.x-dd2c00?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

MemoryMesh is a voice-first AI note-taking application that captures your thoughts, connects them intelligently, and reveals how your thinking evolves over time. Speak naturally, watch your ideas grow, and discover patterns in your intellectual journey.

## ✨ What Makes MemoryMesh Special

Unlike traditional note-taking apps, MemoryMesh treats your thoughts as a living, evolving system. It doesn't just store notes—it understands them, connects them, and shows you how your thinking changes through reinforcement, expansion, and even contradiction.

### 🧠 The Thinking Evolution Engine

Our core innovation detects three types of intellectual evolution:

- **Reinforcement**: When ideas strengthen over time
- **Expansion**: When concepts grow and develop
- **Contradiction**: When beliefs shift or change

## 🚀 Key Features

### Voice-First Experience

- **One-tap voice capture** using Web Speech API
- **Real-time transcription** with live streaming
- **Zero friction** - tap, talk, done

### AI-Powered Intelligence

- **Gemini AI cleanup** for polished, natural language
- **Auto-generated keywords** (3 per note)
- **Dynamic bucket inference** (smart categorization)
- **Semantic embeddings** for intelligent connections

### Smart Organization

- **Connection Graph** - visualize how ideas link across time
- **Geolocation tagging** with place inference ("Office", "Gym", etc.)
- **Time-aware insights** - see patterns across days, weeks, months
- **Conversational recall** - ask questions in natural language

### Data & Privacy

- **Local storage** for guest users
- **Firebase integration** for authenticated users
- **Daily Markdown exports** in your timezone
- **Complete data ownership** - export anytime

## 🛠️ Tech Stack

### Frontend

- **React 19** with TypeScript
- **TanStack Router** for client-side routing
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Recharts** for data visualization

### Backend & AI

- **Firebase** (Auth, Firestore)
- **Google Gemini AI** for text processing
- **Web Speech API** for voice recognition

### Build & Dev Tools

- **Vite** for fast development and building
- **ESLint** for code quality
- **Prettier** for code formatting

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+
- npm or bun

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/dhirendraxd/Codewave-Mascot.git
   cd Codewave-Mascot
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up Firebase** (optional for guest mode)
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Copy your config to environment variables

4. **Start development server**

   ```bash
   npm run dev
   # or
   bun run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
npm run preview
```

## 🎯 Usage

### Getting Started

1. **Sign up or use as guest** - no account required for trying
2. **Tap the mic button** - start speaking your thoughts
3. **Watch AI work** - see transcription, keywords, and bucket generation
4. **Explore connections** - view the graph of your thinking
5. **Ask questions** - use the chat to recall and analyze

### Voice Commands

- Speak naturally about any topic
- No special commands needed
- AI understands context and intent

### Data Export

- **Daily dumps** - automatic Markdown exports
- **Custom date ranges** - export any period
- **Complete backup** - all your data, your way

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

### Development Setup

```bash
# Fork and clone
git clone https://github.com/your-username/Codewave-Mascot.git
cd Codewave-Mascot

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format

# Build and test
npm run build
```

### Areas for Contribution

- **UI/UX improvements** - enhance the voice-first experience
- **AI integrations** - add more language models or processing features
- **Data visualization** - improve the connection graph
- **Mobile optimization** - PWA and mobile-specific features
- **Accessibility** - ensure WCAG compliance

## 📊 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   ├── marketing/      # Landing page components
│   └── AppShell.tsx    # Main app layout
├── routes/             # Page components and routing
├── lib/                # Utilities and services
│   ├── auth.tsx        # Authentication logic
│   ├── notes.ts        # Note management
│   ├── buckets.ts      # Bucket organization
│   └── gemini.ts       # AI integration
└── hooks/              # Custom React hooks
```

## 🌟 Roadmap

### Phase 1 (Current)

- ✅ Voice capture and transcription
- ✅ AI-powered note processing
- ✅ Basic connection graph
- ✅ Guest mode and authentication

### Phase 2 (Upcoming)

- 🔄 Advanced evolution detection
- 🔄 Collaborative features
- 🔄 Mobile app
- 🔄 Plugin ecosystem

### Phase 3 (Future)

- 🔄 Multi-modal input (images, files)
- 🔄 Advanced analytics
- 🔄 API for integrations
- 🔄 Enterprise features

## 👥 Team

**Riten, Shishir, Dhiren, and Hitesh**

A passionate team building the future of thought capture and intellectual evolution tracking.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for AI processing
- **Firebase** for backend infrastructure
- **TanStack** for amazing React tools
- **Radix UI** for accessible components
- **Tailwind CSS** for utility-first styling

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/dhirendraxd/Codewave-Mascot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/dhirendraxd/Codewave-Mascot/discussions)
- **Email**: For business inquiries

---

**MemoryMesh** - Because your thoughts deserve to be understood, connected, and remembered. 🎯
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
globalIgnores(['dist']),
{
files: ['**/*.{ts,tsx}'],
extends: [
// Other configs...
// Enable lint rules for React
reactX.configs['recommended-typescript'],
// Enable lint rules for React DOM
reactDom.configs.recommended,
],
languageOptions: {
parserOptions: {
project: ['./tsconfig.node.json', './tsconfig.app.json'],
tsconfigRootDir: import.meta.dirname,
},
// other options...
},
},
])

```

```
