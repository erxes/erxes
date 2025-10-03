export const cleanIntegrationType = (name: string) => {
  if (name.includes('nylas')) {
    name = name.replace('nylas-', '');
  }
  if (name.includes('smooch')) {
    name = name.replace('smooch-', '');
  }
  if (name === 'lead') {
    name = 'forms';
  }
  return name;
};
