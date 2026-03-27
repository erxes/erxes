import SalesBoard from './board';
import SalesChecklist from './checklist';
import Deal from './deal';
import SalesPipeline from './pipeline';
import SalesStage from './stage';
import ExportResolvers from './export';

export default {
  SalesBoard,
  SalesPipeline,
  SalesStage,
  Deal,
  SalesChecklist,
  Query: {
    ...ExportResolvers,
  },
};
