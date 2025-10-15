# Knowledge Base Search Engine - Frontend

A modern, responsive React frontend for an AI-powered knowledge base search engine. Upload documents, ask questions, and get structured answers with source citations using Retrieval-Augmented Generation (RAG).

![React](https://img.shields.io/badge/React-19.1.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)
![Vite](https://img.shields.io/badge/Vite-7.1.7-yellow.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.14-blue.svg)
![Shadcn/ui](https://img.shields.io/badge/Shadcn/ui-Components-black.svg)

## 🌟 Features

- **Document Upload**: Support for PDF and text files with real-time progress tracking
- **Intelligent Search**: Ask natural language questions about your documents
- **Streaming Responses**: Real-time answer generation with Markdown rendering
- **Source Citations**: View confidence-scored chunks with direct links to content
- **Dark/Light Mode**: Automatic theme switching with system preference detection
- **Responsive Design**: Optimized for desktop and mobile devices
- **Modern UI**: Glassmorphism design with smooth animations and micro-interactions

## 🚀 Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 with custom utilities
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Markdown Rendering**: React Markdown with GitHub Flavored Markdown support
- **Syntax Highlighting**: Highlight.js with code block rendering
- **State Management**: React hooks with context
- **HTTP Client**: Fetch API with custom error handling

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend API server running (see backend repository)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sri-Rahul/Knowledge-Base-Search-Engine-Frontend.git
   cd Knowledge-Base-Search-Engine-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your backend API URL:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components (Shadcn/ui)
│   ├── DocumentUpload.tsx  # File upload interface
│   ├── QueryInterface.tsx  # Search and results interface
│   └── ThemeToggle.tsx     # Dark/light mode switcher
├── services/
│   └── api.ts              # API client and error handling
├── types/
│   └── api.ts              # TypeScript type definitions
├── lib/
│   └── utils.ts            # Utility functions
├── App.tsx                 # Main application component
├── main.tsx                # Application entry point
└── index.css               # Global styles and Tailwind imports
```

## 🎨 Styling

The application uses Tailwind CSS v4 with custom design tokens:

- **Color Palette**: Dual theme support (light/dark) with CSS custom properties
- **Glassmorphism**: Backdrop blur effects for modern UI
- **Animations**: CSS transitions and keyframe animations
- **Typography**: Custom font stack with proper scaling
- **Responsive**: Mobile-first design with breakpoint utilities

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000/api` |

## 🚀 Deployment

### Netlify (Recommended)

1. **Connect Repository**
   - Import project from GitHub
   - Set build settings:
     - **Base directory**: `frontend` (if nested)
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`

2. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

3. **Deploy**
   - Netlify will auto-deploy on pushes to main branch
   - Custom domain support available

### Vercel

1. **Import Project**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Configure**
   - Set `VITE_API_URL` in environment variables
   - Deploy

## 🔧 Development

### Code Quality

- **ESLint**: Configured for React and TypeScript
- **TypeScript**: Strict type checking enabled
- **Prettier**: Code formatting (via ESLint)

### API Integration

The frontend communicates with a FastAPI backend providing:

- Document upload endpoints
- Streaming query endpoints
- Health check endpoints

### Error Handling

- Network errors with user-friendly messages
- API error responses with detailed feedback
- Loading states and progress indicators

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request


## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Markdown rendering with [React Markdown](https://github.com/remarkjs/react-markdown)

---

**Built by Rahul** - A modern RAG-powered knowledge base search engine
