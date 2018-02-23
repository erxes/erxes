const hasAnyActivity = log => {
  let hasAny = false;

  log.forEach(item => {
    if (item.list.length > 0) {
      hasAny = true;
    }
  });

  return hasAny;
};

export { hasAnyActivity };
