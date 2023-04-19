import { field, schemaWrapper } from '@erxes/api-utils/src/definitions/utils';
import { Document, Schema } from 'mongoose';

export interface ISalary {
  employeeId: string;
  totalWorkHours: number;
  totalWorkedHours: number;
  mainSalary: number;
  bonus: number;
  addition: number;
  appointment: number;
  kpi: number;
  vacation: number;
  totalAddition: number;
  lateHoursDeduction: number;
  resultDeduction: number;
  totalDeduction: number;
  totalSalary: number;
  preliminarySalary: number;
  receivable: number;
  ndsh: number;
  hhoat: number;
  mainDeduction: number;
  biSan: number;
  phoneCharge: number;
  taxReceivable: number;
  salaryOnHand: number;
  title: string;

  createdAt: Date;
  createdBy: string;
}
export interface ISalaryDocument extends ISalary, Document {
  _id: string;
}

export const salarySchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    employeeId: field({ type: String, label: 'Ажилтаны код' }),
    totalWorkHours: field({ type: Number, label: 'Ажиллавал зохих цаг' }),
    totalWorkedHours: field({ type: Number, label: 'Ажилласан цаг' }),
    mainSalary: field({ type: Number, label: 'Үндсэн цалин' }),
    bonus: field({ type: Number, label: 'Урамшуулал' }),
    addition: field({ type: Number, label: 'Нэмэгдэл' }),
    appointment: field({ type: Number, label: 'Эрхлэгч томилолт' }),
    kpi: field({ type: Number, label: 'KPI' }),
    vacation: field({ type: Number, label: 'ЭАмралт' }),
    totalAddition: field({ type: Number, label: 'Нийт нэмэгдэл' }),
    lateHoursDeduction: field({ type: Number, label: 'Хоцролт' }),
    resultDeduction: field({ type: Number, label: 'Үр дүн хасалт' }),
    totalDeduction: field({ type: Number, label: 'Нийт хасалт' }),
    totalSalary: field({ type: Number, label: 'Нийт цалин' }),
    preliminarySalary: field({ type: Number, label: 'Урьдчилгаа цалин' }),
    receivable: field({ type: Number, label: 'Авлага' }),
    ndsh: field({ type: Number, label: 'ЭМНДШ' }),
    hhoat: field({ type: Number, label: 'ХХОАТ' }),
    mainDeduction: field({ type: Number, label: 'Нийт суутгал' }),
    biSan: field({ type: Number, label: 'BI Сан' }),
    phoneCharge: field({ type: Number, label: 'Ярианы төлбөр' }),
    taxReceivable: field({ type: Number, label: 'Татвар хөнгөлөлт авлага' }),
    salaryOnHand: field({ type: Number, label: 'Гарт олгох цалин' }),
    title: field({ type: String, label: 'title' }),
    createdAt: field({ type: Date, label: 'created at' }),
    createdBy: field({ type: String, label: 'created by' })
  })
);
