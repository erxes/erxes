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

export function convertTime(second) {
  if (!second) {
    return 0;
  }

  let hours = Math.floor(second / 3600);
  let minutes = Math.floor((second - hours * 3600) / 60);
  let seconds = second - hours * 3600 - minutes * 60;

  if (hours < 10) {
    hours = '0' + hours;
  }
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  if (seconds < 10) {
    seconds = '0' + seconds;
  }

  return hours + ':' + minutes + ':' + seconds;
}
