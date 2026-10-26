import React, { useState } from 'react';
import { Compass, Car } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  fallbackType?: 'landscape' | 'car';
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = '',
  className = '',
  fallbackTitle,
  fallbackType = 'landscape',
  ...rest
}) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`bg-gradient-to-br from-neutral-900 via-red-950/40 to-neutral-900 flex flex-col items-center justify-center p-6 text-center text-neutral-400 select-none border border-red-900/20 ${className}`}
      >
        <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-800/40 flex items-center justify-center text-red-400 mb-2">
          {fallbackType === 'car' ? <Car className="w-6 h-6" /> : <Compass className="w-6 h-6" />}
        </div>
        <span className="text-xs font-semibold text-neutral-300">
          {fallbackTitle || alt || 'Wayora Journeys'}
        </span>
        <span className="text-[11px] text-neutral-500 mt-0.5">Luxury Chauffeur Fleet</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      loading="lazy"
      {...rest}
    />
  );
};
