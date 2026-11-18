import { ITrDetail } from '../../types/Transaction';

export interface ITBalanceTransaction {
  date: Date;
  number?: string;
  ptrId?: string;
  side?: string;
  branchId?: string;
  departmentId?: string;
  detail: ITrDetail;
  branch?: ITrDetail['branch'];
  department?: ITrDetail['department'];
  journalIndex: string;
}
