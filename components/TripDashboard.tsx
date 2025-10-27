import React, { useState, useEffect } from 'react';
import type { Trip, Activity } from '../types';
import { generateImage } from '../services/geminiService';
import { UtensilsIcon, BedIcon, CarIcon, ActivityIcon, HomeIcon, CheckCircleIcon } from './icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import BudgetTracker from './BudgetTracker';
import PackingChecklist from './PackingChecklist';
import Wallet from './Wallet';

const ActivityIconMap: Record<Activity['type'], React.FC<any>> = {
    Food: UtensilsIcon,
    Accommodation: BedIcon,
    Transport: CarIcon,
    Activity: ActivityIcon,
    Miscellaneous: HomeIcon,
};

const ItineraryView: React.FC<{ trip: Trip }> = ({ trip }) => (
    <div className="space-y-6">
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6">
            <h3 className="text-xl font-bold mb-4 text-white">Daily Cost Visualizer</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trip.itinerary.map(day => ({ name: `Day ${day.day}`, cost: day.daily_cost }))} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <defs><linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00A8A8" stopOpacity={0.8}/><stop offset="95%" stopColor="#00A8A8" stopOpacity={0.1}/></linearGradient></defs>
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip cursor={{fill: 'rgba(148, 210, 189, 0.1)'}} contentStyle={{ backgroundColor: 'rgba(10,20,30,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#fff' }}/>
                    <Bar dataKey="cost" fill="url(#colorCost)" name="Daily Cost (INR)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
        {trip.itinerary.map((day) => (
            <div key={day.day} className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6">
                <h3 className="text-xl font-bold text-accent">Day {day.day}: {day.title}</h3>
                <p className="text-sm text-gray-400 mb-4">Estimated Cost: ₹{day.daily_cost.toLocaleString()}</p>
                <div className="border-l-2 border-primary/30 pl-6 space-y-4">
                    {day.activities.map((activity, index) => {
                        const Icon = ActivityIconMap[activity.type] || HomeIcon;
                        return (
                            <div key={index} className="flex items-start space-x-4 relative">
                                <div className="absolute -left-[34px] top-1 h-4 w-4 bg-primary rounded-full border-4 border-gray-800 ring-2 ring-primary/50"></div>
                                <div className="pt-0.5"><Icon className="w-5 h-5 text-primary"/></div>
                                <div className="flex-1">
                                    <p className="font-semibold text-white">{activity.time} - {activity.description}</p>
                                    <p className="text-xs text-gray-400">Cost: ₹{activity.estimated_cost.toLocaleString()} ({activity.type})</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        ))}
    </div>
);


const TripDashboard: React.FC<{ trip: Trip, onClose: () => void }> = ({ trip, onClose }) => {
    const [activeTab, setActiveTab] = useState('itinerary');
    const [destinationImage, setDestinationImage] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        const getImage = async () => {
            setImageLoading(true);
            const image = await generateImage(`A stunning, vibrant, ultra-realistic photograph of the main attractions in ${trip.destination}, capturing the essence of ${trip.interests}.`);
            setDestinationImage(image);
            setImageLoading(false);
        };
        getImage();
    }, [trip]);

    const TABS = ['itinerary', 'budget', 'checklist'];
    if (trip.status === 'booked') TABS.push('wallet');

    return (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-md overflow-y-auto animate-fade-in">
            <div className="relative min-h-full">
                <div className="absolute top-0 left-0 right-0 h-[40vh]">
                     {imageLoading ? (
                        <div className="w-full h-full bg-gray-700 animate-pulse" />
                    ) : destinationImage ? (
                        <img src={destinationImage} alt={trip.destination} className="w-full h-full object-cover animate-background-pan"/>
                    ) : (
                         <div className="w-full h-full bg-gray-700 flex items-center justify-center text-center p-4">
                            <p className="font-semibold text-gray-300">Could not generate trip image</p>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
                </div>

                <div className="relative px-4 sm:px-6 py-8">
                    <div className="mt-[25vh]">
                        <div className="flex justify-between items-start">
                             <div>
                                <h2 className="text-4xl sm:text-5xl font-extrabold text-white" style={{textShadow: '0 3px 15px rgba(0,0,0,0.6)'}}>{trip.destination}</h2>
                                <p className="text-gray-300 mt-1">{trip.duration} days for {trip.travelers} people</p>
                                 {trip.status === 'booked' && <div className="mt-2 inline-flex items-center text-xs font-bold bg-green-500/20 text-green-300 px-2 py-1 rounded-full"><CheckCircleIcon className="w-4 h-4 mr-1"/>BOOKED</div>}
                            </div>
                            <button onClick={onClose} className="text-sm bg-white/10 text-white px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors">Close</button>
                        </div>

                        <div className="my-6 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full shadow-lg p-1.5 flex justify-around space-x-1">
                            {TABS.map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)}
                                    className={`px-3 py-2 text-sm font-semibold capitalize transition w-full rounded-full ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-gray-300 hover:bg-white/10'}`}>
                                    {tab}
                                </button>
                            ))}
                        </div>
                        
                        <div className="mt-4 animate-fade-in-up">
                            {activeTab === 'itinerary' && <ItineraryView trip={trip} />}
                            {activeTab === 'budget' && <BudgetTracker trip={trip} />}
                            {activeTab === 'checklist' && <PackingChecklist trip={trip} />}
                            {activeTab === 'wallet' && <Wallet trip={trip} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default TripDashboard;
