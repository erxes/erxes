import { IItineraryOption } from '../types/itinerary';
import { createContext } from 'react';

export interface ISelectItineraryContext {
  itineraryId: string | undefined;
  onSelect: (itinerary: IItineraryOption) => void;
  selectedItinerary: IItineraryOption | null;
  branchId?: string;
  language?: string;
}

export const SelectItineraryContext =
  createContext<ISelectItineraryContext | null>(null);
