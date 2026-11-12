export const isDefined = <T>(value: T | null | undefined): value is T =>
  value !== undefined && value !== null;
