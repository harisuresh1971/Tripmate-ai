import React, { useState } from 'react';
import { CarIcon } from './icons';
import { generateMockCabs } from '../services/geminiService';
import type { MockCab } from '../types';

const CabResultCard: React.FC<{ cab: MockCab }> = ({ cab }) => (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex justify-between items-center animate-fade-in">
        <div className="flex items-center gap-4">
            <CarIcon className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
                <p className="font-bold text-white">{cab.type}</p>
                <p className="text-sm text-gray-400">ETA: {cab.eta}</p>
            </div>
        </div>
        <div>
            <p className="text-lg font-bold text-primary-light">₹{cab.price.toLocaleString()}</p>
        </div>
    </div>
);

const CabBooking: React.FC = () => {
    const [pickup, setPickup] = useState('Jaipur Airport');
    const [dropoff, setDropoff] = useState('Hawa Mahal');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<MockCab[]>([]);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResults([]);
        try {
            const cabResults = await generateMockCabs(pickup, dropoff);
            setResults(cabResults);
        } catch (err) {
            setError('Failed to fetch cab results. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderResults = () => {
        if (loading) {
            return (
                <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="w-full h-20 bg-white/5 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            );
        }

        if (error) {
            return <p className="text-center text-red-400">{error}</p>;
        }

        if (results.length > 0) {
            return (
                <div className="space-y-4">
                    {results.map((cab, i) => <CabResultCard key={i} cab={cab} />)}
                </div>
            );
        }

        return null;
    };


    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">Book a Cab</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Pickup Location</label>
                        <input type="text" value={pickup} onChange={e => setPickup(e.target.value)} placeholder="e.g., Airport" className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Dropoff Location</label>
                        <input type="text" value={dropoff} onChange={e => setDropoff(e.target.value)} placeholder="e.g., Your Hotel" className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white" />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Pickup Time</label>
                    <input type="datetime-local" className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white" />
                </div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:scale-100">
                    {loading ? 'Searching...' : 'Find Cabs'}
                </button>
            </form>
             <div className="mt-8">
                {renderResults()}
            </div>
        </div>
    );
};

export default CabBooking;