import { field, schemaWrapper } from '@erxes/api-utils/src/definitions/utils';
import { Document, Schema } from 'mongoose';

export interface ISalary {
  employeeId: string;
  totalWorkHours: number;
  totalWorkedHours: number;
  mainSalary: number;
  adequateSalary: number;
  kpi: number;
  onAddition: number;
  bonus: number;
  vacation: number;
  addition: number;
  totalAddition: number;
  lateHoursDeduction: number;
  resultDeduction: number;
  totalDeduction: number;
  totalSalary: number;
  preliminarySalary: number;
  kpiDeduction: number;
  onDeduction: number;
  bonusDeduction: number;
  vacationDeduction: number;
  ndsh: number;
  hhoat: number;
  mainDeduction: number;
  salaryOnHand: number;
  receivable: number;
  biSan: number;
  toSendBank: number;

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
    employeeId: field({ type: String, label: 'Ажилтны код', symbol: '' }),
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
    kpi: field({ type: Number, label: 'Сарын KPI', symbol: '₮' }),
    vacation: field({ type: Number, label: 'Ээлжийн Амралт', symbol: '₮' }),
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
    ndsh: field({ type: Number, label: 'ЭМД 2% НДШ 9.5%', symbol: '₮' }),
    hhoat: field({ type: Number, label: 'ХХОАТ', symbol: '₮' }),
    mainDeduction: field({ type: Number, label: 'Нийт суутгал', symbol: '₮' }),
    biSan: field({ type: Number, label: 'BI Сан', symbol: '₮' }),

    salaryOnHand: field({
      type: Number,
      label: 'Гарт олгох цалин',
      symbol: '₮'
    }),
    title: field({ type: String, label: 'title', symbol: '' }),
    createdAt: field({ type: Date, label: 'created at', symbol: '' }),
    createdBy: field({ type: String, label: 'created by', symbol: '' }),
    adequateSalary: field({
      type: Number,
      label: 'Олговол зохих цалин',
      symbol: '₮'
    }),
    kpiDeduction: field({
      type: Number,
      label: 'Сарын KPI суутгал',
      symbol: '₮'
    }),
    onDeduction: field({
      type: Number,
      label: 'ОНутаг нэмэгдэл суутгал',
      symbol: '₮'
    }),
    bonusDeduction: field({
      type: Number,
      label: 'Урамшуулал суутгал',
      symbol: '₮'
    }),
    vacationDeduction: field({
      type: Number,
      label: 'ЭАмралтын суутгал',
      symbol: '₮'
    }),
    onAddition: field({ type: Number, label: 'ОНутаг нэмэгдэл', symbol: '₮' }),
    toSendBank: field({
      type: Number,
      label: 'Банкны дансруу шилжүүлэх',
      symbol: '₮'
    })
  })
);
