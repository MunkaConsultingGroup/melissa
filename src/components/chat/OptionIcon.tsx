'use client';

import { type ReactElement } from 'react';

const icons: Record<string, ReactElement> = {
  // Welcome
  rocket: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M16 27v-6" />
      <path d="M11 24l5 3 5-3" />
      <path d="M16 21c0 0-8-4.5-8-13A8 8 0 0 1 24 8c0 8.5-8 13-8 13z" />
      <circle cx="16" cy="11" r="2" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <circle cx="16" cy="16" r="11" />
      <path d="M16 15v6" />
      <circle cx="16" cy="11" r="0.5" fill="currentColor" />
    </svg>
  ),
  thumbsUp: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M7 17v8a1 1 0 001 1h2a1 1 0 001-1v-8a1 1 0 00-1-1H8a1 1 0 00-1 1z" />
      <path d="M11 17l3-8a3 3 0 013-3v0a2 2 0 012 2v5h5.5a2 2 0 012 2.2l-1.2 8a2 2 0 01-2 1.8H11" />
    </svg>
  ),

  // Gender
  male: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <circle cx="13" cy="19" r="7" />
      <path d="M18 14l7-7" />
      <path d="M21 7h4v4" />
    </svg>
  ),
  female: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <circle cx="16" cy="13" r="7" />
      <path d="M16 20v7" />
      <path d="M12 24h8" />
    </svg>
  ),

  // Smoker
  noSmoking: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <circle cx="16" cy="16" r="11" />
      <path d="M8 8l16 16" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <circle cx="16" cy="16" r="11" />
      <path d="M16 10v6l4 3" />
    </svg>
  ),
  cigarette: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <rect x="4" y="20" width="18" height="4" rx="1" />
      <path d="M25 20v4" />
      <path d="M28 20v4" />
      <path d="M22 14c0-3 2-4 2-6s-1-3-1-3" />
      <path d="M25 14c0-3 2-4 2-6s-1-3-1-3" />
    </svg>
  ),

  // Health
  heartPlus: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M16 28S4 20 4 13a6 6 0 0112-1 6 6 0 0112 1c0 7-12 15-12 15z" />
      <path d="M14 15h4" />
      <path d="M16 13v4" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M16 28S4 20 4 13a6 6 0 0112-1 6 6 0 0112 1c0 7-12 15-12 15z" />
    </svg>
  ),
  heartHalf: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M16 28S4 20 4 13a6 6 0 0112-1 6 6 0 0112 1c0 7-12 15-12 15z" />
      <path d="M16 7v21" strokeDasharray="3 2" />
    </svg>
  ),
  heartMinus: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M16 28S4 20 4 13a6 6 0 0112-1 6 6 0 0112 1c0 7-12 15-12 15z" />
      <path d="M13 15h6" />
    </svg>
  ),

  // Coverage
  shield100: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M16 3L5 8v7c0 7.18 4.7 13.18 11 15 6.3-1.82 11-7.82 11-15V8L16 3z" />
      <text x="16" y="19" textAnchor="middle" fill="currentColor" stroke="none" fontSize="8" fontWeight="600">$</text>
    </svg>
  ),
  shield250: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M16 3L5 8v7c0 7.18 4.7 13.18 11 15 6.3-1.82 11-7.82 11-15V8L16 3z" />
      <text x="16" y="19" textAnchor="middle" fill="currentColor" stroke="none" fontSize="7" fontWeight="600">$$</text>
    </svg>
  ),
  shield500: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M16 3L5 8v7c0 7.18 4.7 13.18 11 15 6.3-1.82 11-7.82 11-15V8L16 3z" />
      <path d="M12 14h8M12 18h8M12 14v4M16 14v4M20 14v4" />
    </svg>
  ),
  shield750: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M16 3L5 8v7c0 7.18 4.7 13.18 11 15 6.3-1.82 11-7.82 11-15V8L16 3z" />
      <path d="M11 13l5 3-5 3M17 19h4" />
    </svg>
  ),
  shieldMax: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M16 3L5 8v7c0 7.18 4.7 13.18 11 15 6.3-1.82 11-7.82 11-15V8L16 3z" />
      <path d="M12 18l2-6 2 4 2-4 2 6" />
    </svg>
  ),

  // Term
  cal10: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <rect x="5" y="6" width="22" height="20" rx="2" />
      <path d="M5 12h22" />
      <path d="M11 4v4M21 4v4" />
      <text x="16" y="23" textAnchor="middle" fill="currentColor" stroke="none" fontSize="8" fontWeight="600">10</text>
    </svg>
  ),
  cal15: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <rect x="5" y="6" width="22" height="20" rx="2" />
      <path d="M5 12h22" />
      <path d="M11 4v4M21 4v4" />
      <text x="16" y="23" textAnchor="middle" fill="currentColor" stroke="none" fontSize="8" fontWeight="600">15</text>
    </svg>
  ),
  cal20: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <rect x="5" y="6" width="22" height="20" rx="2" />
      <path d="M5 12h22" />
      <path d="M11 4v4M21 4v4" />
      <text x="16" y="23" textAnchor="middle" fill="currentColor" stroke="none" fontSize="8" fontWeight="600">20</text>
    </svg>
  ),
  cal25: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <rect x="5" y="6" width="22" height="20" rx="2" />
      <path d="M5 12h22" />
      <path d="M11 4v4M21 4v4" />
      <text x="16" y="23" textAnchor="middle" fill="currentColor" stroke="none" fontSize="8" fontWeight="600">25</text>
    </svg>
  ),
  cal30: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <rect x="5" y="6" width="22" height="20" rx="2" />
      <path d="M5 12h22" />
      <path d="M11 4v4M21 4v4" />
      <text x="16" y="23" textAnchor="middle" fill="currentColor" stroke="none" fontSize="8" fontWeight="600">30</text>
    </svg>
  ),

  // Lead intro
  handshake: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M4 17l5-5 4 2 5-5 3 1 7-3" />
      <path d="M4 17l4 1 4-1 4 2 4-1 4 1 4-2" />
      <path d="M12 19l-2 4M16 20l-1 4M20 19l1 4" />
    </svg>
  ),
  wave: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M20 6c1-2 3-2 4 0l1 4" />
      <path d="M17 5c1-2 3-2 4 0l2 7" />
      <path d="M14 7c1-2 3-2 4 0l1 5" />
      <path d="M11 10c1-2 3-2 4 0l1 4" />
      <path d="M8 18c-2-4-1-6 1-7" />
      <path d="M25 14c1 6-1 11-7 13-4 1-8-1-10-5" />
    </svg>
  ),
};

interface OptionIconProps {
  name: string;
  className?: string;
}

export default function OptionIcon({ name, className }: OptionIconProps) {
  const icon = icons[name];
  if (!icon) return null;
  return <span className={className}>{icon}</span>;
}
