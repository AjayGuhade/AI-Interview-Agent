import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  CheckCircleIcon,
  PlusIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ClockIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  CalendarIcon,
  PuzzlePieceIcon,
  LightBulbIcon
} from "@heroicons/react/24/outline";
import { useDropzone } from "react-dropzone";

type Company = {
  _id: string;
  CompanyID: number;
  companyName: string;
  companyEmail: string;
  location: string;
  websiteUrl: string;
  address: {
    line1: string;
    line2: string;
  };
  createdDate: string;
  __v: number;
};

type ProjectRecruitmentDrive = {
  ProjectRecruitmentDriveID: string;
  CompanyID: string;
  ProjectName: string;
  TechnicalKeySkills: string[];
  FunctionalKeySkills: string[];
  EducationQualification: string;
  YearsOfExp: number;
  ProjectManagerID: number;
  DifficultyLevel: "easy" | "medium" | "hard";
  EstimateStartDate: string;
  EstimateEndDate: string;
  Link: string;
  Description: string;
  Questions: string[];
  ResumeFiles: {
    name: string;
    path: string;
    size: number;
    type: string;
  }[];
  WarningExceedCount: number;
};

type FormData = {
  CompanyID: string;
  ProjectName: string;
  TechnicalKeySkills: string[];
  FunctionalKeySkills: string[];
  EducationQualification: string;
  YearsOfExp: number;
  ProjectManagerID: number;
  DifficultyLevel: "easy" | "medium" | "hard";
  EstimateStartDate: string;
  EstimateEndDate: string;
  Link: string;
  Description: string;
  Questions: string[];
  Resumes: File[];
  WarningExceedCount: number;
};

export default function CreateDrivePage() {
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [driveData, setDriveData] = useState<FormData>({
    CompanyID: "",
    ProjectName: "",
    TechnicalKeySkills: [],
    FunctionalKeySkills: [],
    EducationQualification: "B.Tech",
    YearsOfExp: 0,
    ProjectManagerID: 1,
    DifficultyLevel: "medium",
    EstimateStartDate: "",
    EstimateEndDate: "",
    Link: "",
    Description: "",
    Questions: [],
    Resumes: [],
    WarningExceedCount: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [googleDriveConnected, setGoogleDriveConnected] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("drives");

  const technicalSkillsOptions = ["JavaScript", "Python", "React", "Node.js", "MongoDB", "TypeScript", "AWS", "Docker"];
  const functionalSkillsOptions = ["Project Management", "Agile Methodology", "UI/UX", "Business Analysis", "Product Ownership", "Scrum Master"];
  const educationOptions = ["B.Tech", "B.E", "M.Tech", "MCA", "BCA", "B.Sc", "M.Sc", "Ph.D"];
  const difficultyOptions: ("easy" | "medium" | "hard")[] = ["easy", "medium", "hard"];

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch("http://localhost:5050/api/companies");
        if (!response.ok) {
          throw new Error("Failed to fetch company data");
        }
        const companies: Company[] = await response.json();
        if (companies.length > 0) {
          setCompany(companies[0]);
          setDriveData(prev => ({
            ...prev,
            CompanyID: companies[0]._id
          }));
        }
      } catch (err) {
        console.error("Error fetching company:", err);
        setError(err instanceof Error ? err.message : "Failed to load company data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!driveData.ProjectName.trim()) {
      errors.ProjectName = "Project name is required";
    }
    
    if (driveData.TechnicalKeySkills.length === 0) {
      errors.TechnicalKeySkills = "At least one technical skill is required";
    }
    
    if (!driveData.EstimateStartDate) {
      errors.EstimateStartDate = "Start date is required";
    }
    
    if (!driveData.EstimateEndDate) {
      errors.EstimateEndDate = "End date is required";
    } else if (new Date(driveData.EstimateStartDate) > new Date(driveData.EstimateEndDate)) {
      errors.EstimateEndDate = "End date must be after start date";
    }
    
    if (!driveData.Description.trim()) {
      errors.Description = "Description is required";
    }
    
    if (driveData.Questions.length === 0) {
      errors.Questions = "At least one question is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      setError("Some files were rejected. Only PDF, DOC, and DOCX files under 5MB are allowed.");
      return;
    }

    const newFiles = acceptedFiles.filter(
      file => !driveData.Resumes.some(f => f.name === file.name)
    );

    setDriveData(prev => ({
      ...prev,
      Resumes: [...prev.Resumes, ...newFiles]
    }));
    setError(null);
  }, [driveData.Resumes]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 5 * 1024 * 1024,
    multiple: true
  });

  const removeFile = (index: number) => {
    setDriveData(prev => {
      const newFiles = [...prev.Resumes];
      newFiles.splice(index, 1);
      return { ...prev, Resumes: newFiles };
    });
  };

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setDriveData(prev => ({
        ...prev,
        Questions: [...prev.Questions, newQuestion.trim()]
      }));
      setNewQuestion("");
      setFormErrors(prev => ({ ...prev, Questions: "" }));
    }
  };

  const removeQuestion = (index: number) => {
    setDriveData(prev => {
      const newQuestions = [...prev.Questions];
      newQuestions.splice(index, 1);
      return { ...prev, Questions: newQuestions };
    });
  };

  const connectGoogleDrive = () => {
    setGoogleDriveConnected(true);
    alert("Google Drive connected successfully! You can now access resumes from your Drive.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
  
    try {
      const formData = new FormData();
      
      formData.append('CompanyID', driveData.CompanyID);
      formData.append('ProjectName', driveData.ProjectName);
      formData.append('EducationQualification', driveData.EducationQualification);
      formData.append('YearsOfExp', driveData.YearsOfExp.toString());
      formData.append('ProjectManagerID', driveData.ProjectManagerID.toString());
      formData.append('DifficultyLevel', driveData.DifficultyLevel);
      formData.append('EstimateStartDate', driveData.EstimateStartDate);
      formData.append('EstimateEndDate', driveData.EstimateEndDate);
      formData.append('Link', driveData.Link);
      formData.append('Description', driveData.Description);
      formData.append('WarningExceedCount', driveData.WarningExceedCount.toString());
      
      formData.append('TechnicalKeySkills', JSON.stringify(driveData.TechnicalKeySkills));
      formData.append('FunctionalKeySkills', JSON.stringify(driveData.FunctionalKeySkills));
      formData.append('Questions', JSON.stringify(driveData.Questions));
  
      driveData.Resumes.forEach((file) => {
        formData.append('resumes', file);
      });
  
      const response = await fetch("http://localhost:5050/api/drive/upload", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create drive");
      }
  
      setShowSuccessModal(true);
      setTimeout(() => navigate("/drives"), 2000);
      
    } catch (err) {
      console.error("Error creating drive:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (type === 'checkbox') {
      const field = name.includes('Technical') ? 'TechnicalKeySkills' : 'FunctionalKeySkills';
      const skillValue = value;
      
      setDriveData(prev => {
        const currentArray = [...prev[field]];
        const newArray = checked 
          ? [...currentArray, skillValue]
          : currentArray.filter(item => item !== skillValue);
        
        if (field === 'TechnicalKeySkills' && newArray.length > 0) {
          setFormErrors(prev => ({ ...prev, TechnicalKeySkills: "" }));
        }
        
        return { ...prev, [field]: newArray };
      });
    } else if (type === 'number') {
      setDriveData(prev => ({
        ...prev,
        [name]: Number(value)
      }));
    } else {
      setDriveData(prev => ({
        ...prev,
        [name]: value
      }));
  
      if (value && formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: "" }));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <XMarkIcon className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-lg font-medium text-white">Failed to load company data</h3>
            <p className="mt-1 text-sm text-gray-400">Please try refreshing the page or contact support.</p>
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
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
            <ChartBarIcon className="h-5 w-5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("drives")}
            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${
              activeTab === "drives" ? "bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400" : "hover:bg-gray-700/50"
            }`}
          >
            <BriefcaseIcon className="h-5 w-5" />
            Placement Drives
          </button>
          <button
            onClick={() => navigate("/analytics")}
            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${
              activeTab === "analytics" ? "bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400" : "hover:bg-gray-700/50"
            }`}
          >
            <DocumentTextIcon className="h-5 w-5" />
            Analytics
          </button>
          <button
            onClick={() => navigate("/settings")}
            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${
              activeTab === "settings" ? "bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400" : "hover:bg-gray-700/50"
            }`}
          >
            <CogIcon className="h-5 w-5" />
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
        {/* Success Modal */}
        <Transition.Root show={showSuccessModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => {}}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                    <div>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                        <CheckCircleIcon className="h-6 w-6 text-green-400" />
                      </div>
                      <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">
                          Drive Created Successfully
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-400">
                            The recruitment drive has been successfully created.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-6">
                      <div className="mt-1 text-sm text-gray-500 text-center">
                        Redirecting to dashboard...
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BriefcaseIcon className="h-8 w-8 text-cyan-400" />
              Create New Recruitment Drive
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Fill out the form below to create a new recruitment drive for {company.companyName}.
            </p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg">
            {/* Company Header */}
            <div className="px-6 py-5 bg-blue-600/10 border-b border-blue-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <BriefcaseIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{company.companyName}</h2>
                    <p className="mt-1 text-sm text-blue-300">
                      {company.address.line1}, {company.address.line2}, {company.location}
                    </p>
                  </div>
                </div>
                <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
                  Active
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-700 p-6">
              {/* Error message display */}
              {error && (
                <div className="bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <XMarkIcon className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Project Information Section */}
              <div className="pt-6">
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="h-6 w-6 text-cyan-400" />
                  <h3 className="text-lg font-medium text-white">
                    Project Information
                  </h3>
                </div>
                <p className="mt-1 ml-9 text-sm text-gray-400">
                  Basic details about the recruitment drive.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label htmlFor="ProjectName" className="block text-sm font-medium text-gray-300">
                      Project Name *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="text"
                        id="ProjectName"
                        name="ProjectName"
                        value={driveData.ProjectName}
                        onChange={handleInputChange}
                        className={`block w-full bg-gray-700 border rounded-md shadow-sm ${
                          formErrors.ProjectName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 
                          'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                        } sm:text-sm text-white`}
                        placeholder="AI Interview Bot"
                      />
                      {formErrors.ProjectName && (
                        <p className="mt-2 text-sm text-red-400">{formErrors.ProjectName}</p>
                      )}
                    </div>
                  </div>

                  {/* Technical Skills */}
                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-300">
                      Technical Key Skills *
                    </label>
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {technicalSkillsOptions.map(skill => (
                          <div key={skill} className="relative flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id={`tech-skill-${skill}`}
                                name={`TechnicalKeySkills-${skill}`}
                                type="checkbox"
                                value={skill}
                                checked={driveData.TechnicalKeySkills.includes(skill)}
                                onChange={handleInputChange}
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-500 rounded bg-gray-700"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor={`tech-skill-${skill}`} className="font-medium text-gray-300">
                                {skill}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                      {formErrors.TechnicalKeySkills && (
                        <p className="mt-2 text-sm text-red-400">{formErrors.TechnicalKeySkills}</p>
                      )}
                    </div>
                  </div>

                  {/* Functional Skills */}
                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-300">
                      Functional Key Skills
                    </label>
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {functionalSkillsOptions.map(skill => (
                          <div key={skill} className="relative flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id={`func-skill-${skill}`}
                                name={`FunctionalKeySkills-${skill}`}
                                type="checkbox"
                                value={skill}
                                checked={driveData.FunctionalKeySkills.includes(skill)}
                                onChange={handleInputChange}
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-500 rounded bg-gray-700"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor={`func-skill-${skill}`} className="font-medium text-gray-300">
                                {skill}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Questions Section */}
                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-300">
                      Interview Questions *
                    </label>
                    <div className="mt-2">
                      <div className="space-y-3">
                        {driveData.Questions.map((question, index) => (
                          <div key={index} className="flex items-center bg-gray-700/50 rounded-md p-3">
                            <LightBulbIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                            <div className="ml-3 flex-1">
                              <p className="text-sm text-gray-200">{question}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeQuestion(index)}
                              className="ml-2 p-1 text-red-400 hover:text-red-300 rounded-full hover:bg-red-900/20"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex space-x-3">
                        <input
                          type="text"
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          placeholder="Add a new question"
                          className="flex-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-white"
                        />
                        <button
                          type="button"
                          onClick={addQuestion}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add
                        </button>
                      </div>
                      {formErrors.Questions && (
                        <p className="mt-2 text-sm text-red-400">{formErrors.Questions}</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-6">
                    <label htmlFor="Description" className="block text-sm font-medium text-gray-300">
                      Description *
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="Description"
                        name="Description"
                        rows={4}
                        value={driveData.Description}
                        onChange={handleInputChange}
                        className={`block w-full bg-gray-700 border rounded-md shadow-sm ${
                          formErrors.Description ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 
                          'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                        } sm:text-sm text-white`}
                        placeholder="Describe the project, team, and what you're looking for in candidates..."
                      />
                      {formErrors.Description && (
                        <p className="mt-2 text-sm text-red-400">{formErrors.Description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resume Upload Section */}
              <div className="pt-8">
                <div className="flex items-center gap-3">
                  <ArrowUpTrayIcon className="h-6 w-6 text-cyan-400" />
                  <h3 className="text-lg font-medium text-white">
                    Candidate Resumes
                  </h3>
                </div>
                <p className="mt-1 ml-9 text-sm text-gray-400">
                  Upload resumes or connect to Google Drive
                </p>

                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* File Upload */}
                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Upload Resumes (PDF, DOC, DOCX)
                    </label>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive ? 'border-blue-500 bg-blue-900/10' : 'border-gray-600 hover:border-blue-400'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <ArrowUpTrayIcon className="h-12 w-12 text-blue-400" />
                        {isDragActive ? (
                          <p className="text-sm font-medium text-blue-400">Drop the files here</p>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-gray-300">
                              Drag and drop files here, or click to select files
                            </p>
                            <p className="text-xs text-gray-500">
                              Supported formats: PDF, DOC, DOCX (Max 5MB each)
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Uploaded files preview */}
                    {driveData.Resumes.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Selected Files:</h4>
                        <ul className="border border-gray-700 rounded-md divide-y divide-gray-700">
                          {driveData.Resumes.map((file, index) => (
                            <li key={index} className="pl-4 pr-6 py-3 flex items-center justify-between text-sm hover:bg-gray-700/50">
                              <div className="w-0 flex-1 flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-blue-900/20 text-blue-400">
                                  {file.type.includes('pdf') ? 'PDF' : 'DOC'}
                                </div>
                                <div className="ml-4 flex-1 truncate">
                                  <div className="font-medium text-gray-200 truncate">{file.name}</div>
                                  <div className="text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                                </div>
                              </div>
                              <div className="ml-4 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="p-1 text-gray-400 hover:text-red-400 rounded-full hover:bg-gray-600"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Google Drive Integration */}
                  <div className="sm:col-span-6">
                    <div className={`border rounded-md p-5 ${
                      googleDriveConnected ? 'border-green-500/30 bg-green-900/10' : 'border-gray-600 bg-gray-700/50'
                    }`}>
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <img
                            className="h-10 w-10"
                            src="https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png"
                            alt="Google Drive"
                          />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-white">
                            Google Drive Integration
                          </h3>
                          <p className="text-sm text-gray-400">
                            {googleDriveConnected 
                              ? "Connected to Google Drive" 
                              : "Connect to access resumes from your Google Drive"}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <button
                            type="button"
                            onClick={connectGoogleDrive}
                            disabled={googleDriveConnected}
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                              googleDriveConnected ? 'bg-green-600/90' : 'bg-blue-600 hover:bg-blue-700'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                          >
                            {googleDriveConnected ? 'Connected' : 'Connect Drive'}
                          </button>
                        </div>
                      </div>
                      {googleDriveConnected && (
                        <div className="mt-4">
                          <label htmlFor="driveFolder" className="block text-sm font-medium text-gray-300 mb-1">
                            Google Drive Folder Link
                          </label>
                          <div className="flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-600 bg-gray-700 text-gray-400 text-sm">
                              https://drive.google.com/
                            </span>
                            <input
                              type="text"
                              id="driveFolder"
                              name="driveFolder"
                              className="bg-gray-700 text-white flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-600"
                              placeholder="drive/folders/abc123"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements Section */}
              <div className="pt-8">
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="h-6 w-6 text-cyan-400" />
                  <h3 className="text-lg font-medium text-white">
                    Candidate Requirements
                  </h3>
                </div>
                <p className="mt-1 ml-9 text-sm text-gray-400">
                  Specify the qualifications and experience needed.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Education Qualification */}
                  <div className="sm:col-span-3">
                    <label htmlFor="EducationQualification" className="block text-sm font-medium text-gray-300">
                      Education Qualification
                    </label>
                    <div className="mt-1">
                      <select
                        id="EducationQualification"
                        name="EducationQualification"
                        value={driveData.EducationQualification}
                        onChange={handleInputChange}
                        className="block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-white"
                      >
                        {educationOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Years of Experience */}
                  <div className="sm:col-span-3">
                    <label htmlFor="YearsOfExp" className="block text-sm font-medium text-gray-300">
                      Years of Experience
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        id="YearsOfExp"
                        name="YearsOfExp"
                        min="0"
                        max="30"
                        value={driveData.YearsOfExp}
                        onChange={handleInputChange}
                        className="block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-white"
                      />
                    </div>
                  </div>

                  {/* Project Manager ID */}
                  <div className="sm:col-span-3">
                    <label htmlFor="ProjectManagerID" className="block text-sm font-medium text-gray-300">
                      Project Manager ID
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        id="ProjectManagerID"
                        name="ProjectManagerID"
                        min="1"
                        value={driveData.ProjectManagerID}
                        onChange={handleInputChange}
                        className="block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-white"
                      />
                    </div>
                  </div>

                  {/* Difficulty Level */}
                  <div className="sm:col-span-3">
                    <label htmlFor="DifficultyLevel" className="block text-sm font-medium text-gray-300">
                      Difficulty Level *
                    </label>
                    <div className="mt-1">
                      <select
                        id="DifficultyLevel"
                        name="DifficultyLevel"
                        value={driveData.DifficultyLevel}
                        onChange={handleInputChange}
                        className="block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-white"
                      >
                        {difficultyOptions.map(option => (
                          <option key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Section */}
              <div className="pt-8">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-6 w-6 text-cyan-400" />
                  <h3 className="text-lg font-medium text-white">
                    Project Timeline
                  </h3>
                </div>
                <p className="mt-1 ml-9 text-sm text-gray-400">
                  Set the start and end dates for the recruitment drive.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Start Date */}
                  <div className="sm:col-span-3">
                    <label htmlFor="EstimateStartDate" className="block text-sm font-medium text-gray-300">
                      Estimate Start Date *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="date"
                        id="EstimateStartDate"
                        name="EstimateStartDate"
                        value={driveData.EstimateStartDate}
                        onChange={handleInputChange}
                        className={`block w-full bg-gray-700 border rounded-md shadow-sm ${
                          formErrors.EstimateStartDate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 
                          'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                        } sm:text-sm text-white`}
                      />
                      {formErrors.EstimateStartDate && (
                        <p className="mt-2 text-sm text-red-400">{formErrors.EstimateStartDate}</p>
                      )}
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="sm:col-span-3">
                    <label htmlFor="EstimateEndDate" className="block text-sm font-medium text-gray-300">
                      Estimate End Date *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="date"
                        id="EstimateEndDate"
                        name="EstimateEndDate"
                        value={driveData.EstimateEndDate}
                        onChange={handleInputChange}
                        className={`block w-full bg-gray-700 border rounded-md shadow-sm ${
                          formErrors.EstimateEndDate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 
                          'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                        } sm:text-sm text-white`}
                      />
                      {formErrors.EstimateEndDate && (
                        <p className="mt-2 text-sm text-red-400">{formErrors.EstimateEndDate}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="pt-8">
                <div className="flex items-center gap-3">
                  <PuzzlePieceIcon className="h-6 w-6 text-cyan-400" />
                  <h3 className="text-lg font-medium text-white">
                    Additional Information
                  </h3>
                </div>
                <p className="mt-1 ml-9 text-sm text-gray-400">
                  Provide any additional details about the recruitment drive.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Project Link */}
                  <div className="sm:col-span-6">
                    <label htmlFor="Link" className="block text-sm font-medium text-gray-300">
                      Project Link
                    </label>
                    <div className="mt-1">
                      <div className="flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-600 bg-gray-700 text-gray-400 text-sm">
                          <LinkIcon className="h-4 w-4" />
                        </span>
                        <input
                          type="url"
                          id="Link"
                          name="Link"
                          value={driveData.Link}
                          onChange={handleInputChange}
                          className="bg-gray-700 text-white flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-600"
                          placeholder="https://example.com/project-details"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Warning Exceed Count */}
                  <div className="sm:col-span-3">
                    <label htmlFor="WarningExceedCount" className="block text-sm font-medium text-gray-300">
                      Warning Threshold
                    </label>
                    <div className="mt-1">
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                        </div>
                        <input
                          type="number"
                          id="WarningExceedCount"
                          name="WarningExceedCount"
                          min="1"
                          max="10"
                          value={driveData.WarningExceedCount}
                          onChange={handleInputChange}
                          className="bg-gray-700 text-white block w-full pl-10 pr-12 border border-gray-600 rounded-md focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-400 sm:text-sm">candidates</span>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Number of candidates that triggers a warning when exceeded
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-8">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate("/drives")}
                    className="bg-gray-700 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      "Create Drive"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}