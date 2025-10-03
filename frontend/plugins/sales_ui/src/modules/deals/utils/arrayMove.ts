export function arrayMove<T>(array: T[], fromIndex: number, toIndex: number): T[] {
    const newArr = array.slice();
    const [movedItem] = newArr.splice(fromIndex, 1);
    newArr.splice(toIndex, 0, movedItem);
    return newArr;
  }