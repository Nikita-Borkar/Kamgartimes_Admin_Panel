import React from 'react';
import kamgarLogo from '../assets/kamgar_times_with_logo.jpeg';

export default function Logo({ size = 'md', showTagline = true }) {
  const imageHeights = {
    sm: 'h-8 sm:h-10',
    md: 'h-10 sm:h-12',
    lg: 'h-12 sm:h-16'
  };

  return (
    <div className="flex items-center gap-2 select-none group">
      <img 
        src={kamgarLogo} 
        alt="Kamgar Times Logo" 
        className={`${imageHeights[size]} w-auto object-contain group-hover:scale-105 transition-transform duration-300`}
      />
    </div>
  );
}
