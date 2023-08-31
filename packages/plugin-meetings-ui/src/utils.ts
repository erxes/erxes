const colorList = [
  '#FF5733',
  '#1E90FF',
  '#FFD700',
  '#8A2BE2',
  '#00FF00',
  '#FF4500',
  '#9932CC',
  '#FF1493',
  '#32CD32',
  '#FFA500',
  '#4682B4',
  '#FF6347',
  '#800080',
  '#008000',
  '#7B68EE',
  '#FF69B4',
  '#ADFF2F',
  '#6A5ACD',
  '#FFD700',
  '#2E8B57',
  '#BA55D3',
  '#228B22',
  '#8B008B',
  '#00CED1',
  '#9932CC',
  '#00FFFF',
  '#FF00FF',
  '#8B4513',
  '#20B2AA',
  '#9370DB'
];

export const generateColorCode = (userId: string) => {
  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + (acc << 6) + (acc << 16) - acc;
  }, 0);

  // Use modulo to ensure the index is within the bounds of the color list
  const index = Math.abs(hash) % colorList.length;
  // Return the color from the list
  return colorList[index];
};
