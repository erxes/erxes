export type PrintOrientation = 'portrait' | 'landscape';

export type PrintItem = {
  _id: string;
};

export type PrintFormValues = {
  _id: string;
  brandId: string;
  branchId: string;
  copies: number;
  departmentId: string;
  height: number;
  margin: number;
  offsetX: number;
  offsetY: number;
  orientation: PrintOrientation;
  replacerIds: string[];
  scale: number;
  size: string;
  width: number;
};

export type PrintLayoutConfig = Pick<
  PrintFormValues,
  | 'size'
  | 'orientation'
  | 'width'
  | 'height'
  | 'margin'
  | 'scale'
  | 'offsetX'
  | 'offsetY'
>;
