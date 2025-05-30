import React from "react";

interface HeroProps {
  className?: string; // Rend la prop className optionnelle
}

export default function Hero({ className = "" }: HeroProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">Athemaria</h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Share and discover amazing stories from writers around the world
        </p>
        <button className="px-6 py-3 bg-greenSauge hover:bg-greenCeladon text-white rounded-lg font-medium transition-colors">
          Start Reading
        </button>
      </div>
    </div>
  );
}
