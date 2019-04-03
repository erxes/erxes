import { connect } from '../connection';

import CompanyListeners from './Companies';
import ConversationListeners from './Conversations';
import CustomerListeners from './Customers';
import DealListeners from './Deals';
import EmailDeliveryListeners from './EmailDeliveries';
import InternalNoteListeners from './InternalNotes';

export const listen = async () => {
  try {
    await connect();

    CompanyListeners();

    ConversationListeners();

    CustomerListeners();

    DealListeners();

    EmailDeliveryListeners();

    InternalNoteListeners();
  } catch (error) {
    console.log(error);
  }
};
