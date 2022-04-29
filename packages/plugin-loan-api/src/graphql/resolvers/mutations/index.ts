import adjustments from './adjustments';
import contracts from './contracts';
import contractTypes from './contractTypes';
import insuranceTypes from './insuranceTypes';
import invoices from './invoices';
import schedules from './schedules';
import transactions from './transactions';

export default {
  ...adjustments,
  ...contractTypes,
  ...contracts,
  ...insuranceTypes,
  ...invoices,
  ...schedules,
  ...transactions,
};
