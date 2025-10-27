import React, { useState } from 'react';
// FIX: StarIcon was not exported from icons.tsx. It has been added there, and this import is now correct.
import { BedIcon, StarIcon } from './icons';
import { generateMockHotels } from '../services/geminiService';
import type { MockHotel } from '../types';

// A simple StarIcon for ratings
const Star: React.FC<{ filled: boolean }> = ({ filled }) => (
    <StarIcon className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-600'}`} />
);

const HotelResultCard: React.FC<{ hotel: MockHotel }> = ({ hotel }) => (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col justify-between animate-fade-in">
        <div>
            <h3 className="font-bold text-white truncate">{hotel.name}</h3>
            <div className="flex items-center my-1">
                {[...Array(5)].map((_, i) => <Star key={i} filled={i < hotel.rating} />)}
                <span className="text-xs text-gray-400 ml-2">{hotel.rating.toFixed(1)}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
                {hotel.amenities.slice(0, 3).map(amenity => (
                    <span key={amenity} className="text-xs bg-primary/20 text-primary-light px-2 py-0.5 rounded-full">{amenity}</span>
                ))}
            </div>
        </div>
        <div className="mt-4 text-right">
            <p className="text-lg font-bold text-primary-light">₹{hotel.pricePerNight.toLocaleString()}</p>
            <p className="text-xs text-gray-400">per night</p>
        </div>
    </div>
);

const HotelBooking: React.FC = () => {
    const [destination, setDestination] = useState('Jaipur');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<MockHotel[]>([]);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResults([]);
        try {
            const hotelResults = await generateMockHotels(destination, checkIn, checkOut);
            setResults(hotelResults);
        } catch (err) {
            setError('Failed to fetch hotel results. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderResults = () => {
        if (loading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="w-full h-40 bg-white/5 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            );
        }
        
        if (error) {
            return <p className="text-center text-red-400">{error}</p>;
        }

        if (results.length > 0) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map((hotel, i) => <HotelResultCard key={i} hotel={hotel} />)}
                </div>
            );
        }

        return null;
    };


    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">Find Your Hotel</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Destination</label>
                    <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g., Jaipur" className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Check-in Date</label>
                        <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Check-out Date</label>
                        <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white" />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Guests</label>
                    <input type="number" defaultValue="2" className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white" />
                </div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:scale-100">
                    {loading ? 'Searching...' : 'Search Hotels'}
                </button>
            </form>
             <div className="mt-8">
                {renderResults()}
            </div>
        </div>
    );
};

export default HotelBooking;