import Collections from './collections';
import Schemas from './schemas';


const Alert = {
  Collections,
  Schemas,

  success(message) {
    this.alert(this.types.success, message);
  },
  info(message) {
    this.alert(this.types.info, message);
  },
  warning(message) {
    this.alert(this.types.warning, message);
  },
  error(message) {
    this.alert(this.types.error, message);
  },

  alert(type, message) {
    const typeString = this.types[type] || this.types.info;

    this.Collections.Alerts.insert({ type: typeString, message });
  },

  types: {
    success: 'success',
    info: 'info',
    warning: 'warning',
    error: 'error',
  },
};

export default Alert;
