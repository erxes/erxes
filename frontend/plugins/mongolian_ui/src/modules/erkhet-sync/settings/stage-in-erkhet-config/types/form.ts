import { Control } from 'react-hook-form';

export type TErkhetConfig = {
  title: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  userEmail: string;
  chooseResponseField: string;
  hasVat: boolean;
  hasCityTax: boolean;
  anotherRulesOfProductsOnCitytax: string;
  anotherRulesOfProductsOnVat: string;
  defaultPay: string;
  нэхэмжлэх: string;
  хаанБанкданс: string;
  голомтБанкданс: string;
  barter: string;
};

export type TFormControl = Control<TErkhetConfig>;
