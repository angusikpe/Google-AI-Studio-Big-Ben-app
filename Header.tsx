import React, { useState, useEffect, useRef } from 'react';
import { MenuIcon, UserCircleIcon, ClockIcon } from './IconComponents';
import type { User } from 'firebase/auth';
import { auth, signOut } from '../firebase/client';

interface HeaderProps {
    user: User | null;
    onAuthClick: () => void;
    onProfileClick: () => void;
    onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onAuthClick, onProfileClick, onGoHome }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menuButton = document.querySelector('[aria-label="Open menu"]');
      if (menuButton?.contains(event.target as Node)) {
        return;
      }
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
     if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Nav - visible on medium screens and up */}
      <div className="bg-gray-100 border-b hidden md:block">
        <div className="container mx-auto px-4 h-10 flex items-stretch">
          <a href="/" className="flex items-center px-4 -mb-px border-b-2 border-primary text-primary font-bold">
            Big Ben Express
          </a>
          <a href="#" className="flex items-center px-4 text-gray-700 hover:text-primary font-semibold">
            Express Vacations
          </a>
          <a href="#" className="flex items-center px-4 text-gray-700 hover:text-primary font-semibold">
            Express Travel
          </a>
        </div>
      </div>

      {/* Main Nav */}
      <div className="bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="h-16 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                   <button 
                      aria-label="Open menu" 
                      className="p-2 rounded-full hover:bg-white/20 transition-colors"
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                   >
                      <MenuIcon className="h-8 w-8"/>
                  </button>
                  <a href="/" className="flex items-center space-x-2 text-xl font-bold tracking-tighter text-white no-underline">
                    <ClockIcon className="h-7 w-7" />
                    <span>Big Ben Express</span>
                  </a>
              </div>
              <div className="relative" ref={dropdownRef}>
                  <button 
                    aria-label={user ? "User menu" : "User account"} 
                    className="p-2"
                    onClick={() => user ? setIsDropdownOpen(!isDropdownOpen) : onAuthClick()}
                  >
                      <UserCircleIcon className="h-8 w-8"/>
                  </button>
                  {user && isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 text-dark">
                          <div className="px-4 py-2 text-sm text-gray-700 border-b">
                            Signed in as <br/>
                            <span className="font-semibold truncate">{user.email}</span>
                          </div>
                          <button
                              onClick={() => { onProfileClick(); setIsDropdownOpen(false); }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                              My Bookings
                          </button>
                          <button
                              onClick={handleSignOut}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                              Sign Out
                          </button>
                      </div>
                  )}
              </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div ref={menuDropdownRef} className="absolute left-0 w-full bg-white shadow-lg z-40 md:hidden animate-fade-in-down">
          <nav className="container mx-auto px-2 py-2">
            <button 
              onClick={() => { onGoHome(); setIsMenuOpen(false); }}
              className="block w-full text-left font-semibold text-dark py-3 px-2 hover:bg-gray-100 rounded-md"
            >
              Book a trip
            </button>
            <button
              onClick={() => {
                if (user) {
                  onProfileClick();
                } else {
                  onAuthClick();
                }
                setIsMenuOpen(false);
              }}
              className="block w-full text-left font-semibold text-dark py-3 px-2 hover:bg-gray-100 rounded-md"
            >
              My trips
            </button>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); }}
              className="block w-full text-left font-semibold text-dark py-3 px-2 hover:bg-gray-100 rounded-md"
            >
              Travel info
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};