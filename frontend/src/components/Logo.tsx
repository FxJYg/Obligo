import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 160 50" 
      className={`text-slate-900 dark:text-white ${className || ''}`}
    >
      <g transform="translate(0, 5) scale(0.8)">
        <text 
          x="25" 
          y="38" 
          fontSize="45" 
          textAnchor="middle" 
          style={{ userSelect: 'none' }}
        >
          🗽
        </text>
      </g>
      
      <text 
        x="50" 
        y="35" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        fontSize="28" 
        fontWeight="800" 
        fill="currentColor" 
        letterSpacing="-1"
      >
        obligo
      </text>
    </svg>
  );
};