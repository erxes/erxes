'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { IPipelineLabel } from '@/deals/types/pipelines';

const Labels = ({
  labels,
  type,
}: {
  labels: IPipelineLabel[];
  type?: 'label' | 'toggle';
}) => {
  const isToggle = type === 'toggle';
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (isToggle) {
      const saved = localStorage.getItem('labels-show-text');
      if (saved) setShowText(saved === 'true');
    }
  }, [isToggle]);

  useEffect(() => {
    if (isToggle) {
      localStorage.setItem('labels-show-text', String(showText));
    }
  }, [showText, isToggle]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isToggle) setShowText((prev) => !prev);
  };

  if (!isToggle) {
    return (
      <>
        {labels.map((label) => (
          <div
            key={label._id}
            className="px-2 py-1 rounded text-white text-sm font-medium inline-block"
            style={{ backgroundColor: label.colorCode }}
          >
            {label.name}
          </div>
        ))}
      </>
    );
  }

  return labels.map((label) => (
    <motion.div
      key={label._id}
      onClick={handleToggle}
      className="rounded text-white text-sm font-medium flex items-center justify-center cursor-pointer px-2 py-1 overflow-hidden"
      style={{
        backgroundColor: label.colorCode,
        width: showText ? 'auto' : '40px',
      }}
      whileHover={{ scale: 1.05 }}
    >
      <AnimatePresence mode="wait">
        {showText && (
          <motion.span
            key={label._id + '-text'}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.3 }}
            className="whitespace-nowrap overflow-hidden"
          >
            {label.name}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  ));
};

export default Labels;
