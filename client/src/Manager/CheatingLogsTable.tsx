import React from 'react';

interface CheatingLog {
  _id: string;
  cheatingLogId: string;
  interviewId: string;
  type: string;
  screenshotUrl: string;
  actionTaken: string;
  generatedDate: string;
}

const CheatingLogsTable: React.FC<{ logs: CheatingLog[] }> = ({ logs }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-md">
      <table className="w-full text-left table-auto border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 border-b">Cheating Log ID</th>
            <th className="p-4 border-b">Interview ID</th>
            <th className="p-4 border-b">Type</th>
            <th className="p-4 border-b">Screenshot</th>
            <th className="p-4 border-b">Action Taken</th>
            <th className="p-4 border-b">Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log._id} className="hover:bg-gray-50">
              <td className="p-4 border-b">{log.cheatingLogId}</td>
              <td className="p-4 border-b">{log.interviewId}</td>
              <td className="p-4 border-b">{log.type}</td>
              <td className="p-4 border-b">
                <a href={log.screenshotUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline">View</a>
              </td>
              <td className="p-4 border-b">{log.actionTaken}</td>
              <td className="p-4 border-b">{new Date(log.generatedDate).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CheatingLogsTable;
