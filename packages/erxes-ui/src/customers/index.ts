import CustomerSection from './components/CustomerSection';
import CustomerForm from './containers/CustomerForm';
import SelectCustomers from './containers/SelectCustomers';
import { queries as customerQueries, mutations as customerMutations } from './graphql';
import * as CustomerTypes from './types';

export {
  CustomerSection, CustomerForm, SelectCustomers, customerQueries, customerMutations, CustomerTypes
}