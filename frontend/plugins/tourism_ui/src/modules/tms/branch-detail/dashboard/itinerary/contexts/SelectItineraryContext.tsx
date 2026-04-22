import { IItinerary } from '../types/itinerary';
import { createContext } from 'react';

export type ISelectItineraryContext = {
  itineraryId: string | undefined;
  onSelect: (itinerary: IItinerary) => void;
  selectedItinerary: IItinerary | null;
  branchId?: string;
  language?: string;
};

export const SelectItineraryContext =
  createContext<ISelectItineraryContext | null>(null);
