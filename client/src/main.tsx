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
import AuthPage from './Login.tsx'
import Dashboard from './Manager/ManagerDashboard.tsx'
import ManagerDashboard from './Manager/ManagerDashboard.tsx'
import CreateDrivePage from './Manager/NewDriveModal.tsx'
import DriveDetails from './Manager/DriveDetails.tsx'
import AllDrives from './Manager/AllDrives.tsx'
import CodeEditor from './CodedEditor.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        {/* <Route path="/" element={<App />} /> */}
        <Route path="/AiInterviewPage" element={<AiInterviewPage />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/" element={<AuthPage />} />
        {/* <Route path="/" element={<login />} /> */}

        <Route path="/avatar" element={<AvatarViewer />} />
        <Route path="/dashboard" element={<ManagerDashboard />} />
        <Route path="/newDrive" element={<CreateDrivePage />} />
        // In your router setup (e.g., App.tsx)
        {/* <Route path="/drives/:driveId" element={<DriveDetails />} /> */}
        <Route path="/drives/:id" element={<DriveDetails />} />

        <Route path="/drives" element={<AllDrives />} />
        <Route path="/CodeEditor" element={<CodeEditor />} />

        
      </Routes>
    </Router>
  </StrictMode>,
)
