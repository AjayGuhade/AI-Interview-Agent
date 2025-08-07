// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function UploadResume() {
//   const [file, setFile] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<string | null>(null);
//   const navigate = useNavigate()

  
  
//   const handleStartChat = () => {
//     navigate('/chat')
//   }
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selected = e.target.files?.[0];
//     if (selected) {
//       setFile(selected);
//       setResult(null); // reset previous result if any
//     }
//   };

//   const handleSubmit = async () => {
//     if (!file) return alert("Please select a resume first");

//     const formData = new FormData();
//     formData.append("resume", file);
//     setLoading(true);

//     try {
//       const res = await fetch("http://localhost:5050/api/upload-resume", {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) {
//         const text = await res.text();
//         console.error("❌ Server error:", text);
//         alert("Upload failed: " + text);
//         return;
//       }

//       const json = await res.json();
//       alert("✅ Resume processed: " + json.message);
//       setResult(json.result); // Display AI response
//     } catch (error) {
//       console.error("❌ Network error:", error);
//       alert("Failed to upload resume");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col gap-6 items-center justify-center">
//       <h1 className="text-3xl font-bold text-center">Upload Resume</h1>

//       <input
//         type="file"
//         accept=".pdf,.doc,.docx"
//         onChange={handleFileChange}
//         className="text-black"
//       />

//       {file && (
//         <p className="text-green-400">📎 Selected: {file.name}</p>
//       )}

//       <button
//         onClick={handleSubmit}
//         className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
//         disabled={loading}
//       >
//         {loading ? "Processing..." : "Submit to AI"}
//       </button>

//       {result && (
//         <div className="mt-6 w-full max-w-3xl bg-gray-800 p-4 rounded shadow">
//           <h2 className="text-xl font-semibold text-green-400 mb-2">
//             📊 AI Resume Analysis
//           </h2>
//           <pre className="whitespace-pre-wrap text-white">{result}</pre>
//           <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
//       <button
//         onClick={handleStartChat}
//         className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700"
//       >
//         Start A Chat
//       </button>
//     </div>        </div>
       
//       )}
//     </div>
//   );
// }
