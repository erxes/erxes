export const STORAGE_BOARD_KEY = 'erxesCurrentBoardId';
export const STORAGE_PIPELINE_KEY = 'erxesCurrentPipelineId';

export const PRIORITIES = ['Critical', 'High', 'Normal', 'Low'];
export const COLORS = [
  '#01aecc',
  '#D9E3F0',
  '#F47373',
  '#697689',
  '#4bbf6b',
  '#0078bf',
  '#89609d',
  '#838c91',
  '#cd5a91',
  '#d29034',
  '#63D2D6',
  '#F7CE53'
];

export const TEXT_COLORS = [
  '#fff',
  '#fefefe',
  '#fafafa',
  '#ccc',
  '#ddd',
  '#888',
  '#444',
  '#333',
  '#222',
  '#000'
];
export const REMINDER_MINUTES = [
  { _id: '0', name: 'At Time of Due Date' },
  { _id: '5', name: '5 Minutes Before' },
  { _id: '10', name: '10 Minutes Before' },
  { _id: '15', name: '15 Minutes Before' },
  { _id: '60', name: '1 Hour Before' },
  { _id: '120', name: '2 Hour Before' },
  { _id: '1440', name: '1 Day Before' },
  { _id: '2880', name: '2 Day Before' }
];

export const PIPELINE_UPDATE_STATUSES = {
  START: 'start',
  END: 'end',
  NEW_REQUEST: 'newRequest'
};
