import React, { useState, useEffect, useRef } from 'react';
import type { BookingQuery } from '../types';
import { ChevronDownIcon, SwitchHorizontalIcon } from './IconComponents';
import { LONDON_LOCATIONS } from '../constants';

interface BookingFormProps {
  onSearch: (query: BookingQuery) => void;
  initialQuery?: BookingQuery;
  isUpdate?: boolean;
}

const AutoSuggestInput: React.FC<{
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    label: string;
}> = ({ value, onChange, placeholder, label }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        onChange(query);
        if (query.length > 0) {
            const filtered = LONDON_LOCATIONS.filter(loc =>
                loc.toLowerCase().includes(query.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSelect = (suggestion: string) => {
        onChange(suggestion);
        setShowSuggestions(false);
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <label className="block p-3 cursor-text">
                <span className="text-xs text-gray-500">{label}</span>
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    onFocus={() => setShowSuggestions(value.length > 0 && suggestions.length > 0)}
                    className="w-full bg-transparent font-semibold text-dark focus:outline-none"
                    placeholder={placeholder}
                />
            </label>

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((s, i) => (
                        <div
                            key={i}
                            onClick={() => handleSelect(s)}
                            className="p-3 hover:bg-gray-100 cursor-pointer text-dark"
                        >
                            {s}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


export const BookingForm: React.FC<BookingFormProps> = ({ onSearch, initialQuery, isUpdate }) => {
  const [tripType, setTripType] = useState<BookingQuery['tripType']>('one-way');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (initialQuery) {
      setTripType(initialQuery.tripType);
      setFrom(initialQuery.from);
      setTo(initialQuery.to);
      setDate(initialQuery.date);
      setReturnDate(initialQuery.returnDate || '');
      setPassengers(initialQuery.passengers);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to || !date || (tripType === 'roundtrip' && !returnDate)) {
      setError('Please fill out all required fields.');
      return;
    }
    setError('');
    onSearch({ tripType, from, to, date, returnDate, passengers });
  };

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const formatDateForDisplay = (isoDate: string): string => {
    if (!isoDate) return tripType === 'one-way' ? 'Select date' : 'Add return';
    const dateObj = new Date(isoDate + 'T00:00:00');
    return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formClasses = isUpdate 
    ? "bg-blue-100 rounded-xl shadow-lg p-4 sm:p-6 text-dark text-left"
    : "bg-blue-100 rounded-xl shadow-2xl p-4 sm:p-6 text-dark animate-fade-in max-w-2xl text-left";

  return (
    <div className={formClasses}>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="flex items-center mb-4 border-b">
          <div className="relative flex-1">
            <select
              value={tripType}
              onChange={(e) => setTripType(e.target.value as BookingQuery['tripType'])}
              className="w-full appearance-none bg-transparent font-semibold p-2 focus:outline-none"
            >
              <option value="one-way">One-way</option>
              <option value="roundtrip">Roundtrip</option>
            </select>
            <ChevronDownIcon className="h-5 w-5 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative flex-1">
             <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="w-full appearance-none bg-transparent font-semibold p-2 focus:outline-none"
             >
                {[...Array(8).keys()].map(i => 
                    <option key={i+1} value={i+1}>{i+1} Adult{i > 0 ? 's' : ''}</option>
                )}
             </select>
            <ChevronDownIcon className="h-5 w-5 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        
        <div className="space-y-2">
            <div className="relative">
                <div className="flex w-full items-stretch gap-1">
                    <div className="flex-1 bg-white border border-gray-300 focus-within:ring-2 focus-within:ring-primary">
                        <AutoSuggestInput label="From" value={from} onChange={setFrom} placeholder="City or airport" />
                    </div>
                    <div className="flex-1 bg-white border border-gray-300 focus-within:ring-2 focus-within:ring-primary">
                        <AutoSuggestInput label="To" value={to} onChange={setTo} placeholder="City or airport" />
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleSwap}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 bg-white border-2 border-gray-300 rounded-full text-gray-500 hover:text-primary hover:border-primary transition-colors z-10"
                    aria-label="Swap origin and destination"
                >
                    <SwitchHorizontalIcon className="h-5 w-5"/>
                </button>
            </div>

            <div className={`grid ${tripType === 'roundtrip' ? 'grid-cols-2 gap-2' : 'grid-cols-1'}`}>
                <div className="bg-white border border-gray-300 focus-within:ring-2 focus-within:ring-primary">
                    <div className="relative">
                         <label htmlFor="depart-date" className="p-3 block cursor-pointer">
                            <span className="text-gray-500 text-xs block pointer-events-none">Depart</span>
                            <span className="font-semibold pointer-events-none">{formatDateForDisplay(date)}</span>
                        </label>
                        <input id="depart-date" type="date" value={date} onChange={e => setDate(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                    </div>
                </div>
                {tripType === 'roundtrip' && (
                     <div className="bg-white border border-gray-300 focus-within:ring-2 focus-within:ring-primary">
                         <div className="relative">
                             <label htmlFor="return-date" className="p-3 block cursor-pointer">
                                <span className="text-gray-500 text-xs block pointer-events-none">Return</span>
                                <span className="font-semibold pointer-events-none">{formatDateForDisplay(returnDate)}</span>
                            </label>
                            <input id="return-date" type="date" min={date} value={returnDate} onChange={e => setReturnDate(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="mt-6 flex items-center">
            <input id="use-points" type="checkbox" className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary" />
            <label htmlFor="use-points" className="ml-2 block text-sm text-gray-900">Use Big Ben points</label>
        </div>

        <div className="mt-6">
            <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-800 transition-colors duration-300 text-lg">
                {isUpdate ? 'Update search' : 'Search trips'}
            </button>
        </div>
      </form>
    </div>
  );
};