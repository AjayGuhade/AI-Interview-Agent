// src/components/CodeEditor.tsx
import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

const CodeEditor: React.FC = () => {
  const [code, setCode] = useState("print('Hello, World!')");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      const response = await axios.post("https://judge0-ce.p.rapidapi.com/submissions", {
        source_code: code,
        language_id: 71, // Python 3
        stdin: ""
      }, {
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          "x-rapidapi-key": "Keyaa1ba61804msh88f9c85dedc961fp1bdd55jsn43e4942ee559"
        },
        params: { base64_encoded: "false", wait: "true" }
      });

      setOutput(response.data.stdout || response.data.stderr || "No output");
    } catch (error: any) {
      setOutput("Error: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <div className="mb-2 flex justify-between items-center">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="p-1 rounded border"
        >
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>
        <button
          onClick={handleRun}
          className="bg-green-600 text-white px-4 py-1 rounded"
          disabled={loading}
        >
          {loading ? "Running..." : "Run"}
        </button>
      </div>
      <Editor
        height="300px"
        defaultLanguage="python"
        defaultValue={code}
        onChange={(value) => setCode(value || "")}
      />
      <div className="mt-4">
        <h3 className="font-bold mb-2">Output:</h3>
        <pre className="bg-black text-green-400 p-3 rounded overflow-auto">
          {output}
        </pre>
      </div>
    </div>
  );
};

export default CodeEditor;
