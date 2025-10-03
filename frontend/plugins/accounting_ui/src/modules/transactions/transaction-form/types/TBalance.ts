import { IBranch, IDepartment } from "ui-modules";
import { ITrDetail } from "../../types/Transaction";

export interface ITBalanceTransaction {
  date: Date,
  number?: string,
  detail: ITrDetail,
  branch?: IBranch,
  department?: IDepartment,
  journalIndex: string
}