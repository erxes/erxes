import { TourFormValues } from '../constants/formSchema';

export const transformTourFormData = (data: TourFormValues) => {
  const { isFlexibleDate, availableFrom, availableTo, ...rest } = data;

  return {
    ...rest,
    dateType: isFlexibleDate ? 'flexible' : 'fixed',
    startDate: isFlexibleDate ? null : data.startDate,
    endDate: isFlexibleDate ? null : data.endDate,
    availableFrom: isFlexibleDate ? availableFrom : null,
    availableTo: isFlexibleDate ? availableTo : null,
  };
};
