import { ICompany } from 'modules/companies/types';
import { ICustomer } from 'modules/customers/types';
import { IDeal } from 'modules/deals/types';
import { ITask } from 'modules/tasks/types';
import { ITicket } from 'modules/tickets/types';

export const onSelectChange = (
  name: string,
  value: any,
  createConformity: (relType: string, relTypeIds: string[]) => void
) => {
  let relType: string = '';
  let relTypeIds: string[] = [];
  switch (name) {
    case 'companies':
      relType = 'company';
      relTypeIds = (value as ICompany[]).map(company => company._id);
      break;

    case 'customers':
      relType = 'customer';
      relTypeIds = (value as ICustomer[]).map(customer => customer._id);
      break;

    case 'deals':
      relType = 'deal';
      relTypeIds = (value as IDeal[]).map(deal => deal._id);
      break;

    case 'tasks':
      relType = 'task';
      relTypeIds = (value as ITask[]).map(task => task._id);
      break;

    case 'tickets':
      relType = 'ticket';
      relTypeIds = (value as ITicket[]).map(ticket => ticket._id);
      break;
  }

  return createConformity(relType, relTypeIds);
};
