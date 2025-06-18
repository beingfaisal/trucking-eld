import React from 'react';

export default function Banner({ title = 'Trucking ELD' }) {
  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-500 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-center px-6 py-4 space-x-4">
        {/* Logo image from public/assets */}
        <img
          src="delivery.png"
          alt="Trucking ELD Logo"
          className="h-12 w-auto"
        />

        {/* App title */}
        <h1 className="text-white text-3xl sm:text-4xl font-semibold tracking-wide">
          {title}
        </h1>
      </div>
    </header>
  );
}
