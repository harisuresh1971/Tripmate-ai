import React, { useState } from 'react';
import { PaperAirplaneIcon } from './icons';
import { generateMockFlights } from '../services/geminiService';
import type { MockFlight } from '../types';

const FlightResultCard: React.FC<{ flight: MockFlight }> = ({ flight }) => (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
        <div className="flex items-center gap-4">
            <PaperAirplaneIcon className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
                <p className="font-bold text-white">{flight.airline} {flight.flightNumber}</p>
                <p className="text-sm text-gray-400">{flight.departureTime} - {flight.arrivalTime} ({flight.duration})</p>
                <p className="text-xs text-gray-500">{flight.stops} Stop(s)</p>
            </div>
        </div>
        <div className="text-left sm:text-right w-full sm:w-auto">
            <p className="text-xl font-bold text-primary-light">₹{flight.price.toLocaleString()}</p>
            <button className="mt-1 text-sm bg-primary text-white font-semibold py-1 px-3 rounded-full hover:bg-primary-dark transition-colors">Book Now</button>
        </div>
    </div>
);

const FlightBooking: React.FC = () => {
    const [from, setFrom] = useState('Chennai');
    const [to, setTo] = useState('Goa');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<MockFlight[]>([]);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResults([]);
        try {
            const flightResults = await generateMockFlights(from, to, date);
            setResults(flightResults);
        } catch (err) {
            setError('Failed to fetch flight results. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderResults = () => {
        if (loading) {
            return (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-full h-24 bg-white/5 rounded-2xl animate-pulse"></div>
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
                    {results.map((flight, i) => <FlightResultCard key={i} flight={flight} />)}
                </div>
            );
        }

        return null;
    };


    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">Book Your Flight</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">From</label>
                        <input type="text" value={from} onChange={e => setFrom(e.target.value)} placeholder="e.g., Chennai" className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">To</label>
                        <input type="text" value={to} onChange={e => setTo(e.target.value)} placeholder="e.g., Goa" className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white" />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Departure Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Passengers</label>
                        <input type="number" defaultValue="1" className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white" />
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:scale-100">
                    {loading ? 'Searching...' : 'Search Flights'}
                </button>
            </form>
             <div className="mt-8">
                {renderResults()}
            </div>
        </div>
    );
};

export default FlightBooking;