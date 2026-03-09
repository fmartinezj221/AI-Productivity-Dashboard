## Packages
framer-motion | Beautiful page transitions, micro-interactions, and list animations
date-fns | Human-readable date formatting for tasks and chat messages
lucide-react | Already installed, but explicitly required for sleek UI icons

## Notes
- Tailwind Config - extend fontFamily:
  fontFamily: {
    sans: ["var(--font-sans)"],
    display: ["var(--font-display)"],
  }
- Chat SSE Streaming requires parsing `data: {"content": "..."}` and `data: {"done": true}`
- Chat backend provides raw endpoints `/api/conversations` not fully typed in shared routes, so fallback to manual typing in chat hook
