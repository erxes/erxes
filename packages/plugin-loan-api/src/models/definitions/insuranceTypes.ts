export interface IInsuranceType {
  code: string;
  name: string;
  description: string;
  companyId: string;
  percent: number;
  yearPercents: number[];
  createdBy: string;
  createdAt: Date;
}

export interface IInsuranceTypeDocument extends IInsuranceType {
  _id: string;
}

export const insuranceTypeSchema = {
  _id: { pkey: true },
  code: { type: String, label: 'Code', unique: true },
  name: { type: String, label: 'Name' },
  description: { type: String, optional: true, label: 'Description' },
  companyId: { type: String, label: 'Company' },
  percent: { type: Number, label: 'Percent' },
  yearPercents: { type: [Number], label: 'percent of years' },
  createdBy: { type: String, label: 'Created By' },
  createdAt: {
    type: Date,
    default: new Date(),
    label: 'Created at',
  }
};
