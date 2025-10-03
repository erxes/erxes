import { StepConfig } from '../pos-detail/types/IPosLayout';
import { CustomNode } from '../slot/types';

export const ALLOW_TYPES = [
  { value: 'eat', label: 'Eat', kind: 'sale' },
  { value: 'take', label: 'Take', kind: 'sale' },
  { value: 'delivery', label: 'Delivery', kind: 'sale' },
  { value: 'loss', label: 'Loss', kind: 'out' },
  { value: 'spend', label: 'Spend', kind: 'out' },
  { value: 'reject', label: 'Reject', kind: 'out' },
];

export const ALLOW_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'doing', label: 'Doing' },
  { value: 'reDoing', label: 'Redoing' },
  { value: 'done', label: 'Done' },
  { value: 'complete', label: 'Complete' },
  { value: 'pending', label: 'Pending' },
  { value: 'return', label: 'Return' },
];

export const FILTER_PARAMS = [
  'search',
  'customerId',
  'customerType',
  'billType',
  'registerNumber',
  'type',
  'createdStartDate',
  'createdEndDate',
  'paidStartDate',
  'paidEndDate',
  'financeStartDate',
  'financeEndDate',
  'paidDate',
  'userId',
  'hasntUser',
];

export const SCREEN_TYPE_OPTIONS = [
  { label: 'Time', value: 'time' },
  { label: 'Manual', value: 'manual' }, // used only in kitchen
  { label: 'Count', value: 'count' }, // used only in waiting
];
//kitchen status change
export const KITCHEN_TYPE_OPTIONS = [
  { label: 'Time', value: 'time' },
  { label: 'Manual', value: 'manual' },
];
//waiting change type
export const WAITING_TYPE_OPTIONS = [
  { label: 'Time', value: 'time' },
  { label: 'Count', value: 'count' },
];
// kitchen show types
export const SHOW_TYPE_OPTIONS = [
  { label: 'All saved orders', value: 'all' },
  { label: 'Paid all orders', value: 'paid' },
  // { label: "Orders containing certain products", value: "filtered" }, // optional/future
  { label: 'Defined orders only', value: 'click' },
];
export const options = [
  { value: 'debtAmount', label: 'Зээлийн данс' },
  { value: 'cashAmount', label: 'Бэлэн мөнгө данс' },
  { value: 'cardAmount', label: 'Картын данс' },
  { value: 'card2Amount', label: 'Картын данс нэмэлт' },
  { value: 'mobileAmount', label: 'Мобайл данс' },
  { value: 'debtBarterAmount', label: 'Бартер данс' },
];

export const DefaultNode: CustomNode = {
  id: '1',
  type: 'tableNode',
  position: { x: 250, y: 100 },
  data: {
    label: 'TABLE 1',
    code: '01',
    color: '#4F46E5',
    width: 80,
    height: 80,
    positionX: 250,
    positionY: 100,
    rounded: false,
    rotateAngle: 0,
    zIndex: 0,
    disabled: false,
  },
};

export const GRID_LAYOUT = {
  SPACING_X: 200,
  SPACING_Y: 150,
  COLUMNS: 3,
  START_X: 100,
  START_Y: 100,
};

export const DEFAULT_SLOT_DIMENSIONS = {
  WIDTH: 80,
  HEIGHT: 80,
};

export const SNAP_GRID = [20, 20] as const;

export const LAYOUT = {
  STEPPER_WIDTH: 'w-44',
  CONTENT_MAX_HEIGHT: 'max-h-[calc(100vh-120px)]',
  STEPPER_INDICATOR_LEFT: 'left-[18px]',
  STEPPER_SEPARATOR_TOP: 'top-9',
  STEPPER_SEPARATOR_HEIGHT: 'h-8',
};

export const getSteps = (posCategory: string | null): StepConfig[] => {
  const baseSteps: StepConfig[] = [
    { value: 'overview', title: 'Choose category' },
    { value: 'properties', title: 'General information' },
    { value: 'payments', title: 'Payments' },
    { value: 'permission', title: 'Permission' },
    { value: 'product', title: 'Product & Service' },
    { value: 'appearance', title: 'Appearance' },
    { value: 'screen', title: 'Screen config' },
    { value: 'ebarimt', title: 'Ebarimt config' },
    { value: 'finance', title: 'Finance config' },
    { value: 'delivery', title: 'Delivery config' },
    { value: 'sync', title: 'Sync card' },
  ];

  if (posCategory === 'restaurant') {
    const updatedSteps = [...baseSteps];
    updatedSteps.splice(2, 0, { value: 'slot', title: 'Slot' });
    return updatedSteps;
  }

  return baseSteps;
};

export const navigateToTab = (
  setSearchParams: (params: URLSearchParams) => void,
  searchParams: URLSearchParams,
  tabValue: string,
): void => {
  const newParams = new URLSearchParams(searchParams);
  newParams.set('tab', tabValue);
  setSearchParams(newParams);
};

export const TOAST_MESSAGES = {
  POS_CREATED: 'POS created successfully',
  POS_CREATION_FAILED: 'Failed to create POS',
  SLOTS_SAVED: 'Slots saved successfully',
  SLOTS_SAVE_FAILED: 'Failed to save slots',
  TRY_AGAIN: 'Please try again later',
} as const;
