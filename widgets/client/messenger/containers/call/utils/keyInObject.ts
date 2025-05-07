export default function keyInObject<T extends object>(
  obj: T,
  key: keyof any
): key is keyof T {
  return key in obj
}
