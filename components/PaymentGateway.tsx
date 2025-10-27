import React, { useState } from 'react';
import type { Trip } from '../types';
import { CreditCardIcon, CheckCircleIcon, UpiIcon } from './icons';

interface PaymentGatewayProps {
  trip: Trip;
  onPaymentSuccess: () => void;
  onClose: () => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ trip, onPaymentSuccess, onClose }) => {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const totalAmount = trip.total_cost * 1.08;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        onPaymentSuccess();
      }, 2000);
    }, 2500);
  };

  const renderCardForm = () => (
     <form onSubmit={handlePayment} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-300">Card Number</label>
          <div className="relative mt-1">
              <CreditCardIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
              <input type="text" placeholder="**** **** **** 1234" defaultValue="4242 4242 4242 4242" className="pl-10 w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white"/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-300">Expiry Date</label>
            <input type="text" placeholder="MM / YY" defaultValue="12 / 25" className="mt-1 w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white"/>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">CVC</label>
            <input type="text" placeholder="123" defaultValue="123" className="mt-1 w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white"/>
          </div>
        </div>
        <button 
          type="submit" 
          disabled={processing}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:bg-gray-600"
        >
          {processing ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString()}`}
        </button>
      </form>
  );
  
  const renderUpiForm = () => (
    <div className="flex flex-col items-center text-center">
        <div className="p-4 bg-white rounded-lg mb-4">
            <svg width="120" height="120" viewBox="0 0 100 100">
                <path d="M10 10 H 90 V 90 H 10 Z" fill="#fff"/>
                <path d="M20 20 H 30 V 30 H 20 Z M 40 20 H 50 V 30 H 40 Z M 60 20 H 80 V 40 H 60 Z M 20 40 H 30 V 50 H 20 Z M 45 45 H 55 V 55 H 45 Z M 70 45 H 80 V 55 H 70 Z M 20 60 H 40 V 80 H 20 Z M 60 60 H 80 V 80 H 60 Z" fill="#000"/>
            </svg>
        </div>
        <p className="text-sm text-gray-300">Scan QR or pay to UPI ID:</p>
        <p className="font-mono bg-white/10 px-3 py-1 rounded-md my-2 text-white">tripmate-ai@okhdfcbank</p>
        <p className="text-xs text-gray-500 mb-4">(This is a simulated payment for demonstration purposes only)</p>
         <button 
          onClick={(e) => handlePayment(e)} 
          disabled={processing}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:bg-gray-600"
        >
          {processing ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString()}`}
        </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[70] flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-black/20 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 animate-scale-in overflow-hidden">
        <div className="p-6">
          <div className="text-center text-white">
            <h2 className="text-xl font-bold">TripMate AI Secure Checkout</h2>
            <p className="text-sm text-gray-400">for {trip.destination}</p>
            <p className="text-3xl font-extrabold text-primary-light my-3">₹{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        {!success ? (
          <div className="p-6 bg-white/5">
            <div className="flex justify-center bg-black/20 p-1 rounded-full mb-6">
              <button onClick={() => setPaymentMethod('card')} className={`w-1/2 py-2 text-sm font-semibold rounded-full transition ${paymentMethod === 'card' ? 'bg-primary text-white' : 'text-gray-300'}`}>Card</button>
              <button onClick={() => setPaymentMethod('upi')} className={`w-1/2 py-2 text-sm font-semibold rounded-full transition ${paymentMethod === 'upi' ? 'bg-primary text-white' : 'text-gray-300'}`}>UPI / GPay</button>
            </div>
          
            {paymentMethod === 'card' ? renderCardForm() : renderUpiForm()}
            
            <button type="button" onClick={onClose} className="w-full text-center py-2 mt-2 text-sm font-medium text-gray-400">Cancel</button>
          </div>
        ) : (
          <div className="p-10 text-center flex flex-col items-center justify-center bg-green-900/20">
            <CheckCircleIcon className="w-16 h-16 text-green-400 mb-4 animate-pulse"/>
            <h3 className="text-xl font-bold text-green-200">Payment Successful!</h3>
            <p className="text-gray-300">Your trip is booked. Get ready for an adventure!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentGateway;
