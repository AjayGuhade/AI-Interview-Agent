import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DriveAPI } from "../services/api"; // adjust path based on your folder structure

interface Company {
  _id: string;
  companyName: string;
}

interface Drive {
  _id: string;
  ProjectName: string;
  CompanyID?: Company | null;
  TechnicalKeySkills?: string[];
  EducationQualification?: string;
  YearsOfExp?: number;
  EstimateStartDate?: string;
  EstimateEndDate?: string;
  createdAt: string;
  DifficultyLevel: string;
  Description?: string;
}

const DrivesTable: React.FC = () => {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("drives");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const response = await DriveAPI.getAllDrives();
        setDrives(response);
      } catch (error) {
        console.error("Failed to fetch drives:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrives();
  }, []);

  const filteredDrives = drives.filter((drive) => {
    const projectMatch = drive.ProjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const companyMatch = drive.CompanyID?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    return projectMatch || companyMatch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
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
            onClick={() => navigate("/dashboard")}
            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${
              activeTab === "dashboard" ? "bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400" : "hover:bg-gray-700/50"
            }`}
          >
            <span className="text-lg">📊</span>
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("drives")}
            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${
              activeTab === "drives" ? "bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400" : "hover:bg-gray-700/50"
            }`}
          >
            <span className="text-lg">🚀</span>
            Placement Drives
          </button>
          <button
            onClick={() => navigate("/drives")}
            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${
              activeTab === "analytics" ? "bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400" : "hover:bg-gray-700/50"
            }`}
          >
            <span className="text-lg">📈</span>
            Analytics
          </button>
          <button
            onClick={() => navigate("/settings")}
            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${
              activeTab === "settings" ? "bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400" : "hover:bg-gray-700/50"
            }`}
          >
            <span className="text-lg">⚙️</span>
            Settings
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-700">
          <button className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <span>👋</span> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-64 p-8 flex-1">
        {/* Header with Create New Drive Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-cyan-400"></span>
              Placement Drives
            </h2>
            <p className="text-gray-400 mt-2">Manage and track all your recruitment activities</p>
          </div>
          <div className="flex space-x-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search drives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full md:w-64"
            />
            <button
              onClick={() => navigate("/newDrive")}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-2 rounded-md font-medium whitespace-nowrap"
            >
              + New Drive
            </button>
          </div>
        </div>

        {/* Drives Grid */}
        {filteredDrives.length === 0 ? (
          <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-300">No drives found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm ? "Try a different search term" : "Create a new drive to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrives.map((drive) => (
              <div
                key={drive._id}
                className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300 shadow-lg"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white">{drive.ProjectName}</h3>
                      <p className="text-gray-400 mt-1">
                        {drive.CompanyID?.companyName || "No company specified"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        drive.DifficultyLevel === "easy"
                          ? "bg-green-500/10 text-green-400"
                          : drive.DifficultyLevel === "medium"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {drive.DifficultyLevel}
                    </span>
                  </div>

                  {drive.Description && (
                    <p className="text-gray-300 mt-4 line-clamp-2">{drive.Description}</p>
                  )}

                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Technical Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {(drive.TechnicalKeySkills || []).slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {(drive.TechnicalKeySkills || []).length > 3 && (
                        <span className="bg-gray-700 text-gray-400 px-2 py-1 rounded text-xs">
                          +{(drive.TechnicalKeySkills || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400">Timeline</p>
                      <p className="text-sm text-white">
                        {drive.EstimateStartDate
                          ? new Date(drive.EstimateStartDate).toLocaleDateString()
                          : "—"}{" "}
                        -{" "}
                        {drive.EstimateEndDate
                          ? new Date(drive.EstimateEndDate).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/drives/${drive._id}`)}
                      className="text-cyan-400 hover:text-cyan-300 px-4 py-2 bg-cyan-500/10 rounded-lg text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DrivesTable;