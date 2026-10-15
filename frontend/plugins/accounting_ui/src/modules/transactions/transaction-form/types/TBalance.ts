import { ITrDetail } from '../../types/Transaction';

export interface ITBalanceTransaction {
  date: Date;
  number?: string;
  detail: ITrDetail;
  branch?: ITrDetail['branch'];
  department?: ITrDetail['department'];
  journalIndex: string;
}
