import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Layout() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we're on a child route
  const isChildRoute = !["/dashboard", "/drives", "/analytics", "/settings"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 border-r border-cyan-500/20 shadow-lg">
        <div className="p-6 border-b border-cyan-500/20">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-cyan-400">🤖</span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              RoboRecruit
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">AI-Powered Hiring Suite</p>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => {
              setActiveTab("dashboard");
              navigate("/dashboard");
            }}
            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${
              activeTab === "dashboard" ? "bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400" : "hover:bg-gray-700/50"
            }`}
          >
            <span className="text-lg">📊</span>
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveTab("drives");
              navigate("/drives");
            }}
            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${
              activeTab === "drives" ? "bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400" : "hover:bg-gray-700/50"
            }`}
          >
            <span className="text-lg">🚀</span>
            Placement Drives
          </button>
          {/* Add other navigation buttons similarly */}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-700">
          <button className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <span>👋</span> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-64 p-8">
        {/* Header with Create New Drive Button */}
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            {activeTab === "dashboard" && "📊 Hiring Dashboard"}
            {activeTab === "drives" && "🚀 Placement Drives"}
            {/* Add other titles */}
          </h2>
          {!isChildRoute && (
            <button 
              onClick={() => navigate("/newDrive")}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/20"
            >
              <span className="text-xl">+</span> 
              New Placement Drive
            </button>
          )}
        </header>

        {/* This will render the child routes */}
        <Outlet />
      </div>
    </div>
  );
}