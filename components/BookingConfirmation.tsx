import React from 'react';
import type { Trip } from '../types';
import { CreditCardIcon } from './icons';

interface BookingConfirmationProps {
  trip: Trip;
  onConfirm: () => void;
  onBack: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ trip, onConfirm, onBack }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-black/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-white/10 animate-scale-in">
        <h2 className="text-2xl font-bold text-center mb-4 text-white">Review & Book Your Trip</h2>
        
        <div className="bg-white/5 p-4 rounded-xl mb-4">
          <h3 className="font-bold text-xl text-white">{trip.destination}</h3>
          <p className="text-sm text-gray-400">{trip.duration} Days for {trip.travelers} Travelers</p>
        </div>
        
        <div className="space-y-2 mb-6 text-white">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Base Package:</span>
            <span className="font-semibold">₹{trip.total_cost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Taxes & Fees (est.):</span>
            <span className="font-semibold">₹{(trip.total_cost * 0.08).toLocaleString()}</span>
          </div>
          <div className="border-t border-white/10 my-2"></div>
          <div className="flex justify-between items-center text-lg">
            <span className="font-bold">Total Payable:</span>
            <span className="font-extrabold text-primary-light">₹{(trip.total_cost * 1.08).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        
        <div className="flex flex-col space-y-3">
          <button 
            onClick={onConfirm}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform hover:scale-105"
          >
            <CreditCardIcon className="w-5 h-5 mr-2" />
            Proceed to Payment
          </button>
          <button 
            onClick={onBack}
            className="w-full text-center py-2 px-4 text-sm font-medium text-gray-300 hover:bg-white/10 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
