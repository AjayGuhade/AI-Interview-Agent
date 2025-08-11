import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApplicantAPI, InterviewAPI } from './services/api';

interface Applicant {
  ProjectRecruitmentDriveID: string;
  _id: string;
  FirstName: string;
  Email: string;
  InterviewStatus: string;
  MeetingLink: string;
  MobileNumber: string;
  Education: string;
  YearsOfExp: number;
  Resume: string;
  MeetingStartDate: string;
  MeetingEndDate: string;
}

const InterviewEntry = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [startingInterview, setStartingInterview] = useState(false);

  useEffect(() => {
    const fetchApplicant = async () => {
      try {
        const data = await ApplicantAPI.getByMeetingId(meetingId!);
        setApplicant(data.applicant);
      } catch {
        setError("Invalid or expired meeting link.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplicant();
  }, [meetingId]);

  const startInterviewSession = async () => {
    if (!applicant) return;
    
    setStartingInterview(true);
    try {
      const response = await InterviewAPI.startInterview({
        applicantId: applicant._id,
        driveId: applicant.ProjectRecruitmentDriveID
      });

      navigate(`/interview/${meetingId}`, {
        state: {
          sessionId: response.sessionId,
          initialMessages: response.messages,
          applicantData: applicant
        }
      });
    } catch (err) {
      setError("Failed to start interview session. Please try again.");
      setStartingInterview(false);
    }
  };

  const extractName = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    return lines.length >= 3 ? lines[2] : "Candidate";
  };

  const extractProfileInfo = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const profile: Record<string, string> = {};
    
    if (lines.length > 3) {
      profile['Phone'] = lines[3] || '';
      profile['Email'] = lines[4] || '';
      profile['Address'] = lines[5] || '';
    }
    
    return profile;
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-lg font-medium text-gray-800">Preparing your interview session...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md p-8 bg-white rounded-2xl shadow-xl text-center">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Meeting Link Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );

  if (!applicant) return null;

  const profileInfo = extractProfileInfo(applicant.FirstName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">AI Interview Session</h1>
                <p className="text-blue-100 opacity-90">Powered by SculpTrix.AI</p>
              </div>
              <div className="mt-4 md:mt-0 bg-blue-800 bg-opacity-30 px-4 py-2 rounded-lg backdrop-blur-sm">
                <p className="font-medium">
                  Status: <span className="capitalize">{applicant.InterviewStatus.toLowerCase()}</span>
                </p>
                <p className="text-sm text-blue-100 opacity-90">
                  {new Date(applicant.MeetingStartDate).toLocaleString()} - {new Date(applicant.MeetingEndDate).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Candidate Info */}
            <div className="lg:col-span-1 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <span className="text-3xl font-bold text-blue-600">
                    {extractName(applicant.FirstName)?.charAt(0) || "A"}
                  </span>
                </div>
                
                <h2 className="text-xl font-bold text-gray-800">{applicant.FirstName}</h2>
                <p className="text-gray-600">{applicant.YearsOfExp}+ years experience</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Contact</h3>
                  <p className="text-gray-700">{profileInfo['Phone'] || applicant.MobileNumber}</p>
                  <p className="text-gray-700">{applicant.Email}</p>
                  {profileInfo['Address'] && <p className="text-gray-700 mt-1">{profileInfo['Address']}</p>}
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Resume</h3>
                  <a 
                    href={`http://localhost:5050/uploads/${applicant.Resume}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    View Resume
                  </a>
                </div>
              </div>
            </div>

            {/* Interview Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Welcome Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Welcome to Your AI Interview</h3>
                <p className="text-gray-700 mb-4">
                  This session will evaluate your technical skills, problem-solving abilities, and cultural fit for the role. 
                  The interview consists of several questions with time allocated for each response.
                </p>
                <div className="flex items-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Estimated duration: 30 minutes</span>
                </div>
              </div>

              {/* Preparation Checklist */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  Preparation Checklist
                </h3>
                <div className="space-y-3">
                  {[
                    "Ensure you're in a quiet, well-lit environment",
                    "Use Chrome or Firefox for best experience",
                    "Have your resume and portfolio ready",
                    "Close all unnecessary applications",
                    "Ensure stable internet connection"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="ml-2 text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proctoring Information */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Proctoring & Integrity
                </h3>
                <p className="text-gray-700 mb-4">
                  This interview uses AI proctoring to ensure fairness and integrity. 
                  Please review these important guidelines:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      icon: "👁️",
                      title: "Video Monitoring",
                      description: "Your webcam will record your session to verify your identity and attention"
                    },
                    {
                      icon: "🎤",
                      title: "Audio Recording",
                      description: "Your microphone will be active to capture your responses"
                    },
                    {
                      icon: "🚫",
                      title: "Restrictions",
                      description: "Tab switching, copy/paste, and other actions are monitored"
                    },
                    {
                      icon: "📝",
                      title: "Original Responses",
                      description: "All answers must be your own original work"
                    }
                  ].map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <h4 className="font-medium text-gray-800">{item.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Candidate Profile */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Profile Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Education</h4>
                    <p className="mt-1 text-gray-700">{applicant.Education || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Experience</h4>
                    <p className="mt-1 text-gray-700">{applicant.YearsOfExp} years</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Skills & Experience</h4>
                  <div className="prose max-w-none text-gray-700">
                    {applicant.FirstName.split('\n').slice(6).join('\n')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-500 text-sm mb-4 md:mb-0">
                <span className="font-medium">Meeting ID:</span> {meetingId}
              </div>
              <button
                onClick={startInterviewSession}
                disabled={startingInterview}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-md flex items-center disabled:opacity-70"
              >
                {startingInterview ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Start Interview Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewEntry;