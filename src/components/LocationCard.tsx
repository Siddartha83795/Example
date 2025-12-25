import React from 'react';
import { MapPin, Clock, Utensils, Coffee } from 'lucide-react';
import { Location } from '@/types';

interface LocationCardProps {
  location: Location;
  title: string;
  description: string;
  icon: 'medical' | 'cafe';
  isSelected?: boolean;
  onClick: () => void;
}

const LocationCard: React.FC<LocationCardProps> = ({
  title,
  description,
  icon,
  isSelected,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-2xl border-2 p-6 text-left transition-all duration-300 hover:scale-[1.02] ${
        isSelected
          ? 'border-primary bg-primary/10 glow-effect'
          : 'border-border/50 bg-card hover:border-primary/50'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      
      <div className="relative z-10">
        <div className={`mb-4 inline-flex rounded-xl p-3 ${
          isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary'
        }`}>
          {icon === 'medical' ? (
            <Utensils className="h-6 w-6" />
          ) : (
            <Coffee className="h-6 w-6" />
          )}
        </div>

        <h3 className="font-display text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>Ground Floor</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>8AM - 8PM</span>
          </div>
        </div>
      </div>

      {isSelected && (
        <div className="absolute right-4 top-4">
          <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
        </div>
      )}
    </button>
  );
};

export default LocationCard;
