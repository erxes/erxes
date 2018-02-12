import Alert from './Alert';
import uploadHandler from './uploadHandler';
import router from './router';
import toggleCheckBoxes from './toggleCheckBoxes';
import Rotate from './animateRotate';
import confirm from './confirmation/confirm';

const renderFullName = data => {
  if (data.firstName || data.lastName) {
    return (data.firstName || '') + ' ' + (data.lastName || '');
  }
  return data.email || data.phone || 'N/A';
};

export {
  Alert,
  uploadHandler,
  router,
  Rotate,
  confirm,
  toggleCheckBoxes,
  renderFullName
};
