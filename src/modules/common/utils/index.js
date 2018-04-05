import Alert from './Alert';
import uploadHandler from './uploadHandler';
import router from './router';
import toggleCheckBoxes from './toggleCheckBoxes';
import Rotate from './animateRotate';
import confirm from './confirmation/confirm';
import urlParser from './urlParser';
import colorParser from './colorParser';
import { searchCompany, searchUser } from './searchers';

const renderFullName = data => {
  if (data.firstName || data.lastName) {
    return (data.firstName || '') + ' ' + (data.lastName || '');
  }
  return data.email || data.phone || 'N/A';
};

const setTitle = (title, force) => {
  if (!document.title.includes(title) || force) {
    document.title = title;
  }
};

const setBadge = (count, title) => {
  const favicon = document.getElementById('favicon');

  if (count) {
    if (document.title.includes(title)) {
      setTitle(`(${count}) ${title}`);
    }

    return (favicon.href = '/favicon-unread.png');
  }

  favicon.href = '/favicon.png';
};

export {
  Alert,
  uploadHandler,
  router,
  Rotate,
  confirm,
  toggleCheckBoxes,
  renderFullName,
  urlParser,
  colorParser,
  setTitle,
  setBadge,
  searchCompany,
  searchUser
};
