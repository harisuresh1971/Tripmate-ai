import React, { useState, useEffect } from 'react';
import { getRecommendations, generateImage } from '../services/geminiService';
import type { Trip, PlaceRecommendation } from '../types';
import { CompassIcon } from './icons';

const RecommendationCard: React.FC<{ place: PlaceRecommendation }> = ({ place }) => {
    return (
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-5 break-inside-avoid transform transition-transform duration-300 hover:-translate-y-1">
            <h3 className="font-bold text-lg text-primary-light">{place.name}</h3>
            <p className="text-sm text-gray-400 mt-2">{place.description}</p>
        </div>
    );
};


const Explore: React.FC<{ activeTrip: Trip | null }> = ({ activeTrip }) => {
    const [destination, setDestination] = useState(activeTrip?.destination || 'Goa');
    const [interests, setInterests] = useState(activeTrip?.interests || 'beaches, nightlife, Portuguese culture');
    const [recommendations, setRecommendations] = useState<PlaceRecommendation[]>([]);
    const [compositeImage, setCompositeImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleExplore = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true);
        setRecommendations([]);
        setCompositeImage(null);
        try {
            const { recommendations: results, compositeImagePrompt } = await getRecommendations(destination, interests);
            setRecommendations(results);
            if (compositeImagePrompt) {
                const imageUrl = await generateImage(compositeImagePrompt);
                setCompositeImage(imageUrl);
            }
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (activeTrip && recommendations.length === 0) {
            handleExplore();
        }
    }, [activeTrip]);
    
    const TitleSection = () => (
        <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-white">Explore Destinations</h2>
            <p className="text-gray-400 mt-2">Discover AI-curated places for any adventure.</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto">
            {!activeTrip && (
                <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-6">
                    <TitleSection />
                    <form onSubmit={handleExplore} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-grow w-full">
                            <label className="block text-sm font-medium text-gray-300">Destination</label>
                            <input type="text" value={destination} onChange={e => setDestination(e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white"/>
                        </div>
                        <div className="flex-grow w-full">
                            <label className="block text-sm font-medium text-gray-300">Interests</label>
                            <input type="text" value={interests} onChange={e => setInterests(e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/10 shadow-sm focus:border-primary focus:ring-primary text-white"/>
                        </div>
                        <button type="submit" disabled={loading} className="w-full md:w-auto flex justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-600">
                            {loading ? 'Searching...' : 'Explore'}
                        </button>
                    </form>
                </div>
            )}
            
            {(loading) && (
                <div className="text-center p-8">
                     <CompassIcon className="w-16 h-16 text-primary animate-spin mx-auto mb-4"/>
                     <p className="text-gray-400">Finding the best spots and creating a unique image for you...</p>
                </div>
            )}
            
            {!loading && recommendations.length > 0 && (
                <div className="space-y-6">
                    {activeTrip && <TitleSection />}
                    <div className="h-72 bg-gray-700 rounded-3xl shadow-2xl overflow-hidden relative flex items-center justify-center border border-white/10">
                         {compositeImage ? (
                            <img src={compositeImage} alt={`Highlights of ${destination}`} className="w-full h-full object-cover"/>
                        ) : (
                             <div className="w-full h-full bg-gray-700 animate-pulse flex items-center justify-center">
                                <p className="text-gray-400">Generating composite image...</p>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <h2 className="absolute bottom-5 left-5 text-4xl font-bold text-white" style={{textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>Top Spots in {destination}</h2>
                    </div>
                    <div className="columns-1 md:columns-2 gap-6 space-y-6">
                        {recommendations.map((place, index) => (
                            <RecommendationCard key={index} place={place} />
                        ))}
                    </div>
                </div>
            )}
             {!loading && recommendations.length === 0 && activeTrip && (
                 <div className="text-center p-8 bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl">
                    <CompassIcon className="w-16 h-16 text-primary mx-auto mb-4"/>
                    <h2 className="text-xl font-bold text-white">No recommendations generated yet.</h2>
                    <p className="text-gray-400 mt-2">The AI is preparing recommendations for your trip to {activeTrip.destination}.</p>
                </div>
            )}
        </div>
    );
};

export default Explore;
