export const getTempId = () => {
  return `temp${Math.random()}`
}

export const getTrSide = (mainSide?: 'dt' | 'ct' | string, isInverse?: boolean) => {
  if (isInverse) {
    if (mainSide === 'dt') {
      return 'ct'
    }
    return 'dt'
  }

  return mainSide || 'dt';
}