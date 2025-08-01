import React from 'react';

interface SummaryCardsProps {
  totalInterviews: number;
  totalCheatingIncidents: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ totalInterviews, totalCheatingIncidents }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-xl font-semibold">Total Interviews</h2>
        <p className="text-3xl text-blue-600 mt-2">{totalInterviews}</p>
      </div>
      <div className="p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-xl font-semibold">Cheating Incidents</h2>
        <p className="text-3xl text-red-600 mt-2">{totalCheatingIncidents}</p>
      </div>
    </div>
  );
};

export default SummaryCards;
