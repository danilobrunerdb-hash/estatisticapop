import React from 'react';
import { useProjectionContext } from '../../context/ProjectionContext';

export const Footer = () => {
  return (
    <footer className="h-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center px-4 justify-between text-[9px] text-slate-500 uppercase font-bold tracking-widest transition-colors">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> SISTEMA ONLINE</span>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <span>COORD: 23°32'S 46°38'W</span>
      </div>
      <div className="flex items-center gap-4">
        <span>ENGINE: V3.2.0</span>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <span>USER: {window.location.hostname.split('-')[0].toUpperCase()}</span>
      </div>
    </footer>
  );
};
