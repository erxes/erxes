import { __ } from 'modules/common/utils';
import s from 'underscore.string';

export const formatMemorySize = memorySize => {
  if (typeof memorySize !== 'number') {
    return null;
  }

  const units = ['bytes', 'kB', 'MB', 'GB'];

  let order;
  for (order = 0; order < units.length - 1; ++order) {
    const upperLimit = Math.pow(1024, order + 1);

    if (memorySize < upperLimit) {
      break;
    }
  }

  const divider = Math.pow(1024, order);
  const decimalDigits = order === 0 ? 0 : 2;
  return `${s.numberFormat(memorySize / divider, decimalDigits)} ${
    units[order]
  }`;
};

export const formatDuration = duration => {
  const days = Math.floor(duration / 86400);
  const hours = Math.floor((duration % 86400) / 3600);
  const minutes = Math.floor(((duration % 86400) % 3600) / 60);
  const seconds = Math.floor(((duration % 86400) % 3600) % 60);
  let out = '';
  if (days > 0) {
    out += `${days} ${__('days')}, `;
  }
  if (hours > 0) {
    out += `${hours} ${__('hours')}, `;
  }
  if (minutes > 0) {
    out += `${minutes} ${__('minutes')}, `;
  }
  if (seconds > 0) {
    out += `${seconds} ${__('seconds')}`;
  }
  return out;
};
