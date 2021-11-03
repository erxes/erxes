class ObjectHelper {
  genID() {
    function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (
      S4() +
      S4() +
      '-' +
      S4() +
      '-4' +
      S4().substr(0, 3) +
      '-' +
      S4() +
      '-' +
      S4() +
      S4() +
      S4()
    ).toLowerCase();
  }

  deepClone(obj) {
    if (!this.isObject(obj)) return obj;

    let result = { ...obj };
    for (let key in result) {
      result[key] = this.deepClone(result[key]);
    }
    return result;
  }

  isObject(value) {
    if (
      typeof value === 'string' ||
      typeof value === 'boolean' ||
      typeof value === 'number'
    )
      return false;
    return true;
  }
}
const instanceObjectHelper = new ObjectHelper();
export default instanceObjectHelper;
