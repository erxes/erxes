export const randomBetween = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

const RandomTypes = {
  '0-9': '0123456789',
  'a-z': 'abcdefghijklmnopqrstuvwxyz',
  'A-Z': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'a-Z': 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '0-z': '0123456789abcdefghijklmnopqrstuvwxyz',
  '0-Z': '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '0-zZ': '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
}

const generateRandom = (type: string, len: number) => {
  const charSet = RandomTypes[type] || '0123456789';

  let randomString = '';

  for (let i = 0; i < len; i++) {
    const position = Math.floor(Math.random() * charSet.length);
    randomString = `${randomString}${charSet.substring(position, position + 1)}`;
  }

  return randomString;
};

export const getRandomNumber = (number) => {
  const re = /{ \[.-..?\] \* [0-9]* }/g;
  const items = number.match(/{ \[.-..?\] \* [0-9]* }|./g)

  const result = []
  for (const item of items) {
    let str = item;
    if (re.test(str)) {
      const key = (str.match(/\[.-..?\]/g)[0] || '').replace('[', '').replace(']', '');
      const len = parseInt((str.match(/ \* [0-9]* /g)[0] || '').substring(3) || 0);

      str = generateRandom(key, len)
    }

    result.push(item)
  }

  return result.join()
}
