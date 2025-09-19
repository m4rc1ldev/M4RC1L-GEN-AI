src/
├── app/                          # Next.js app router
│   ├── chat/                    # 🔄 Renamed from M4RC1L 
│   ├── image-gen/               # 🔄 Renamed from imagegen
│   ├── video-gen/               # 🔄 Renamed from videogen  
│   └── api/                     # Reorganized API routes
│       ├── ai/                  # 🆕 AI-related endpoints
│       │   ├── chat/           # ↗️ Moved from /api/chat
│       │   ├── image-gen/      # ↗️ Moved from /api/imagegen  
│       │   └── models/         # ↗️ Moved from /api/models
│       └── services/           # 🆕 Other services
│           ├── bg-remove/      # ↗️ Moved from /api/bg-remove
│           ├── mcp/            # ↗️ Moved from /api/mcp
│           └── thumb-gen/      # ↗️ Moved from /api/thumbgen
├── components/                  # Organized component structure
│   ├── features/               # 🆕 Feature-specific components
│   │   ├── chat/              # 🆕 Chat-related components
│   │   │   ├── pollinations-chat.tsx   # ↗️ Moved from root
│   │   │   ├── ai-prompt.tsx           # ↗️ Moved from kokonutui/
│   │   │   ├── prompt-input.tsx        # ↗️ Moved from ai-elements/
│   │   │   └── index.ts               # 🆕 Barrel export
│   │   └── image-gen/         # 🆕 Image generation components  
│   │       ├── pollinations-image-gen.tsx  # ↗️ Moved from root
│   │       ├── image-trail.tsx             # ↗️ Moved & renamed from ImageTrail.tsx
│   │       └── index.ts                   # 🆕 Barrel export
│   ├── common/                # 🆕 Shared components
│   │   ├── void-hero.tsx      # ↗️ Moved from root
│   │   ├── footer-section.tsx # ↗️ Moved from root
│   │   └── index.ts          # 🆕 Barrel export
│   ├── sections/             # ✅ Already well organized
│   └── ui/                   # ✅ UI components + anthropic components
│       ├── anthropic.tsx     # ↗️ Moved from kokonutui/
│       └── anthropic-dark.tsx # ↗️ Moved from kokonutui/