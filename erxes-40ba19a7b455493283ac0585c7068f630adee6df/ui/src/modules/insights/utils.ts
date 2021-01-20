import dayjs from 'dayjs';
import { IOption } from 'modules/common/types';
import { INTEGRATION_KINDS } from 'modules/settings/integrations/constants';

export function selectOptions(array) {
  const options: IOption[] = [];
  array.map(item => options.push({ value: item._id, label: item.name }));
  return options;
}

export function integrationOptions() {
  const options: IOption[] = [];

  INTEGRATION_KINDS.ALL.map(item =>
    options.push({
      value: item.value,
      label: item.text
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
