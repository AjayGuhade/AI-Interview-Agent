import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface InterviewResult {
  candidateName: string;
  contactNumber: string;
  email: string;
  profileLinks: {
    linkedIn?: string;
    github?: string;
  };
  trustScore: number;
  cheatingIndicators: {
    tabSwitched: boolean;
    outOfFrame: boolean;
    clickedOutsideWindow: boolean;
    multipleFacesDetected: boolean;
    externalMonitorDetected: boolean;
    inferenceEnded: boolean;
    extensionDetected: boolean;
    ipMismatch: boolean;
  };
  scorePercentage: number;
  totalTime: string;
  strongPoints: string[];
  areasOfImprovement: string[];
  overallFeedback: string;
}

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<InterviewResult | null>(null);

  useEffect(() => {
    // In a real app, you would fetch this data from your backend
    // For now, we'll use mock data similar to your screenshot
    const mockResult: InterviewResult = {
      candidateName: "Jayesh Sudhakar Wakle",
      contactNumber: "8668584275",
      email: "javesh.22210630@vjit.ac.in",
      profileLinks: {
        linkedIn: "#",
        github: "#"
      },
      trustScore: 94,
      cheatingIndicators: {
        tabSwitched: false,
        outOfFrame: true,
        clickedOutsideWindow: false,
        multipleFacesDetected: false,
        externalMonitorDetected: false,
        inferenceEnded: false,
        extensionDetected: false,
        ipMismatch: false
      },
      scorePercentage: 11,
      totalTime: "44:51",
      strongPoints: [
        "Basic understanding of programming concepts",
        "Attempted all questions"
      ],
      areasOfImprovement: [
        "Time management during coding questions",
        "Syntax and logic implementation",
        "Depth of technical knowledge"
      ],
      overallFeedback: "The candidate struggled with most of the questions and did not provide correct or complete solutions. The responses lacked coherence, depth, and understanding of fundamental concepts required for a Software Engineer role. The candidate also faced issues with syntax and logic in coding questions."
    };

    setResult(mockResult);
  }, []);

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-800">Generating your report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">Interview Report</h1>
          <p className="text-blue-100 opacity-90">Hummingbird | Software Engineer | AccioJob</p>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-8">
          {/* Overall Report */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Overall Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Total Assessment Time</h3>
                <p className="text-2xl font-semibold text-gray-800">{result.totalTime}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Score Percentage</h3>
                <p className="text-2xl font-semibold text-gray-800">{result.scorePercentage}%</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Trust Score</h3>
                <p className="text-2xl font-semibold text-gray-800">{result.trustScore}%</p>
              </div>
            </div>
          </div>

          {/* Candidate Info */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Candidate Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Name</h3>
                <p className="text-gray-800">{result.candidateName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Contact</h3>
                <p className="text-gray-800">{result.contactNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Email</h3>
                <p className="text-gray-800">{result.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">LinkedIn</h3>
                <a href={result.profileLinks.linkedIn} className="text-blue-600 hover:underline">View Profile</a>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">GitHub</h3>
                <a href={result.profileLinks.github} className="text-blue-600 hover:underline">View Profile</a>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Proctoring Indicators</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(result.cheatingIndicators).map(([key, value]) => (
                <div key={key} className={`p-3 rounded-lg ${value ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${value ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <span className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {value ? 'Detected' : 'Normal'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strong Points */}
          {result.strongPoints.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Strong Points</h2>
              <ul className="list-disc pl-5 space-y-2">
                {result.strongPoints.map((point, index) => (
                  <li key={index} className="text-gray-700">{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas of Improvement */}
          {result.areasOfImprovement.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Areas Of Improvement</h2>
              <ul className="list-disc pl-5 space-y-2">
                {result.areasOfImprovement.map((area, index) => (
                  <li key={index} className="text-gray-700">{area}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Overall Feedback */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Overall Feedback</h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700">{result.overallFeedback}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Report generated on {new Date().toLocaleDateString()}</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}