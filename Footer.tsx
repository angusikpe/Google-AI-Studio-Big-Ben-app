
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-gray-400 mt-auto">
      <div className="container mx-auto px-4 py-4 text-center">
        <p>&copy; {new Date().getFullYear()} Big Ben Express. All Rights Reserved.</p>
        <p className="text-sm">Your reliable partner for London transport.</p>
      </div>
    </footer>
  );
};