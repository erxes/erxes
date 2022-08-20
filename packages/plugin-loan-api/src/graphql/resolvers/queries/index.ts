import adjustmentQueries from './adjustments';
import contractQueries from './contracts';
import contractTypeQueries from './contractTypes';
import insuranceTypeQueries from './insuranceTypes';
import invoiceQueries from './invoices';
import scheduleQueries from './schedules';
import transactionQueries from './transactions';
import collateralQueries from './collaterals';
import erkhetResponseQueries from './erkhetResponses';

export default {
  ...adjustmentQueries,
  ...contractTypeQueries,
  ...contractQueries,
  ...insuranceTypeQueries,
  ...invoiceQueries,
  ...scheduleQueries,
  ...transactionQueries,
  ...collateralQueries,
  ...erkhetResponseQueries
};
