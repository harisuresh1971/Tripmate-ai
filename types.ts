export interface Activity {
  time: string;
  description: string;
  estimated_cost: number;
  type: 'Food' | 'Accommodation' | 'Transport' | 'Activity' | 'Miscellaneous';
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: Activity[];
  daily_cost: number;
}

export interface Trip {
  id: string;
  status: 'planning' | 'booked' | 'completed';
  destination: string;
  duration: number;
  budget: number;
  travelers: number;
  interests: string;
  itinerary: ItineraryDay[];
  total_cost: number;
  bookings?: {
    flight: {
      airline: string;
      flightNumber: string;
      departure: string;
      arrival: string;
      from: string;
      to: string;
    };
    hotel: {
      name: string;
      address: string;
      checkIn: string;
      checkOut: string;
    };
    receipt: {
      id: string;
      date: string;
      items: { description: string; amount: number }[];
    }
  }
}

export interface PlaceRecommendation {
  name: string;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface WeatherInfo {
    current: {
        temp: number;
        condition: string;
        icon: string;
    },
    forecast: {
        day: string;
        temp_high: number;
        temp_low: number;
        condition: string;
    }[];
}

export interface JournalEntry {
    id: string;
    date: string;
    title: string;
    content: string;
    photo?: string;
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
}

export interface MockFlight {
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  stops: number;
}

export interface MockHotel {
  name: string;
  rating: number;
  pricePerNight: number;
  amenities: string[];
}

export interface MockCab {
  type: string;
  eta: string;
  price: number;
}
