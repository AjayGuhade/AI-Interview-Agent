import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface Report {
  applicantId: string;
  report: {
    summary: string;
    strengths: string[];
    improvementAreas: string[];
    scoreAnalysis: {
      averageScore: number;
      maxScore: number;
      totalQuestions: number;
    };
    recommendation: string;
    fitForRole: boolean;
  };
}
interface InterviewResult {
  sessionId: string;
  messages: any[];
  timeSpent: string;
  interviewType?: string;
  applicantName?: string;
}


export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interviewData, setInterviewData] = useState<InterviewResult | null>(null);

  useEffect(() => {
    // Get the interview data passed from the Chat component
    if (location.state) {
      setInterviewData({
        sessionId: location.state.sessionId,
        messages: location.state.messages,
        timeSpent: location.state.timeSpent
      });

      // Fetch the report data from the API
      const fetchReport = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            `http://localhost:5050/api/generate-report/${location.state.sessionId}`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch report');
          }
          
          const data = await response.json();
          setReport(data);
        } catch (err) {
          console.error('Error fetching report:', err);
          setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
          setLoading(false);
        }
      };

      fetchReport();
    } else {
      // If no location state, redirect back
      navigate('/');
    }
  }, [location.state, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-800">Generating your report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Report</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!report || !interviewData) {
    return null; // This case should be handled by the error state
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">Interview Report</h1>
          <p className="text-blue-100 opacity-90">AI Interview Assessment Report</p>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-8">
          {/* Overall Report */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Overall Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Total Interview Time</h3>
                <p className="text-2xl font-semibold text-gray-800">{interviewData.timeSpent}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Average Score</h3>
                <p className="text-2xl font-semibold text-gray-800">
                  {report.report.scoreAnalysis.averageScore.toFixed(1)}/{report.report.scoreAnalysis.maxScore}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Recommendation</h3>
                <p className="text-2xl font-semibold text-gray-800">
                  {report.report.fitForRole ? (
                    <span className="text-green-600">Recommended</span>
                  ) : (
                    <span className="text-red-600">Not Recommended</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Summary</h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700">{report.report.summary}</p>
            </div>
          </div>

          {/* Strong Points */}
          {report.report.strengths.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Strengths</h2>
              <ul className="list-disc pl-5 space-y-2">
                {report.report.strengths.map((strength, index) => (
                  <li key={index} className="text-gray-700">{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas of Improvement */}
          {report.report.improvementAreas.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Areas Of Improvement</h2>
              <ul className="list-disc pl-5 space-y-2">
                {report.report.improvementAreas.map((area, index) => (
                  <li key={index} className="text-gray-700">{area}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Score Analysis */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Score Analysis</h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Average Score</h3>
                  <p className="text-xl font-semibold text-gray-800">
                    {report.report.scoreAnalysis.averageScore.toFixed(1)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Max Score</h3>
                  <p className="text-xl font-semibold text-gray-800">
                    {report.report.scoreAnalysis.maxScore}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Questions Answered</h3>
                  <p className="text-xl font-semibold text-gray-800">
                    {report.report.scoreAnalysis.totalQuestions}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recommendation</h2>
            <div className={`p-4 rounded-lg border ${
              report.report.fitForRole 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`font-medium ${
                report.report.fitForRole ? 'text-green-800' : 'text-red-800'
              }`}>
                {report.report.recommendation}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Report generated on {new Date().toLocaleDateString()} | Session ID: {interviewData.sessionId}
            </p>
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