
import React, { useState } from 'react';
import type { Trip, WeatherInfo, JournalEntry, Expense } from '../types';
import { getWeatherInfo } from '../services/geminiService';
import { SunIcon, MoonIcon, ListIcon, WalletIcon, BookOpenIcon, UsersIcon, ToolsIcon } from './icons';

interface ToolsProps {
    activeTrip: Trip | null;
}

const Weather: React.FC<{ destination: string }> = ({ destination }) => {
    const [weather, setWeather] = useState<WeatherInfo | null>(null);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchWeather = async () => {
            setLoading(true);
            try {
                const data = await getWeatherInfo(destination);
                setWeather(data);
            } catch (error) {
                console.error("Failed to fetch weather", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWeather();
    }, [destination]);

    if (loading) return <div className="p-4 text-center">Loading weather...</div>;
    if (!weather) return <div className="p-4 text-center">Could not load weather data.</div>;

    return (
        <>
            <h3 className="font-bold text-lg mb-4 text-center">Weather in {destination}</h3>
            <div className="text-center mb-4">
                <p className="text-4xl font-bold">{weather.current.temp}°C</p>
                <p className="text-gray-400">{weather.current.condition}</p>
            </div>
            <div className="space-y-2">
                {weather.forecast.slice(0, 3).map((day, i) => (
                    <div key={i} className="flex justify-between items-center text-sm p-2 bg-white/5 rounded-lg">
                        <span>{day.day}</span>
                        <span>{day.condition}</span>
                        <span>{day.temp_low}° / {day.temp_high}°</span>
                    </div>
                ))}
            </div>
        </>
    );
};

const CurrencyConverter: React.FC = () => {
    const [inr, setInr] = useState(100);
    const [usd, setUsd] = useState(1.2);
    const INR_TO_USD = 0.012;

    const handleInrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setInr(value);
        setUsd(parseFloat((value * INR_TO_USD).toFixed(2)));
    };

    const handleUsdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setUsd(value);
        setInr(parseFloat((value / INR_TO_USD).toFixed(2)));
    };

    return (
        <>
            <h3 className="font-bold text-lg mb-4 text-center">Currency Converter</h3>
            <div className="space-y-3">
                <div>
                    <label className="text-sm">INR (₹)</label>
                    <input type="number" value={inr} onChange={handleInrChange} className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white"/>
                </div>
                 <div>
                    <label className="text-sm">USD ($)</label>
                    <input type="number" value={usd} onChange={handleUsdChange} className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white"/>
                </div>
            </div>
        </>
    )
}

const ToolCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 h-full flex flex-col">
        {children}
    </div>
);

const Tools: React.FC<ToolsProps> = ({ activeTrip }) => {

    if (!activeTrip) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 h-full">
                <div className="p-6 bg-black/20 rounded-full mb-6 backdrop-blur-md">
                    <ToolsIcon className="w-16 h-16 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Traveler's Toolkit</h2>
                <p className="text-gray-400 max-w-sm">
                    Select a trip from the "My Trips" tab to unlock helpful tools like weather forecasts, currency converters, and more.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-4xl font-extrabold text-center text-white">Traveler's Toolkit</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ToolCard title="Weather">
                   <Weather destination={activeTrip.destination}/>
                </ToolCard>
                 <ToolCard title="Currency Converter">
                   <CurrencyConverter />
                </ToolCard>
                 <ToolCard title="Travel Journal">
                    <div className="text-center m-auto">
                        <BookOpenIcon className="w-10 h-10 mx-auto mb-2 text-primary"/>
                        <h3 className="font-bold text-lg mb-2">Travel Journal</h3>
                        <p className="text-sm text-gray-400">Feature coming soon to save your precious memories!</p>
                    </div>
                </ToolCard>
                 <ToolCard title="Expense Splitter">
                     <div className="text-center m-auto">
                        <UsersIcon className="w-10 h-10 mx-auto mb-2 text-primary"/>
                        <h3 className="font-bold text-lg mb-2">Expense Splitter</h3>
                        <p className="text-sm text-gray-400">Feature coming soon to easily split costs with friends!</p>
                    </div>
                </ToolCard>
            </div>
        </div>
    );
};

export default Tools;
