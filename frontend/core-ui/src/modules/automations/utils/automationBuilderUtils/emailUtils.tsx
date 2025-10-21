import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/types/automationSendEmail';
import {
  GET_CUSTOMERS_EMAIL,
  GET_TEAM_MEMBERS_EMAIL,
} from '@/automations/graphql/utils';
import { ICustomer } from '@/contacts/types/customerType';
import { IUser } from '@/settings/team-member/types';
import { useQuery } from '@apollo/client';

export const generateSendEmailRecipientMails = ({
  attributionMails,
  customMails = [],
  customer = [],
  teamMember = [],
}: TAutomationSendEmailConfig) => {
  let mails: string[] = [];

  if (attributionMails) {
    mails.push(attributionMails);
  }
  if (customMails.length) {
    mails = [...mails, ...customMails];
  }

  if (customer.length) {
    const { data } = useQuery(GET_CUSTOMERS_EMAIL);

    const customerMails = (data?.list || [])
      .map(({ primaryEmail }: ICustomer) => primaryEmail)
      .filter((email: string) => email);
    mails = [...mails, ...customerMails];
  }
  if (teamMember.length) {
    const { data } = useQuery(GET_TEAM_MEMBERS_EMAIL);

    const teamMemberMails = (data?.list || [])
      .map(({ email }: IUser) => email)
      .filter((email: string) => email);
    mails = [...mails, ...teamMemberMails];
  }

  return mails;
};
