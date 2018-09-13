export function selectOptions(array) {
  const options = [];
  array.map(item => options.push({ value: item._id, label: item.name }));
  return options;
}

export function integrationOptions(array) {
  const options = [];
  array.map(item => options.push({ value: item, label: item }));
  return options;
}

export function convertTime(second?: number) {
  if (!second) {
    return '0';
  }

  const hours = Math.floor(second / 3600);
  const minutes = Math.floor((second - hours * 3600) / 60);
  const seconds = second - hours * 3600 - minutes * 60;

  const timeFormat = (num: number) => {
    if(num < 10) return '0' + num.toString();
    
    return num.toString();
  }

  return timeFormat(hours) + ':' + timeFormat(minutes) + ':' + timeFormat(seconds);
}
