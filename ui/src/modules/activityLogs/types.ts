import {
  IActivityLog as IActivityLogC,
  IActivityLogForMonth as IActivityLogForMonthC
} from 'erxes-ui/lib/activityLogs/types';
import { IEmailDelivery } from 'modules/engage/types';

export type IActivityLog = IActivityLogC;

export type IActivityLogForMonth = IActivityLogForMonthC;

export type EmailDeliveryDetailQueryResponse = {
  emailDeliveryDetail: IEmailDelivery;
  loading: boolean;
};

export type IActivityLogItemProps = {
  activity: IActivityLog;
};
