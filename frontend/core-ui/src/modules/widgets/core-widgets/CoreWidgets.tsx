import { IRelationWidgetProps } from 'ui-modules';
import { CustomerWidgets } from './customer/CustomerWidgets';
import { CompanyWidgets } from './company/CompanyWidgets';
import { TrackedDataWidgets } from './tracked-data/TrackedDataWidgets';

export const CoreWidgets = (props: IRelationWidgetProps) => {
  const { module } = props;

  if (module === 'customer') {
    return <CustomerWidgets {...props} />;
  }

  if (module === 'company') {
    return <CompanyWidgets {...props} />;
  }

  if (module === 'trackedData') {
    return <TrackedDataWidgets {...props} />;
  }

  return null;
};
