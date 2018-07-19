import Alert from './Alert';
import uploadHandler from './uploadHandler';
import router from './router';
import toggleCheckBoxes from './toggleCheckBoxes';
import confirm from './confirmation/confirm';
import urlParser from './urlParser';
import colorParser from './colorParser';
import { searchCompany, searchUser, searchCustomer } from './searchers';

export const renderFullName = data => {
  if (data.firstName || data.lastName) {
    return (data.firstName || '') + ' ' + (data.lastName || '');
  }
  return data.email || data.phone || 'N/A';
};

export const setTitle = (title, force) => {
  if (!document.title.includes(title) || force) {
    document.title = title;
  }
};

export const setBadge = (count, title) => {
  const favicon = document.getElementById('favicon');

  if (count) {
    if (document.title.includes(title)) {
      setTitle(`(${count}) ${title}`);
    }

    return (favicon.href = '/favicon-unread.png');
  }

  setTitle(title, true);

  favicon.href = '/favicon.png';
};

export const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);

  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const generateRandomColorCode = () => {
  return `#${Math.random()
    .toString(16)
    .slice(2, 8)}`;
};

// Create an array with "stop" numbers, starting from "start"
export const range = (start, stop) => {
  return Array.from(Array(stop), (_, i) => start + i);
};

// Return the list of values that are the intersection of two arrays
export const intersection = (array1, array2) => {
  return array1.filter(n => array2.includes(n));
};

// Computes the union of the passed-in arrays: the list of unique items
export const union = (array1, array2) => {
  return array1.concat(array2.filter(n => !array1.includes(n)));
};

// Similar to without, but returns the values from array that are not present in the other arrays.
export const difference = (array1, array2) => {
  return array1.filter(n => !array2.includes(n));
};

export {
  Alert,
  uploadHandler,
  router,
  confirm,
  toggleCheckBoxes,
  urlParser,
  colorParser,
  searchCompany,
  searchUser,
  searchCustomer
};
