'use client';

import { motion } from 'framer-motion';
import { ConversationOption } from '@/lib/types';
import OptionIcon from './OptionIcon';

interface OptionButtonsProps {
  options: ConversationOption[];
  onSelect: (value: string, label: string) => void;
  disabled?: boolean;
}

export default function OptionButtons({ options, onSelect, disabled }: OptionButtonsProps) {
  const hasIcons = options.some((opt) => opt.icon);

  if (hasIcons) {
    const cols =
      options.length === 1 ? 'grid-cols-1 max-w-[200px] mx-auto' :
      options.length === 3 ? 'grid-cols-3' :
      'grid-cols-2';

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`grid ${cols} gap-3 mb-3`}
      >
        {options.map((opt, i) => (
          <motion.button
            key={opt.value}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
            onClick={() => onSelect(opt.value, opt.label)}
            disabled={disabled}
            className="flex flex-col items-center gap-2 px-4 py-5 rounded-2xl border-2 border-gray-200
                       text-slate-700 text-[14px] font-medium
                       hover:border-slate-700 hover:bg-slate-50
                       active:bg-slate-700 active:text-white active:border-slate-700
                       transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {opt.icon && (
              <OptionIcon name={opt.icon} className="text-slate-500" />
            )}
            <span>{opt.label}</span>
          </motion.button>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap gap-2 mb-3 justify-center"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value, opt.label)}
          disabled={disabled}
          className="px-5 py-3 rounded-full border-2 border-slate-700 text-slate-700 text-[15px] font-medium
                     hover:bg-slate-700 hover:text-white active:bg-slate-800 active:text-white
                     transition-colors duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {opt.label}
        </button>
      ))}
    </motion.div>
  );
}
