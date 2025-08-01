import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NewDriveModal from "./NewDriveModal";

// Define TypeScript interfaces
interface Drive {
  _id: string;
  CompanyID?: {
    _id: string;
    companyName: string;
  };
  ProjectName: string;
  DifficultyLevel?: string;
  Questions?: string[];
  createdAt: string;
  EstimateStartDate?: string;
  candidates?: Candidate[];
  interviews?: Interview[];
}

interface Candidate {
  id: string | number;
  name: string;
}

interface Interview {
  id: string | number;
}

interface Stats {
  totalInterviews: number;
  totalCandidates: number;
  cheatingIncidents: number;
  avgScore: number;
  activeDrives: number;
}

interface CheatingLog {
  id: number;
  candidate: string;
  time: string;
  reason: string;
  severity: "High" | "Medium" | "Low";
}

interface SummaryCardsProps {
  totalInterviews: number;
  totalCandidates: number;
  cheatingIncidents: number;
  avgScore: number;
  activeDrives: number;
}

interface CheatingLogsTableProps {
  logs: CheatingLog[];
}

const SummaryCards = ({ 
  totalInterviews, 
  totalCandidates, 
  cheatingIncidents, 
  avgScore, 
  activeDrives 
}: SummaryCardsProps) => (
  <>
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-cyan-500/30 transition-colors">
      <h3 className="text-gray-400 text-sm">Total Interviews</h3>
      <p className="text-2xl font-bold">{totalInterviews}</p>
    </div>
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-cyan-500/30 transition-colors">
      <h3 className="text-gray-400 text-sm">Total Candidates</h3>
      <p className="text-2xl font-bold">{totalCandidates}</p>
    </div>
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-cyan-500/30 transition-colors">
      <h3 className="text-gray-400 text-sm">Cheating Incidents</h3>
      <p className="text-2xl font-bold">{cheatingIncidents}</p>
    </div>
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-cyan-500/30 transition-colors">
      <h3 className="text-gray-400 text-sm">Avg. Score</h3>
      <p className="text-2xl font-bold">{avgScore}%</p>
    </div>
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-cyan-500/30 transition-colors">
      <h3 className="text-gray-400 text-sm">Active Drives</h3>
      <p className="text-2xl font-bold">{activeDrives}</p>
    </div>
  </>
);

const CheatingLogsTable = ({ logs }: CheatingLogsTableProps) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="text-left border-b border-gray-700">
          <th className="pb-2">Candidate</th>
          <th className="pb-2">Time</th>
          <th className="pb-2">Reason</th>
          <th className="pb-2">Severity</th>
        </tr>
      </thead>
      <tbody>
        {logs.map(log => (
          <tr key={log.id} className="border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors">
            <td className="py-3">{log.candidate}</td>
            <td className="py-3">{log.time}</td>
            <td className="py-3">{log.reason}</td>
            <td className={`py-3 ${
              log.severity === "High" ? "text-red-400" : 
              log.severity === "Medium" ? "text-yellow-400" : "text-green-400"
            }`}>
              {log.severity}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const DriveCard = ({ drive, onClick }: { drive: Drive, onClick: () => void }) => (
  <div 
    className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-cyan-500/30 transition-colors cursor-pointer"
    onClick={onClick}
  >
    <h4 className="font-medium text-lg mb-2">{drive.ProjectName}</h4>
    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
      {drive.CompanyID?.companyName ? (
        <span className="bg-gray-700 px-2 py-1 rounded text-xs">
          {drive.CompanyID.companyName}
        </span>
      ) : null}
      {drive.DifficultyLevel && (
        <span className={`px-2 py-1 rounded text-xs ${
          drive.DifficultyLevel === 'easy' ? 'bg-green-900/50 text-green-400' :
          drive.DifficultyLevel === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
          'bg-red-900/50 text-red-400'
        }`}>
          {drive.DifficultyLevel}
        </span>
      )}
    </div>
    <p className="text-sm text-gray-400 mb-3">
      Created: {new Date(drive.createdAt).toLocaleDateString()}
    </p>
    <div className="flex justify-between items-center">
      <span className="text-cyan-400 text-sm">
        {drive.candidates?.length || 0} candidates
      </span>
      <button 
        className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded hover:bg-cyan-500/20"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        View Details
      </button>
    </div>
  </div>
);

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "drives" | "analytics" | "settings">("dashboard");
  const [showNewDriveModal, setShowNewDriveModal] = useState(false);
  const [allDrives, setAllDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalInterviews: 0,
    totalCandidates: 0,
    cheatingIncidents: 0,
    avgScore: 0,
    activeDrives: 0
  });

  const navigate = useNavigate();

  const cheatingLogs: CheatingLog[] = [
    { id: 1, candidate: "John Doe", time: "12:34:45", reason: "Multiple faces detected", severity: "High" },
    { id: 2, candidate: "Jane Smith", time: "14:22:10", reason: "Tab switching detected", severity: "Medium" },
    { id: 3, candidate: "Alex Johnson", time: "09:15:33", reason: "Audio input mismatch", severity: "Low" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active drives
        const drivesResponse = await fetch('http://localhost:5050/api/project-recruitment');
        if (!drivesResponse.ok) throw new Error('Failed to fetch drives');
        const drivesData: Drive[] = await drivesResponse.json();
        
        setAllDrives(drivesData);
        
        // Calculate statistics
        const totalCandidates = drivesData.reduce((sum: number, drive: Drive) => 
          sum + (drive.candidates?.length || 0), 0);
        const totalInterviews = drivesData.reduce((sum: number, drive: Drive) => 
          sum + (drive.interviews?.length || 0), 0);
        
        setStats({
          totalInterviews,
          totalCandidates,
          cheatingIncidents: cheatingLogs.length,
          avgScore: 76.5,
          activeDrives: drivesData.length
        });
        
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'dashboard') {
      fetchData();
    }
  }, [activeTab]);

  const handleNewDriveClick = () => {
    navigate("/newDrive");
  };

  const handleViewAllDrives = () => {
    navigate("/drives");
  };

  const handleDriveClick = (driveId: string) => {
    navigate(`/drives/${driveId}`);
  };

  // Get first 6 drives for dashboard
  const displayedDrives = allDrives.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Futuristic Sidebar Navigation */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 border-r border-cyan-500/20 shadow-lg">
        <div className="p-6 border-b border-cyan-500/20">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-cyan-400">🤖</span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              SculptRix AI
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">AI-Powered Hiring Suite</p>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === "dashboard" ? "bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400" : "hover:bg-gray-700/50"}`}
          >
            <span className="text-lg">📊</span>
            Dashboard
          </button>
          <button
            onClick={() => navigate("/drives")}
            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === "drives" ? "bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400" : "hover:bg-gray-700/50"}`}
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
            onClick={() => setActiveTab("settings")}
            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === "settings" ? "bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400" : "hover:bg-gray-700/50"}`}
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
      <div className="ml-64 p-8">
        {/* Header with Create New Drive Button */}
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            {activeTab === "dashboard" && "📊 Hiring Dashboard"}
            {activeTab === "drives" && "🚀 Placement Drives"}
            {activeTab === "analytics" && "📈 Performance Analytics"}
            {activeTab === "settings" && "⚙️ System Settings"}
          </h2>
          <div>
            <button 
              onClick={handleNewDriveClick}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/20"
            >
              <span className="text-xl">+</span> 
              New Placement Drive
            </button>

            {showNewDriveModal && <NewDriveModal />}
          </div>
        </header>

        {/* Dashboard Content */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <SummaryCards 
                totalInterviews={stats.totalInterviews} 
                totalCandidates={stats.totalCandidates}
                cheatingIncidents={stats.cheatingIncidents}
                avgScore={stats.avgScore}
                activeDrives={stats.activeDrives}
              />
            </div>

            {/* Active Drives Section */}
            <section className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <span className="text-cyan-400">🚀</span> Active Placement Drives
                </h3>
                <button 
                  onClick={handleViewAllDrives}
                  className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
                >
                  View All <span>→</span>
                </button>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                </div>
              ) : error ? (
                <div className="text-red-400 p-4 bg-red-900/20 rounded-lg">
                  Error: {error}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedDrives.map(drive => (
                    <DriveCard 
                      key={drive._id} 
                      drive={drive} 
                      onClick={() => handleDriveClick(drive._id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Cheating Detection Section */}
            <section className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <span className="text-red-400">🕵️</span> Recent Cheating Incidents
                </h3>
                <button className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1">
                  View All <span>→</span>
                </button>
              </div>
              
              <CheatingLogsTable logs={cheatingLogs} />
            </section>
          </div>
        )}

        {/* Placement Drives Tab */}
        {activeTab === "drives" && (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
            <p className="text-gray-400">Placement drives management content goes here...</p>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
            <p className="text-gray-400">Analytics content goes here...</p>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
            <p className="text-gray-400">Settings content goes here...</p>
          </div>
        )}
      </div>
    </div>
  );
}