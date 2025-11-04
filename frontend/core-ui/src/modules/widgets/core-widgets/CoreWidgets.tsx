import { IRelationWidgetProps } from 'ui-modules';
import { CustomerWidgets } from './customer/CustomerWidgets';
import { CompanyWidgets } from './company/CompanyWidgets';

export const CoreWidgets = (props: IRelationWidgetProps) => {
  const { module } = props;

  console.log(props);

  if (module === 'customer') {
    return <CustomerWidgets {...props} />;
  }

  if (module === 'company') {
    return <CompanyWidgets {...props} />;
  }

  return null;
};
