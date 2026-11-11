import { createContext } from 'react';

export const FullNameFieldContext = createContext<{
  fullName: string;
  firstName: string;
  lastName: string;
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;
} | null>(null);
