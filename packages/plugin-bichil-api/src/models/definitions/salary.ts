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
    employeeId: field({ type: String, label: 'Ажилтаны код', symbol: '' }),
    totalWorkHours: field({
      type: Number,
      label: 'Ажиллавал зохих цаг',
      symbol: 'ц'
    }),
    totalWorkedHours: field({
      type: Number,
      label: 'Ажилласан цаг',
      symbol: 'ц'
    }),
    mainSalary: field({ type: Number, label: 'Үндсэн цалин', symbol: '₮' }),
    bonus: field({ type: Number, label: 'Урамшуулал', symbol: '₮' }),
    addition: field({ type: Number, label: 'Нэмэгдэл', symbol: '₮' }),
    appointment: field({
      type: Number,
      label: 'Эрхлэгч томилолт',
      symbol: '₮'
    }),
    kpi: field({ type: Number, label: 'KPI', symbol: '%' }),
    vacation: field({ type: Number, label: 'ЭАмралт', symbol: '₮' }),
    totalAddition: field({ type: Number, label: 'Нийт нэмэгдэл', symbol: '₮' }),
    lateHoursDeduction: field({ type: Number, label: 'Хоцролт', symbol: 'м' }),
    resultDeduction: field({
      type: Number,
      label: 'Үр дүн хасалт',
      symbol: '₮'
    }),
    totalDeduction: field({ type: Number, label: 'Нийт хасалт', symbol: '₮' }),
    totalSalary: field({ type: Number, label: 'Нийт цалин', symbol: '₮' }),
    preliminarySalary: field({
      type: Number,
      label: 'Урьдчилгаа цалин',
      symbol: '₮'
    }),
    receivable: field({ type: Number, label: 'Авлага', symbol: '₮' }),
    ndsh: field({ type: Number, label: 'ЭМНДШ', symbol: '₮' }),
    hhoat: field({ type: Number, label: 'ХХОАТ', symbol: '₮' }),
    mainDeduction: field({ type: Number, label: 'Нийт суутгал', symbol: '₮' }),
    biSan: field({ type: Number, label: 'BI Сан', symbol: '₮' }),
    phoneCharge: field({ type: Number, label: 'Ярианы төлбөр', symbol: '₮' }),
    taxReceivable: field({
      type: Number,
      label: 'Татвар хөнгөлөлт авлага',
      symbol: '₮'
    }),
    salaryOnHand: field({
      type: Number,
      label: 'Гарт олгох цалин',
      symbol: '₮'
    }),
    title: field({ type: String, label: 'title', symbol: '' }),
    createdAt: field({ type: Date, label: 'created at', symbol: '' }),
    createdBy: field({ type: String, label: 'created by', symbol: '' })
  })
);
