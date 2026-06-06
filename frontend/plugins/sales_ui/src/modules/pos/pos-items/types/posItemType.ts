export interface TPosItemForm {
  cashAmount: number;
  mobileAmount: number;
  spendPoints: number;
  name?: string;
  description?: string;
  [key: string]: number | string | undefined;
}

export type TPosItemFormData = {
  [key: string]: number | string | undefined;
};
