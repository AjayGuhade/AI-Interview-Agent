import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'

import App from './App.tsx'
import UploadResume from './UploadResume.tsx'
import AvatarViewer from './AvatarViewer.tsx'
import AIChat from './Chat.tsx' // ✅ Your new chat page
import AiInterviewPage from './LandingPage.tsx'
import Chat from './Chat.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        {/* <Route path="/" element={<App />} /> */}
        <Route path="/" element={<AiInterviewPage />} />
        <Route path="/chat" element={<Chat />} />

        <Route path="/avatar" element={<AvatarViewer />} />
        {/* <Route path="/chat" element={<AIChat />} /> */}
      </Routes>
    </Router>
  </StrictMode>,
)
