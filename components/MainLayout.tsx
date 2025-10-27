import React, { useState } from 'react';
import type { Trip } from '../types';
import ChatAssistant from './ChatAssistant';
import Explore from './Explore';
import Tools from './Tools';
import MyTrips from './MyTrips';
import Bookings from './Bookings'; // Import the new Bookings component
import { PlusCircleIcon, LogoutIcon, SparklesIcon, CompassIcon, BriefcaseIcon, ToolsIcon, TicketIcon } from './icons';

interface MainLayoutProps {
  userName: string;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  allTrips: Trip[];
  onSelectTrip: (trip: Trip) => void;
  onShowPlanner: () => void;
}

type NavId = 'mytrips' | 'explore' | 'book' | 'tools' | 'assistant';

const MainLayout: React.FC<MainLayoutProps> = ({ userName, onLogout, allTrips, onSelectTrip, onShowPlanner }) => {
  const [activeNav, setActiveNav] = useState<NavId>('mytrips');
  
  // FIX: Derive context from props to prevent stale state. Always use the most recent trip.
  const activeTripForContext = allTrips.length > 0 ? allTrips[0] : null;

  const renderView = () => {
    switch (activeNav) {
      case 'mytrips':
        return <MyTrips allTrips={allTrips} onSelectTrip={onSelectTrip} />;
      case 'explore':
        return <Explore activeTrip={activeTripForContext} />;
      case 'book':
        return <Bookings />; // Render the Bookings component
      case 'tools':
        return <Tools activeTrip={activeTripForContext} />;
      case 'assistant':
        return <ChatAssistant activeTrip={activeTripForContext} />;
      default:
        return <MyTrips allTrips={allTrips} onSelectTrip={onSelectTrip} />;
    }
  };

  const navItems = [
    { id: 'mytrips', label: 'My Trips', icon: BriefcaseIcon },
    { id: 'explore', label: 'Explore', icon: CompassIcon },
    { id: 'book', label: 'Book', icon: TicketIcon }, // Add Book to nav
    { id: 'tools', label: 'Tools', icon: ToolsIcon },
    { id: 'assistant', label: 'Assistant', icon: SparklesIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <header className="sticky top-0 z-40 bg-transparent px-4 sm:px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-accent">TripMate AI</h1>
          <p className="text-sm text-gray-400">Welcome back, {userName}!</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={onLogout} className="p-2 rounded-full text-red-400 hover:bg-white/10 transition-colors">
            <LogoutIcon className="w-6 h-6" />
          </button>
        </div>
      </header>
      
      <main className="flex-grow p-4 sm:p-6 pb-28">
        <div className="animate-fade-in">
          {renderView()}
        </div>
      </main>

      {/* Floating Dock Navigation */}
      <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-sm">
        <div className="bg-black/20 backdrop-blur-xl rounded-full shadow-2xl border border-white/10 flex justify-around items-center p-2 relative">
            {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveNav(item.id as NavId)}
                        className={`relative flex flex-col items-center justify-center h-14 w-14 rounded-full transition-all duration-300 ease-in-out z-10
                            ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                        aria-label={item.label}
                    >
                        <Icon className="w-6 h-6" />
                        <span className={`text-[10px] mt-1 font-semibold transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0'}`}>{item.label}</span>
                    </button>
                )
            })}
             <button
                onClick={onShowPlanner}
                className="absolute right-[-20px] top-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-300"
                aria-label="Plan New Trip"
            >
                <PlusCircleIcon className="w-8 h-8" />
            </button>
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;