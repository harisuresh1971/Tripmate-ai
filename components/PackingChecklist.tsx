import React, { useState } from 'react';
import type { Trip } from '../types';
import { generatePackingChecklist } from '../services/geminiService';
import { ListIcon } from './icons';

interface PackingChecklistProps {
  trip: Trip | null;
}

const PackingChecklist: React.FC<PackingChecklistProps> = ({ trip }) => {
  const [checklist, setChecklist] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerateChecklist = async () => {
    if (!trip) return;
    setLoading(true);
    try {
      const list = await generatePackingChecklist(trip.destination, trip.duration, trip.interests);
      setChecklist(list);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl">
        <ListIcon className="w-24 h-24 text-primary mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Packing Checklist</h2>
        <p className="text-gray-400">
          This tool is available once you've planned a trip.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-primary-light mb-4">Packing Checklist for {trip.destination}</h2>
      {checklist.length === 0 ? (
        <div className="text-center py-8">
          <p className="mb-4 text-gray-400">Ready to pack? Let our AI create a smart checklist for you.</p>
          <button
            onClick={handleGenerateChecklist}
            disabled={loading}
            className="px-6 py-3 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-600 transition-transform hover:scale-105"
          >
            {loading ? 'Generating...' : 'Generate AI Checklist'}
          </button>
        </div>
      ) : (
        <div>
            <button onClick={() => setChecklist([])} className="text-sm text-primary hover:underline mb-4">Generate New List</button>
            <ul className="space-y-3">
            {checklist.map((item, index) => (
                <li key={index} className="flex items-center p-3 bg-white/5 rounded-lg">
                    <input id={`item-${index}`} type="checkbox" className="h-5 w-5 rounded border-gray-500 text-primary bg-transparent focus:ring-primary" />
                    <label htmlFor={`item-${index}`} className="ml-3 block text-md font-medium text-gray-300">{item}</label>
                </li>
            ))}
            </ul>
        </div>
      )}
    </div>
  );
};

export default PackingChecklist;
