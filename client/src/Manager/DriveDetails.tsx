import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DriveAPI2, ApplicantAPI, EmailAPI } from '../services/api';

interface DriveDetails {
  _id: string;
  ProjectRecruitmentDriveID?: string;
  ProjectName: string;
  TechnicalKeySkills: string[];
  FunctionalKeySkills: string[];
  EducationQualification: string;
  YearsOfExp: number;
  DifficultyLevel: string;
  EstimateStartDate: string;
  EstimateEndDate: string;
  Link: string;
  Description: string;
  Questions: string[];
  ResumeFiles: Array<{
    name: string;
    path: string;
    size: number;
    type: string;
    uploadedAt: string;
  }>;
  WarningExceedCount?: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  CompanyID?: {
    _id: string;
    companyName: string;
  };
}

interface Applicant {
  _id: string;
  ProjectRecruitmentDriveID: string;
  MobileNumber: string;
  Email: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  DOB: string | null;
  Education: string;
  YearsOfExp: number;
  Resume: string;
  InterviewStatus: string;
  MeetingLink: string;
  MeetingStartDate: string | null;
  MeetingEndDate: string | null;
  Referance: string;
  IsApplicable: boolean;
  __v: number;
}

export default function DriveDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState<DriveDetails | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [emailContent, setEmailContent] = useState({
    subject: '',
    body: '',
    meetingLink: '',
    meetingDate: '',
    meetingTime: ''
  });
  const [sendingAllEmails, setSendingAllEmails] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
  
        // Fetch drive details
        const driveData = await DriveAPI2.getDriveById(id!);
        setDrive(driveData);
  
        // Fetch applicants
        const applicantsData = await ApplicantAPI.getApplicantsByDrive(id!);
        setApplicants(applicantsData.applicants || []);
  
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);
  
  const handleSendEmail = async () => {
    if (!selectedApplicant) return;
  
    try {
      const result = await EmailAPI.sendEmail(selectedApplicant._id, emailContent);
      alert(result.message || "Email sent successfully!");
      setShowEmailModal(false);
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email");
    }
  };
  
  const handleSendEmailToAll = async () => {
    if (!applicants.length) return;
  
    try {
      setSendingAllEmails(true);
      const failedEmails: string[] = [];
      let successCount = 0;
  
      for (const applicant of applicants) {
        try {
          await EmailAPI.sendEmail(applicant._id, {
            subject: `Interview Invitation for ${drive?.ProjectName || "Position"}`,
            body: `Dear ${applicant.FirstName?.trim() || "Candidate"}, ...`,
            meetingLink: applicant.MeetingLink || "",
            meetingDate: applicant.MeetingStartDate
              ? new Date(applicant.MeetingStartDate).toISOString().split("T")[0]
              : "",
            meetingTime: applicant.MeetingStartDate
              ? new Date(applicant.MeetingStartDate).toTimeString().substring(0, 5)
              : "",
          });
          successCount++;
        } catch (error) {
          console.error(`Error sending to ${applicant.Email}:`, error);
          failedEmails.push(applicant.Email);
        }
      }
  
      setSendingAllEmails(false);
      if (failedEmails.length === 0) {
        alert(`Successfully sent emails to all ${successCount} candidates!`);
      } else {
        alert(
          `Sent to ${successCount} candidates. Failed to send to: ${failedEmails.join(", ")}`
        );
      }
    } catch (error) {
      setSendingAllEmails(false);
      console.error("Error in batch email sending:", error);
      alert("Error sending batch emails");
    }
  };

  const handleEmailClick = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setEmailContent({
      subject: `Interview Invitation for ${drive?.ProjectName || 'Position'}`,
      body: `Dear ${applicant.FirstName?.trim() || 'Candidate'},

We are pleased to invite you for an interview regarding the ${drive?.ProjectName || ''} position.

Please find the meeting details below:
Meeting Link: ${applicant.MeetingLink || ''}
Date: ${applicant.MeetingStartDate ? new Date(applicant.MeetingStartDate).toLocaleDateString() : ''}
Time: ${applicant.MeetingStartDate ? new Date(applicant.MeetingStartDate).toLocaleTimeString() : ''}

Best regards,
Recruitment Team`,
      meetingLink: applicant.MeetingLink || '',
      meetingDate: applicant.MeetingStartDate ? new Date(applicant.MeetingStartDate).toISOString().split('T')[0] : '',
      meetingTime: applicant.MeetingStartDate ? new Date(applicant.MeetingStartDate).toTimeString().substring(0, 5) : ''
    });
    setShowEmailModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="p-6 text-red-400 bg-red-900/20 rounded-lg max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-2">Error Loading Drive</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!drive) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="p-6 text-red-400 bg-red-900/20 rounded-lg max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-2">Drive Not Found</h2>
          <p className="mb-4">The requested drive could not be loaded.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl font-bold text-white">{drive.ProjectName}</h1>
                <div className="flex items-center mt-2">
                  {drive.CompanyID?.companyName && (
                    <span className="bg-gray-600 px-3 py-1 rounded-full text-sm mr-3">
                      {drive.CompanyID.companyName}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    drive.DifficultyLevel === 'easy' ? 'bg-green-500/20 text-green-400' :
                    drive.DifficultyLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {drive.DifficultyLevel}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors self-start sm:self-auto"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="bg-gray-700/50 p-5 rounded-lg">
                  <h2 className="text-xl font-semibold mb-3 text-white">Project Details</h2>
                  <p className="text-gray-300">{drive.Description}</p>
                </div>

                <div className="bg-gray-700/50 p-5 rounded-lg">
                  <h2 className="text-xl font-semibold mb-3 text-white">Timeline</h2>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Start Date</p>
                      <p className="text-lg font-medium text-white">
                        {new Date(drive.EstimateStartDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex-1 border-t-2 border-dashed border-gray-500"></div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">End Date</p>
                      <p className="text-lg font-medium text-white">
                        {new Date(drive.EstimateEndDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700/50 p-5 rounded-lg">
                  <h2 className="text-xl font-semibold mb-3 text-white">Requirements</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Education</p>
                      <p className="text-white">{drive.EducationQualification}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Experience</p>
                      <p className="text-white">{drive.YearsOfExp} years</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="bg-gray-700/50 p-5 rounded-lg">
                  <h2 className="text-xl font-semibold mb-3 text-white">Technical Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {drive.TechnicalKeySkills?.map((skill, index) => (
                      <span 
                        key={index} 
                        className="bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-md text-sm flex items-center"
                      >
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-700/50 p-5 rounded-lg">
                  <h2 className="text-xl font-semibold mb-3 text-white">Functional Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {drive.FunctionalKeySkills?.map((skill, index) => (
                      <span 
                        key={index} 
                        className="bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded-md text-sm flex items-center"
                      >
                        <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-700/50 p-5 rounded-lg">
                  <h2 className="text-xl font-semibold mb-3 text-white">Interview Questions</h2>
                  {drive.Questions?.length > 0 ? (
                    <ul className="space-y-3">
                      {drive.Questions.map((question, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-gray-400 mr-2 mt-1">•</span>
                          <span className="text-gray-300">{question}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 italic">No questions provided</p>
                  )}
                </div>
              </div>
            </div>

            {/* Candidates Section */}
            <div className="mt-10">
              <div className="bg-gray-700/50 p-5 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">Registered Candidates ({applicants.length})</h2>
                  {applicants.length > 0 && (
                    <button
                      onClick={handleSendEmailToAll}
                      disabled={sendingAllEmails}
                      className={`px-4 py-2 rounded-lg flex items-center ${
                        sendingAllEmails 
                          ? 'bg-gray-600 text-gray-400' 
                          : 'bg-green-600 hover:bg-green-500 text-white'
                      }`}
                    >
                      {sendingAllEmails ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          Email All
                        </>
                      )}
                    </button>
                  )}
                </div>
                {applicants.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-600">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Meeting Details</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800 divide-y divide-gray-600">
                        {applicants.map((applicant) => (
                          <tr key={applicant._id} className="hover:bg-gray-700/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-600 rounded-full flex items-center justify-center">
                                  <span className="text-gray-300">
                                    {applicant.FirstName?.charAt(0) || 'A'}{applicant.LastName?.charAt(0) || 'B'}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-white">
                                    {applicant.FirstName} {applicant.LastName}
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {applicant.MobileNumber}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {applicant.Email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                applicant.InterviewStatus === 'Scheduled' ? 'bg-green-500/20 text-green-400' :
                                applicant.InterviewStatus === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {applicant.InterviewStatus || 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {applicant.MeetingLink ? (
                                <div>
                                  <a href={applicant.MeetingLink} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                    Join Meeting
                                  </a>
                                  <div>
                                    {applicant.MeetingStartDate && new Date(applicant.MeetingStartDate).toLocaleString()}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-500">Not scheduled</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEmailClick(applicant)}
                                className="text-green-400 hover:text-green-300 mr-4"
                              >
                                Send Email
                              </button>
                              <button
                                onClick={() => window.open(`http://localhost:5050/uploads/resumes/${applicant.Resume}`, '_blank')}
                                className="text-cyan-400 hover:text-cyan-300"
                              >
                                View Resume
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-700 p-6 rounded-lg text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-400">No candidates registered yet</h3>
                    <p className="mt-1 text-gray-500">Candidates who apply will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Resumes Section */}
            <div className="mt-10">
              <div className="bg-gray-700/50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-white">Resumes</h2>
                {drive.ResumeFiles?.length > 0 ? (
                  <div className="space-y-3">
                    {drive.ResumeFiles.map((file, index) => (
                      <div 
                        key={index} 
                        className="bg-gray-700 p-4 rounded-lg flex justify-between items-center hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="bg-gray-600 p-2 rounded-lg mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-white">{file.name}</p>
                            <p className="text-sm text-gray-400">
                              {file.type} • {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => window.open(`http://localhost:5050/${file.path}`, '_blank')}
                          className="text-cyan-400 hover:text-cyan-300 px-4 py-2 bg-cyan-500/10 rounded-lg flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-700 p-6 rounded-lg text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-400">No resumes uploaded yet</h3>
                    <p className="mt-1 text-gray-500">Uploaded resumes will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Send Email to Candidate</h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">To</label>
                  <input
                    type="email"
                    value={selectedApplicant.Email}
                    readOnly
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailContent.subject}
                    onChange={(e) => setEmailContent({...emailContent, subject: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Meeting Link</label>
                  <input
                    type="text"
                    value={emailContent.meetingLink}
                    onChange={(e) => setEmailContent({...emailContent, meetingLink: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="https://meet.google.com/abc-xyz-123"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Meeting Date</label>
                    <input
                      type="date"
                      value={emailContent.meetingDate}
                      onChange={(e) => setEmailContent({...emailContent, meetingDate: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Meeting Time</label>
                    <input
                      type="time"
                      value={emailContent.meetingTime}
                      onChange={(e) => setEmailContent({...emailContent, meetingTime: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email Body</label>
                  <textarea
                    value={emailContent.body}
                    onChange={(e) => setEmailContent({...emailContent, body: e.target.value})}
                    rows={10}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmail}
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Send Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}