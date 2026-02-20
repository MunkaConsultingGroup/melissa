'use client';

import { useState, KeyboardEvent, ChangeEvent } from 'react';

interface TextInputProps {
  type?: 'text' | 'number' | 'email' | 'tel';
  placeholder?: string;
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function TextInput({ type = 'text', placeholder = 'Type here...', onSubmit, disabled }: TextInputProps) {
  const [value, setValue] = useState('');
  const isPhone = type === 'tel';

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setValue(isPhone ? formatPhone(raw) : raw);
  };

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-2 mb-3">
      <input
        type={isPhone ? 'tel' : type}
        inputMode={isPhone ? 'numeric' : undefined}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-4 py-3.5 rounded-full border-2 border-gray-200 focus:border-slate-700
                   outline-none text-base transition-colors duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed"
        autoFocus
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className="px-6 py-3.5 rounded-full bg-slate-700 text-white text-base font-medium
                   hover:bg-slate-800 active:bg-slate-900 transition-colors duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </div>
  );
}
