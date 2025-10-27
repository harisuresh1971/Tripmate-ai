import React, { useState } from 'react';
import { generateItinerary } from '../services/geminiService';
import type { Trip } from '../types';
import { PlaneIcon } from './icons';

interface TripPlannerProps {
  onPlanGenerated: (tripData: Omit<Trip, 'id' | 'status'>) => void;
  onClose: () => void;
}

const TripPlanner: React.FC<TripPlannerProps> = ({ onPlanGenerated, onClose }) => {
    const [destination, setDestination] = useState('Jaipur');
    const [duration, setDuration] = useState(4);
    const [budget, setBudget] = useState(25000);
    const [travelers, setTravelers] = useState(2);
    const [interests, setInterests] = useState('historical forts, vibrant markets, Rajasthani cuisine, cultural experiences');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const result = await generateItinerary(destination, duration, budget, travelers, interests);
            onPlanGenerated({ destination, duration, budget, travelers, interests, ...result });
        } catch (error) {
            const errorMessage = (error as Error).message || "An unknown error occurred.";
            setError(`Failed to generate itinerary. ${errorMessage}`);
            setLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-end justify-center animate-fade-in" onClick={onClose}>
            <div 
              className="w-full max-w-2xl bg-black/20 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl p-6 sm:p-8 animate-slide-in-up"
              onClick={e => e.stopPropagation()}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                    <PlaneIcon className="w-16 h-16 text-primary animate-pulse mb-4"/>
                    <h2 className="text-2xl font-bold text-white">Crafting your perfect journey...</h2>
                    <p className="text-gray-400 mt-2">Our AI is analyzing the best spots and experiences for you. This might take a moment.</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                      <h2 className="text-3xl font-bold text-white">Plan Your Next Adventure</h2>
                      <p className="text-gray-400">Fill in the details and let AI do the heavy lifting.</p>
                  </div>
                  {error && <div className="bg-red-900/50 border border-red-400 text-red-300 px-4 py-3 rounded-lg relative mb-4" role="alert">{error}</div>}
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-300">Destination</label>
                              <input type="text" value={destination} onChange={e => setDestination(e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white"/>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-300">Duration (days)</label>
                              <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white"/>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-300">Budget (INR)</label>
                              <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white"/>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-300">Travelers</label>
                              <input type="number" value={travelers} onChange={e => setTravelers(Number(e.target.value))} className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white"/>
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-300">Interests (e.g., food, history, adventure)</label>
                          <input type="text" value={interests} onChange={e => setInterests(e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white"/>
                      </div>
                      <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-600 transition-all transform hover:scale-105">
                          Plan My Trip with AI
                      </button>
                  </form>
                </>
              )}
            </div>
        </div>
    );
};

export default TripPlanner;
