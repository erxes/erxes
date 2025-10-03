import { useContext } from 'react';
import { EmailFieldsContext } from '../contexts/EmailFieldsContext';

export const useEmailFields = () => useContext(EmailFieldsContext);
