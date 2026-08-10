'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useSyncExternalStore } from 'react';
import { cn } from 'erxes-ui';

import { IPipelineLabel } from '@/deals/types/pipelines';

const LABELS_SHOW_TEXT_KEY = 'labels-show-text';

const listeners = new Set<() => void>();

const readShowText = () => {
  const saved = localStorage.getItem(LABELS_SHOW_TEXT_KEY);
  return saved === null ? true : saved === 'true';
};

let showTextState = typeof window !== 'undefined' ? readShowText() : true;

const subscribeShowText = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getShowTextSnapshot = () => showTextState;
const getShowTextServerSnapshot = () => true;

const toggleShowText = () => {
  showTextState = !showTextState;
  localStorage.setItem(LABELS_SHOW_TEXT_KEY, String(showTextState));
  listeners.forEach((listener) => listener());
};

export const Labels = ({
  labels,
  type,
}: {
  labels: IPipelineLabel[];
  type?: 'label' | 'toggle';
}) => {
  const isToggle = type === 'toggle';
  const showText = useSyncExternalStore(
    subscribeShowText,
    getShowTextSnapshot,
    getShowTextServerSnapshot,
  );

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isToggle) toggleShowText();
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
      className={cn(
        'rounded text-white text-sm font-medium flex items-center justify-center cursor-pointer px-2 overflow-hidden',
        showText ? 'py-0.5' : 'py-1',
      )}
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
