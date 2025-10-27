import React from 'react';
import type { Trip } from '../types';
import { MapPinIcon, CheckCircleIcon, BriefcaseIcon } from './icons';

interface MyTripsProps {
  allTrips: Trip[];
  onSelectTrip: (trip: Trip) => void;
}

const TripCard: React.FC<{ trip: Trip; onClick: () => void }> = ({ trip, onClick }) => (
    <button 
        onClick={onClick}
        className="relative w-72 h-96 rounded-3xl overflow-hidden flex-shrink-0 bg-gray-800 shadow-2xl transform transition-transform duration-500 hover:scale-105"
        style={{ perspective: '1000px' }}
    >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm border border-white/10 rounded-3xl p-6 flex flex-col justify-end text-left text-white">
            <div 
                className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full flex items-center
                ${trip.status === 'booked' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}
            >
                <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                {trip.status}
            </div>
            <div>
                <h3 className="text-3xl font-extrabold" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>{trip.destination}</h3>
                <p className="text-gray-300">{trip.duration} days for {trip.travelers} travelers</p>
            </div>
        </div>
    </button>
);

const MyTrips: React.FC<MyTripsProps> = ({ allTrips, onSelectTrip }) => {
    if (allTrips.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in-up">
                <div className="p-6 bg-black/20 rounded-full mb-6 backdrop-blur-md">
                    <BriefcaseIcon className="w-16 h-16 text-primary"/>
                </div>
                <h2 className="text-3xl font-bold text-white">No Trips Planned Yet</h2>
                <p className="text-gray-400 mt-2 max-w-sm">Use the plus button on the navigation dock to plan your first AI-powered adventure!</p>
            </div>
        )
    }

    return (
        <div className="animate-fade-in-up">
            <h2 className="text-4xl font-extrabold text-center mb-8 text-white">My Trips</h2>
            <div className="flex space-x-8 pb-8 overflow-x-auto snap-x snap-mandatory" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
                <div className="flex-shrink-0 w-1/2 sm:w-1/3"></div> {/* Spacer */}
                {allTrips.map(trip => (
                    <div key={trip.id} className="snap-center">
                        <TripCard trip={trip} onClick={() => onSelectTrip(trip)} />
                    </div>
                ))}
                <div className="flex-shrink-0 w-1/2 sm:w-1/3"></div> {/* Spacer */}
            </div>
        </div>
    )
};

export default MyTrips;
