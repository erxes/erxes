import { set, isValid } from "date-fns";

export const combineDateTime = (date: Date | null, timeString: string | null): Date | null => {
  if (!date || !timeString?.trim()) {
    return null;
  }
  if (!isValid(date)) {
    return null;
  }

  const timeRegex = /^([0-1]?\d|2[0-3]):([0-5]\d)$/;
  const match = timeRegex.exec(timeString.trim());
  if (!match) {
    return null;
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  try {
    const combinedDate = set(date, { 
      hours, 
      minutes, 
      seconds: 0, 
      milliseconds: 0 
    });
    return isValid(combinedDate) ? combinedDate : null;
  } catch (error) {
    return null;
  }
};