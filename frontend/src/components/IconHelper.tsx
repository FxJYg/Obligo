import React from 'react';
import { 
  Home, Briefcase, Heart, Users, Star, Zap, 
  ShoppingCart, BookOpen, Monitor, Coffee, 
  Dumbbell, Plane, Music, Code, PenTool,
  Utensils, Car, GraduationCap, Gift, Smile
} from 'lucide-react';

export const ICON_OPTIONS = [
  'Home', 'Briefcase', 'Heart', 'Users', 'Star', 
  'Zap', 'ShoppingCart', 'BookOpen', 'Monitor', 'Coffee',
  'Dumbbell', 'Plane', 'Music', 'Code', 'PenTool',
  'Utensils', 'Car', 'GraduationCap', 'Gift', 'Smile'
];

const ICON_MAP: Record<string, React.ElementType> = {
  Home, Briefcase, Heart, Users, Star, 
  Zap, ShoppingCart, BookOpen, Monitor, Coffee,
  Dumbbell, Plane, Music, Code, PenTool,
  Utensils, Car, GraduationCap, Gift, Smile
};

interface IconHelperProps {
  name: string;
  size?: number;
  className?: string;
}

const IconHelper: React.FC<IconHelperProps> = ({ name, size = 16, className }) => {
  const Icon = ICON_MAP[name] || Star;
  return <Icon size={size} className={className} />;
};

export default IconHelper;