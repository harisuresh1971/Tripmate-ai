import React, { useState, useRef, useEffect } from 'react';
import type { Trip, ChatMessage } from '../types';
import { SparklesIcon, MicrophoneIcon, StopCircleIcon } from './icons';
import { chatWithAI, connectLive, createBlob, decodeAudioData, decode } from '../services/geminiService';
import type { LiveServerMessage } from '@google/genai';

interface ChatAssistantProps {
    activeTrip: Trip | null;
}

type LiveStatus = "idle" | "connecting" | "active" | "error" | "stopped";

const ChatAssistant: React.FC<ChatAssistantProps> = ({ activeTrip }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: 'Hello! I am TripMate AI. Ask me for travel ideas, or select a trip to discuss specifics.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Live conversation state
    const [isLive, setIsLive] = useState(false);
    const [liveStatus, setLiveStatus] = useState<LiveStatus>("idle");
    const [transcription, setTranscription] = useState({ user: '', model: '' });
    const sessionPromiseRef = useRef<ReturnType<typeof connectLive> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<{ input: AudioContext, output: AudioContext, scriptProcessor: ScriptProcessorNode, sources: Set<AudioBufferSourceNode> } | null>(null);
    const nextStartTimeRef = useRef(0);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, transcription]);

    const handleSend = async () => {
        if (input.trim() === '' || loading) return;
        
        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const responseText = await chatWithAI(messages, input, activeTrip);
            const modelMessage: ChatMessage = { role: 'model', text: responseText };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I'm having trouble connecting. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };
    
    const stopLiveConversation = async () => {
        setIsLive(false);
        setLiveStatus("stopped");

        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.scriptProcessor.disconnect();
            audioContextRef.current.input.close();
            audioContextRef.current.output.close();
            audioContextRef.current = null;
        }
    };
    
    useEffect(() => {
        return () => {
           if(isLive) stopLiveConversation();
        }
    }, [isLive]);


    const startLiveConversation = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            setIsLive(true);
            setLiveStatus("connecting");
            
            const inputAudioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputAudioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            const sources = new Set<AudioBufferSourceNode>();
            nextStartTimeRef.current = 0;

            audioContextRef.current = { input: inputAudioContext, output: outputAudioContext, scriptProcessor, sources };
            
            const sessionPromise = connectLive(activeTrip, {
                onopen: () => {
                    setLiveStatus("active");
                    const source = inputAudioContext.createMediaStreamSource(stream);
                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        sessionPromise.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.outputTranscription) {
                        setTranscription(prev => ({ ...prev, model: prev.model + message.serverContent.outputTranscription.text }));
                    }
                    if (message.serverContent?.inputTranscription) {
                        setTranscription(prev => ({ ...prev, user: prev.user + message.serverContent.inputTranscription.text }));
                    }
                    if (message.serverContent?.turnComplete) {
                        if (transcription.user.trim() || transcription.model.trim()) {
                            setMessages(prev => [
                                ...prev,
                                { role: 'user', text: transcription.user.trim() || '(No speech detected)'},
                                { role: 'model', text: transcription.model.trim() }
                            ]);
                        }
                         setTranscription({ user: '', model: '' });
                    }

                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (base64Audio) {
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                        const sourceNode = outputAudioContext.createBufferSource();
                        sourceNode.buffer = audioBuffer;
                        sourceNode.connect(outputAudioContext.destination);
                        sourceNode.addEventListener('ended', () => sources.delete(sourceNode));
                        sourceNode.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        sources.add(sourceNode);
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Live session error:', e);
                    setLiveStatus("error");
                },
                onclose: (e: CloseEvent) => {
                    if(isLive) stopLiveConversation();
                },
            });
            sessionPromiseRef.current = sessionPromise;

        } catch (err) {
            console.error("Failed to get microphone access", err);
            setIsLive(false);
            setLiveStatus("error");
            alert("Could not access microphone. Please check your browser permissions.");
        }
    };
    
    const LiveStatusIndicator = () => {
        let text = "Start Live Conversation";
        let color = "text-gray-400";
        let pulse = false;
        if(isLive) {
            switch(liveStatus){
                case "connecting": text = "Connecting..."; color = "text-yellow-400"; pulse=true; break;
                case "active": text = "Listening..."; color = "text-green-400"; pulse=true; break;
                case "error": text = "Connection Error"; color = "text-red-400"; break;
                case "stopped": text = "Live session ended"; color = "text-gray-400"; break;
            }
        }
        return <span className={`text-xs font-semibold ${color} ${pulse ? 'animate-pulse' : ''}`}>{text}</span>
    }

    return (
        <div className="h-[75vh] flex flex-col bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl animate-fade-in-up overflow-hidden">
            <div className="p-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-white text-center">AI Assistant</h2>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <SparklesIcon className="w-6 h-6 text-primary flex-shrink-0 self-start" />}
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-md ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-black/20 text-gray-200 rounded-bl-none backdrop-blur-sm'}`}>
                           {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                        </div>
                    </div>
                ))}
                {loading && (
                     <div className="flex items-end gap-2 justify-start">
                        <SparklesIcon className="w-6 h-6 text-primary flex-shrink-0" />
                        <div className="px-4 py-3 rounded-2xl bg-black/20">
                            <div className="flex items-center space-x-1">
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300"></span>
                            </div>
                        </div>
                    </div>
                )}
                 {(isLive && (transcription.user || transcription.model)) && (
                    <div className="space-y-2">
                        {transcription.user && <div className="text-right text-gray-400 italic">You: {transcription.user}</div>}
                        {transcription.model && <div className="text-left text-primary-light italic">AI: {transcription.model}</div>}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-white/10 bg-black/10">
                <div className="flex items-center space-x-2">
                    {isLive ? (
                        <div className="w-full flex flex-col items-center">
                            <button onClick={stopLiveConversation} className="p-2 rounded-full text-red-400 hover:bg-red-900/50">
                                <StopCircleIcon className="w-8 h-8"/>
                            </button>
                             <LiveStatusIndicator />
                        </div>
                    ) : (
                    <>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask me anything..."
                            className="w-full px-4 py-2 bg-white/5 text-gray-200 border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-primary backdrop-blur-sm"
                            disabled={loading || isLive}
                        />
                         <button onClick={startLiveConversation} className="text-primary rounded-full p-2 hover:bg-primary/20">
                            <MicrophoneIcon className="w-6 h-6" />
                        </button>
                        <button onClick={handleSend} disabled={loading || isLive} className="bg-primary text-white rounded-full p-2 hover:bg-primary-dark disabled:bg-gray-600">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatAssistant;
