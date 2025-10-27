import { GoogleGenAI, Type, Modality, LiveServerMessage, Blob } from "@google/genai";
import type { Trip, ItineraryDay, PlaceRecommendation, ChatMessage, WeatherInfo, Activity, MockFlight, MockHotel, MockCab } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MAX_RETRIES = 3;

const withRetry = async <T>(apiCall: () => Promise<T>): Promise<T> => {
  let lastError: Error | null = null;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      if (error instanceof Error && (error.message.includes('429') || error.message.includes('503'))) {
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
        console.warn(`API call failed. Retrying in ${delay.toFixed(2)}ms... (Attempt ${i + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error(`API call failed after ${MAX_RETRIES} retries: ${lastError?.message}`);
};

const activitySchema = {
    type: Type.OBJECT,
    properties: {
        time: { type: Type.STRING, description: "Suggested time for the activity, e.g., '9:00 AM'." },
        description: { type: Type.STRING, description: "Detailed description of the activity." },
        estimated_cost: { type: Type.NUMBER, description: "Estimated cost for this activity in INR." },
        type: {
            type: Type.STRING,
            description: "Category of the activity.",
            enum: ['Food', 'Accommodation', 'Transport', 'Activity', 'Miscellaneous']
        }
    },
    required: ["time", "description", "estimated_cost", "type"],
};

const itinerarySchema = {
  type: Type.OBJECT,
  properties: {
    itinerary: {
      type: Type.ARRAY,
      description: "A detailed day-by-day itinerary for the trip.",
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER, description: "Day number of the itinerary." },
          title: { type: Type.STRING, description: "A catchy title for the day's plan." },
          activities: {
            type: Type.ARRAY,
            description: "A list of activities for the day.",
            items: activitySchema,
          },
          daily_cost: { type: Type.NUMBER, description: "Total estimated cost for the day in INR." },
        },
        required: ["day", "title", "activities", "daily_cost"],
      },
    },
    total_cost: { type: Type.NUMBER, description: "Total estimated cost for the entire trip in INR." },
  },
  required: ["itinerary", "total_cost"],
};

export const generateItinerary = async (
  destination: string,
  duration: number,
  budget: number,
  travelers: number,
  interests: string
): Promise<{ itinerary: ItineraryDay[]; total_cost: number }> => {
  return withRetry(async () => {
      const prompt = `
        Plan a detailed travel itinerary for a trip to ${destination} for ${duration} days.
        The total budget is ₹${budget} for ${travelers} people.
        Their interests include: ${interests}.
        Provide a day-by-day plan with specific activities, suggested times, estimated costs in INR, and a category for each activity ('Food', 'Accommodation', 'Transport', 'Activity', 'Miscellaneous').
        Calculate the total daily cost and the grand total cost for the trip.
        Ensure the total cost is within the specified budget.
        The output must be in JSON format and adhere to the provided schema.
        Focus on providing realistic and valuable recommendations for an Indian traveler.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: itinerarySchema,
        },
      });
      
      const parsedResponse = JSON.parse(response.text);
      return parsedResponse;
  });
};


export const generatePackingChecklist = async (
  destination: string,
  duration: number,
  tripType: string
): Promise<string[]> => {
    return withRetry(async () => {
        const prompt = `
        Create a concise packing checklist for a ${duration}-day trip to ${destination}.
        The traveler's interests are "${tripType}".
        Provide the checklist as a simple JSON array of strings. For example: ["T-shirts", "Jeans", "Passport"].
        `;

        const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING
            }
            }
        }
        });

        return JSON.parse(response.text);
    });
};

export const generateImage = async (prompt: string): Promise<string | null> => {
    try {
        const data = await withRetry(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [{ text: `${prompt} --style photorealistic, cinematic lighting, 8k, vibrant colors` }]
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    return `data:image/jpeg;base64,${base64ImageBytes}`;
                }
            }
            return null;
        });
        return data;
    } catch (error) {
        console.error("Error generating image after retries:", error);
        return null;
    }
};

export const getRecommendations = async (destination: string, interests: string): Promise<{ recommendations: PlaceRecommendation[], compositeImagePrompt: string }> => {
    return withRetry(async () => {
        const prompt = `
            Based on the destination "${destination}" and interests "${interests}", recommend 5 must-visit places or activities.
            For each recommendation, provide a short, compelling description (around 20-30 words).
            After listing the 5 recommendations, provide a single, separate, and highly detailed prompt for an AI image generator. This single prompt should create a beautiful, vibrant, photorealistic composite image or collage that creatively represents all 5 recommended places together in one picture.
            Return the result as a JSON object.
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                         recommendations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                },
                                required: ["name", "description"],
                            },
                        },
                        compositeImagePrompt: {
                            type: Type.STRING,
                            description: "A single prompt for an AI image generator to create a composite image of all recommendations."
                        }
                    },
                    required: ["recommendations", "compositeImagePrompt"],
                },
            },
        });
        return JSON.parse(response.text);
    });
};

export const chatWithAI = async (
  history: ChatMessage[],
  newMessage: string,
  tripContext: Trip | null
): Promise<string> => {
  try {
    return await withRetry(async () => {
        let contextPrompt = "You are TripMate AI, a friendly and helpful travel assistant for Indian users. Be concise and helpful.";
        if (tripContext) {
        contextPrompt += `\n\nThe user has an active trip plan to ${tripContext.destination} for ${tripContext.duration} days. Here's a summary:
        - Budget: ₹${tripContext.budget.toLocaleString()}
        - Total Estimated Cost: ₹${tripContext.total_cost.toLocaleString()}
        - Interests: ${tripContext.interests}
        Use this information to answer questions related to their current trip.`;
        }

        const contents = history.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }],
        }));
        contents.push({ role: 'user', parts: [{ text: newMessage }] });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
              systemInstruction: contextPrompt
            }
        });

        return response.text;
    });
  } catch (error) {
    console.error("Error in AI chat:", error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
};

export const getWeatherInfo = async (destination: string): Promise<WeatherInfo> => {
    return withRetry(async () => {
        const prompt = `Generate a realistic weather forecast for ${destination} for the next 5 days, starting today.
        Provide the current weather and a 5-day forecast.
        The output must be a JSON object.
        Use weather condition strings that are simple and clear (e.g., "Sunny", "Partly Cloudy", "Rain").
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        current: {
                            type: Type.OBJECT,
                            properties: {
                                temp: { type: Type.NUMBER },
                                condition: { type: Type.STRING },
                                icon: { type: Type.STRING, description: "A simple icon name like 'sunny', 'cloudy', 'rainy'" }
                            },
                            required: ["temp", "condition", "icon"]
                        },
                        forecast: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    day: { type: Type.STRING, description: "Day of the week, e.g., 'Monday'" },
                                    temp_high: { type: Type.NUMBER },
                                    temp_low: { type: Type.NUMBER },
                                    condition: { type: Type.STRING }
                                },
                                required: ["day", "temp_high", "temp_low", "condition"]
                            }
                        }
                    },
                    required: ["current", "forecast"]
                }
            }
        });
        return JSON.parse(response.text);
    });
};


export const generateBookingDetails = async (trip: Trip): Promise<Trip['bookings']> => {
    return withRetry(async () => {
        const prompt = `
        Based on the following trip plan, generate realistic mock booking details for a flight and hotel.
        Destination: ${trip.destination}
        Duration: ${trip.duration} days
        Travelers: ${trip.travelers}
        
        The output must be a JSON object containing 'flight', 'hotel', and 'receipt' details.
        - Flight should include airline, flightNumber, departure/arrival times, and from/to airports.
        - Hotel should include a realistic name, address, and check-in/check-out dates.
        - Receipt should have an ID, date, and list the items with amounts.
        Make the details plausible for the destination.
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        flight: {
                            type: Type.OBJECT,
                            properties: {
                                airline: { type: Type.STRING },
                                flightNumber: { type: Type.STRING },
                                departure: { type: Type.STRING },
                                arrival: { type: Type.STRING },
                                from: { type: Type.STRING },
                                to: { type: Type.STRING },
                            },
                             required: ["airline", "flightNumber", "departure", "arrival", "from", "to"]
                        },
                        hotel: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                address: { type: Type.STRING },
                                checkIn: { type: Type.STRING },
                                checkOut: { type: Type.STRING },
                            },
                            required: ["name", "address", "checkIn", "checkOut"]
                        },
                        receipt: {
                          type: Type.OBJECT,
                           properties: {
                                id: { type: Type.STRING },
                                date: { type: Type.STRING },
                                items: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            description: { type: Type.STRING },
                                            amount: { type: Type.NUMBER }
                                        },
                                        required: ["description", "amount"]
                                    }
                                },
                           },
                            required: ["id", "date", "items"]
                        }
                    },
                    required: ["flight", "hotel", "receipt"]
                }
            }
        });
        return JSON.parse(response.text);
    });
};

export const generateMockFlights = async (from: string, to: string, date: string): Promise<MockFlight[]> => {
    return withRetry(async () => {
        const prompt = `Generate 5 realistic mock flight options from ${from} to ${to} for ${date || 'an upcoming date'}. Provide varied airlines, times, durations, prices in INR, and number of stops. Output must be a JSON object with a "flights" array.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        flights: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    airline: { type: Type.STRING },
                                    flightNumber: { type: Type.STRING },
                                    departureTime: { type: Type.STRING },
                                    arrivalTime: { type: Type.STRING },
                                    duration: { type: Type.STRING },
                                    price: { type: Type.NUMBER },
                                    stops: { type: Type.INTEGER },
                                },
                                required: ["airline", "flightNumber", "departureTime", "arrivalTime", "duration", "price", "stops"]
                            }
                        }
                    },
                    required: ["flights"]
                }
            }
        });
        const parsed = JSON.parse(response.text);
        return parsed.flights || [];
    });
}

export const generateMockHotels = async (destination: string, checkIn: string, checkOut: string): Promise<MockHotel[]> => {
    return withRetry(async () => {
        const prompt = `Generate 5 realistic mock hotel options in ${destination} for check-in on ${checkIn || 'an upcoming date'} and check-out on ${checkOut || 'a few days later'}. Provide varied names, star ratings (e.g. 4.5), price per night in INR, and a few key amenities. Output must be a JSON object with a "hotels" array.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        hotels: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    rating: { type: Type.NUMBER },
                                    pricePerNight: { type: Type.NUMBER },
                                    amenities: { type: Type.ARRAY, items: { type: Type.STRING } },
                                },
                                required: ["name", "rating", "pricePerNight", "amenities"]
                            }
                        }
                    },
                    required: ["hotels"]
                }
            }
        });
        const parsed = JSON.parse(response.text);
        return parsed.hotels || [];
    });
}

export const generateMockCabs = async (pickup: string, dropoff: string): Promise<MockCab[]> => {
    return withRetry(async () => {
        const prompt = `Generate 3 realistic mock cab options for a trip from "${pickup}" to "${dropoff}" in a major Indian city. Provide different cab types (e.g., Sedan, SUV), estimated time of arrival (ETA), and price in INR. Output must be a JSON object with a "cabs" array.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        cabs: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING },
                                    eta: { type: Type.STRING },
                                    price: { type: Type.NUMBER },
                                },
                                required: ["type", "eta", "price"]
                            }
                        }
                    },
                    required: ["cabs"]
                }
            }
        });
        const parsed = JSON.parse(response.text);
        return parsed.cabs || [];
    });
}


// --- Live Conversation Functions ---

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// FIX: Export decode function to be used in ChatAssistant component
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// FIX: Update connectLive to accept and pass the required callbacks
export const connectLive = (tripContext: Trip | null, callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => Promise<void>;
    onerror: (e: ErrorEvent) => void;
    onclose: (e: CloseEvent) => void;
}) => {
    let contextPrompt = "You are TripMate AI, a friendly, enthusiastic, and helpful voice assistant for Indian users planning their travel. Keep your responses concise and conversational.";
    if (tripContext) {
        contextPrompt += `\n\nThe user is currently planning a trip to ${tripContext.destination} for ${tripContext.duration} days with a budget of ₹${tripContext.budget.toLocaleString()}. Their interests are ${tripContext.interests}. Use this context to provide helpful, personalized answers.`;
    }

    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: contextPrompt,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
        },
    });
};