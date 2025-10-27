import React, { useState } from 'react';
import { PlaneIcon, GoogleIcon } from './icons';

interface LoginScreenProps {
  onLogin: (name: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    } else if (email.trim()){
      onLogin(email.split('@')[0]); // Use part of email as name for demo
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-gray-900">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-[url('https://tailwindcss.com/_next/static/media/hero-dark@90.dba36cdf.jpg')] bg-cover bg-no-repeat animate-aurora"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
            <div className="inline-block p-4 bg-white/10 rounded-full backdrop-blur-sm">
                <PlaneIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold text-white mt-4 tracking-tight">TripMate AI</h1>
            <p className="mt-2 text-lg text-gray-300">Your intelligent travel companion.</p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl shadow-2xl animate-slide-in-up border border-white/10">
          <div className="flex mb-6 border-b border-white/10">
              <button onClick={() => setActiveTab('signin')} className={`w-1/2 pb-3 font-semibold transition-colors ${activeTab === 'signin' ? 'text-white border-b-2 border-primary' : 'text-gray-400'}`}>Sign In</button>
              <button onClick={() => setActiveTab('signup')} className={`w-1/2 pb-3 font-semibold transition-colors ${activeTab === 'signup' ? 'text-white border-b-2 border-primary' : 'text-gray-400'}`}>Sign Up</button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-gray-300 mb-1 text-sm">Name</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Hari" required className="w-full px-4 py-3 bg-white/10 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"/>
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-gray-300 mb-1 text-sm">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hari@example.com" required className="w-full px-4 py-3 bg-white/10 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"/>
            </div>
            <div>
              <label htmlFor="password" aria-label="Password" className="block text-gray-300 mb-1 text-sm">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full px-4 py-3 bg-white/10 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"/>
            </div>
            <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-primary/80 transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out">
              {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>
          
          <button onClick={() => onLogin('Hari (Google)')} className="w-full flex items-center justify-center bg-white/90 text-gray-800 font-semibold py-2.5 px-4 rounded-lg shadow-md hover:bg-white transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out">
            <GoogleIcon className="w-6 h-6 mr-3" />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;