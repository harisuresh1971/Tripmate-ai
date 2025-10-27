import React, { useState } from 'react';
import FlightBooking from './FlightBooking';
import HotelBooking from './HotelBooking';
import CabBooking from './CabBooking';
import { PaperAirplaneIcon, BedIcon, CarIcon } from './icons';

const Bookings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('flights');

    const tabs = [
        { id: 'flights', label: 'Flights', icon: PaperAirplaneIcon },
        { id: 'hotels', label: 'Hotels', icon: BedIcon },
        { id: 'cabs', label: 'Cabs', icon: CarIcon },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'flights': return <FlightBooking />;
            case 'hotels': return <HotelBooking />;
            case 'cabs': return <CabBooking />;
            default: return null;
        }
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up">
             <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                <div className="flex justify-around border-b border-white/10 p-2">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center justify-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300
                                ${isActive ? 'bg-primary/20 text-primary-light' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                                <Icon className="w-5 h-5 mr-2" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>
                <div className="p-6">
                    {renderContent()}
                </div>
             </div>
        </div>
    );
};

export default Bookings;
