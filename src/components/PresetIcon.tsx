import React from 'react';
import { 
  Landmark, 
  Palmtree, 
  Building2, 
  Sparkles, 
  Mountain, 
  Trees, 
  Clock, 
  ShoppingBag, 
  Coffee, 
  Plane, 
  Car, 
  MapPin, 
  Flag, 
  Users,
  Compass,
  Zap,
  Luggage,
  Heart,
  Accessibility,
  PhoneCall,
  Wind,
  Shield,
  Briefcase,
  Activity,
  Baby,
  HeartHandshake
} from 'lucide-react';

interface PresetIconProps {
  nameOrType?: string;
  className?: string;
}

export const PresetIcon: React.FC<PresetIconProps> = ({ nameOrType = '', className = 'w-3.5 h-3.5' }) => {
  const key = nameOrType.toLowerCase();

  if (key.includes('temple') || key.includes('tirupati') || key.includes('srisailam') || key.includes('🛕') || key.includes('🕉️')) {
    return <Landmark className={`${className} text-amber-600 shrink-0`} />;
  }
  if (key.includes('beach') || key.includes('goa') || key.includes('🏖️')) {
    return <Palmtree className={`${className} text-emerald-600 shrink-0`} />;
  }
  if (key.includes('silicon') || key.includes('city') || key.includes('🏙️')) {
    return <Building2 className={`${className} text-blue-600 shrink-0`} />;
  }
  if (key.includes('shirdi') || key.includes('sparkle') || key.includes('✨')) {
    return <Sparkles className={`${className} text-amber-500 shrink-0`} />;
  }
  if (key.includes('araku') || key.includes('valley') || key.includes('mountain') || key.includes('⛰️')) {
    return <Mountain className={`${className} text-teal-600 shrink-0`} />;
  }
  if (key.includes('vijayawada') || key.includes('durga') || key.includes('landmark') || key.includes('🏛️')) {
    return <Landmark className={`${className} text-red-600 shrink-0`} />;
  }
  if (key.includes('ooty') || key.includes('hills') || key.includes('tree') || key.includes('🌲')) {
    return <Trees className={`${className} text-emerald-700 shrink-0`} />;
  }
  if (key.includes('office') || key.includes('tech park') || key.includes('electronic') || key.includes('🏢')) {
    return <Building2 className={`${className} text-blue-600 shrink-0`} />;
  }
  if (key.includes('hour') || key.includes('clock') || key.includes('time') || key.includes('⏱️')) {
    return <Clock className={`${className} text-amber-600 shrink-0`} />;
  }
  if (key.includes('shopping') || key.includes('cbd') || key.includes('central') || key.includes('🛍️')) {
    return <ShoppingBag className={`${className} text-purple-600 shrink-0`} />;
  }
  if (key.includes('cafe') || key.includes('coffee') || key.includes('dinner') || key.includes('☕')) {
    return <Coffee className={`${className} text-amber-700 shrink-0`} />;
  }
  if (key.includes('airport') || key.includes('flight') || key.includes('plane') || key.includes('✈️')) {
    return <Plane className={`${className} text-red-600 shrink-0`} />;
  }
  if (key.includes('luggage') || key.includes('🧰')) {
    return <Luggage className={`${className} text-amber-600 shrink-0`} />;
  }
  if (key.includes('senior') || key.includes('elder') || key.includes('parent') || key.includes('👴')) {
    return <HeartHandshake className={`${className} text-rose-600 shrink-0`} />;
  }
  if (key.includes('wheelchair') || key.includes('♿')) {
    return <Accessibility className={`${className} text-blue-600 shrink-0`} />;
  }
  if (key.includes('call') || key.includes('phone') || key.includes('📞')) {
    return <PhoneCall className={`${className} text-emerald-600 shrink-0`} />;
  }
  if (key.includes('ac') || key.includes('air') || key.includes('❄️')) {
    return <Wind className={`${className} text-cyan-600 shrink-0`} />;
  }
  if (key.includes('highway') || key.includes('drive') || key.includes('car') || key.includes('🚗')) {
    return <Car className={`${className} text-red-600 shrink-0`} />;
  }
  if (key.includes('family') || key.includes('👨‍👩‍👧')) {
    return <Users className={`${className} text-rose-600 shrink-0`} />;
  }
  if (key.includes('baby') || key.includes('spouse') || key.includes('kid') || key.includes('👶')) {
    return <Baby className={`${className} text-pink-600 shrink-0`} />;
  }
  if (key.includes('colleague') || key.includes('guest') || key.includes('💼')) {
    return <Briefcase className={`${className} text-indigo-600 shrink-0`} />;
  }
  if (key.includes('medical') || key.includes('hospital') || key.includes('🏥')) {
    return <Activity className={`${className} text-red-600 shrink-0`} />;
  }
  if (key.includes('fastag') || key.includes('toll') || key.includes('⚡')) {
    return <Zap className={`${className} text-amber-500 shrink-0`} />;
  }
  if (key.includes('flag') || key.includes('reach') || key.includes('🏁')) {
    return <Flag className={`${className} text-emerald-600 shrink-0`} />;
  }

  return <MapPin className={`${className} text-red-500 shrink-0`} />;
};
