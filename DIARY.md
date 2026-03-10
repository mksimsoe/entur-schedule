# Dev Diary - Entur Schedule App

## 2026-03-10 - Project Creation

### What we built
Simple bus schedule web app for Tromsø using the Entur GraphQL API.

### OpenCode Server experiment
- Started OpenCode Server on port 4096 (`opencode serve --port 4096`)
- Created session via API: `POST /session`
- Sent task to GLM-5 via `POST /session/:id/message` with model `{providerID: "zai-coding-plan", modelID: "glm-5"}`

### Observations
- **GLM-5 is slow** - First session ran for ~15 minutes, processed 211K tokens
- **Provider errors** - Second attempt threw `UnknownError` from zai-coding-plan
- **API works well** - Session management, message sending, status polling all functional
- **Manual fallback** - Built the app myself when GLM-5 errored

### What worked
- OpenCode Server API is clean and functional
- Session status polling: `GET /session/status`
- Message retrieval: `GET /session/:id/message`

### What to improve
- Give GLM-5 more time for complex tasks
- Simpler, more focused prompts
- Maybe try different provider/model for faster iteration

### Files created
- `package.json` - Static site with serve
- `index.html` - Dark theme, mobile-friendly UI
- `app.js` - Entur GraphQL API integration, 5 Tromsø stops

### Next steps
- Test the app locally
- Add more stops if needed
- Consider adding real-time updates via WebSocket
