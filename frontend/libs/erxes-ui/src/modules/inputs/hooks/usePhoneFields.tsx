import { useContext } from 'react';
import { PhoneFieldsContext } from '../contexts/PhoneFieldsContext';

export const usePhoneFields = () => useContext(PhoneFieldsContext);
