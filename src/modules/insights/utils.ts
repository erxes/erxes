import dayjs from 'dayjs';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';

export type OptionsType = {
  value: string;
  label: string;
};

export function selectOptions(array) {
  const options: OptionsType[] = [];
  array.map(item => options.push({ value: item._id, label: item.name }));
  return options;
}

export function integrationOptions(array) {
  const options: OptionsType[] = [];
  const types = KIND_CHOICES.ALL_LIST;

  array.map(item =>
    options.push({
      value: types.includes(item) ? item : '',
      label: item
    })
  );

  return options;
}

export function convertTime(second?: number) {
  if (!second) {
    return '0';
  }

  const hours = Math.floor(second / 3600);
  const minutes = Math.floor((second - hours * 3600) / 60);
  const seconds = second - hours * 3600 - minutes * 60;

  return (
    hours.toString() +
    'h : ' +
    minutes.toString() +
    'm : ' +
    seconds.toString() +
    's'
  );
}

export function formatDate(date: string): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
}
