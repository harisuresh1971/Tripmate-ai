import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import MainLayout from './components/MainLayout';
import { Trip } from './types';
import BookingConfirmation from './components/BookingConfirmation';
import PaymentGateway from './components/PaymentGateway';
import TripPlanner from './components/TripPlanner';
import TripDashboard from './components/TripDashboard';
import { generateBookingDetails } from './services/geminiService';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode for the new UI
  const [userName, setUserName] = useState('');
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  
  // New state management for modals and overlays
  const [activeTripDetails, setActiveTripDetails] = useState<Trip | null>(null);
  const [showPlanner, setShowPlanner] = useState(false);
  const [tripToBook, setTripToBook] = useState<Trip | null>(null);
  const [showBookingConf, setShowBookingConf] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    // Lock to dark mode
    document.documentElement.classList.add('dark');
  }, []);

  const handleLogin = (name: string) => {
    setUserName(name);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUserName('');
    setIsLoggedIn(false);
    setAllTrips([]);
    setActiveTripDetails(null);
    setShowPlanner(false);
    setTripToBook(null);
    setShowBookingConf(false);
    setShowPayment(false);
  };

  const handlePlanGenerated = (newTripData: Omit<Trip, 'id' | 'status'>) => {
    const newTrip: Trip = {
      ...newTripData,
      id: Date.now().toString(),
      status: 'planning',
    };
    setAllTrips(prev => [newTrip, ...prev]);
    setTripToBook(newTrip);
    setShowPlanner(false);
    setShowBookingConf(true);
  };
  
  const handleConfirmBooking = () => {
    setShowBookingConf(false);
    setShowPayment(true);
  }

  const handlePaymentSuccess = async (tripId: string) => {
    if (!tripToBook || tripToBook.id !== tripId) return;

    const bookingDetails = await generateBookingDetails(tripToBook);
    
    const updatedTrip: Trip = {
      ...tripToBook,
      status: 'booked',
      bookings: bookingDetails,
    };

    setAllTrips(prev => 
      prev.map(t => t.id === tripId ? updatedTrip : t)
    );
    
    setShowPayment(false);
    setTripToBook(null);
    
    // Open the dashboard for the newly booked trip using the correct, updated object
    setActiveTripDetails(updatedTrip);
  };
  
  const handleSelectTrip = (trip: Trip) => {
    setActiveTripDetails(trip);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <>
      <MainLayout 
        userName={userName}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => {}} // Dark mode is locked
        allTrips={allTrips}
        onSelectTrip={handleSelectTrip}
        onShowPlanner={() => setShowPlanner(true)}
      />
      
      {showPlanner && (
        <TripPlanner 
          onPlanGenerated={handlePlanGenerated}
          onClose={() => setShowPlanner(false)}
        />
      )}

      {activeTripDetails && (
        <TripDashboard 
          trip={activeTripDetails}
          onClose={() => setActiveTripDetails(null)}
        />
      )}
      
      {showBookingConf && tripToBook && (
        <BookingConfirmation 
          trip={tripToBook}
          onConfirm={handleConfirmBooking}
          onBack={() => setShowBookingConf(false)}
        />
      )}

      {showPayment && tripToBook && (
        <PaymentGateway
          trip={tripToBook}
          onPaymentSuccess={() => handlePaymentSuccess(tripToBook.id)}
          onClose={() => {
            setShowPayment(false);
            setShowBookingConf(true);
          }}
        />
      )}
    </>
  );
};

export default App;