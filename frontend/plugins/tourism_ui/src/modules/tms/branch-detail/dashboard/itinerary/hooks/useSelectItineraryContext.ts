import { SelectItineraryContext } from '../contexts/SelectItineraryContext';
import { useContext } from 'react';

export const useSelectItineraryContext = () => {
  const context = useContext(SelectItineraryContext);
  if (!context) {
    throw new Error(
      'useSelectItineraryContext must be used within a SelectItineraryProvider',
    );
  }
  return context;
};
