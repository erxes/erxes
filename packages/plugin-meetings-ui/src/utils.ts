export const colorList = [
  '#FF8D00',
  '#1E90FF',
  '#9a8200',
  '#00b400',
  '#991310',
  '#BA55D3',
  '#9370DB',
  '#4986E7',
  '#04c1c1',
  '#FF1493',
  '#32CD32',
  '#FFA500',
  '#4682B4',
  '#FF6347',
  '#ffd600',
  '#7B68EE',
  '#FF69B4',
  '#517817',
  '#6A5ACD',
  '#2E8B57',
  '#EA352E',
  '#b4a200',
  '#78658a',
  '#206a6b',
  '#0020bb',
  '#8B4513',
  '#008d96',
  '#61058B'
];

export const generateColorCode = (userId: string) => {
  const hash = userId.split('').reduce((acc, char) => {
    return acc * 3 + char.charCodeAt(0); // Improved hash calculation
  }, 0);

  // Use modulo to ensure the index is within the bounds of the color list
  const index = Math.abs(hash) % colorList.length;
  // Return the color from the list
  return colorList[index];
};
