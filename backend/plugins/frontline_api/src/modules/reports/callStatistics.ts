const parseDate = (dateObj) => {
  return new Date(dateObj.$date || dateObj);
};

export const calculateServiceLevel = async (filteredCalls) => {
  const answeredCalls = filteredCalls.filter(
    (call) => call.disposition === 'ANSWERED' && call.userfield === 'Inbound',
  );

  const answeredWithin20Sec = answeredCalls.filter((call) => {
    const startTime = parseDate(call.start).getTime();
    const answerTime = parseDate(call.answer).getTime();
    const waitTime = (answerTime - startTime) / 1000;
    return waitTime <= 20;
  });

  if (answeredCalls.length === 0) return 0;

  return (answeredWithin20Sec.length / answeredCalls.length) * 100;
};

export const calculateFirstCallResolution = async (filteredCalls) => {
  const answeredCalls = filteredCalls.filter(
    (call) =>
      call.disposition === 'ANSWERED' &&
      call.userfield === 'Inbound' &&
      call.lastapp !== 'ForkCDR',
  );
  // Group by uniqueId
  const callerGroups = {};
  answeredCalls.forEach((call) => {
    if (!callerGroups[call.src]) {
      callerGroups[call.src] = [];
    }
    callerGroups[call.src].push(call);
  });

  const totalCallers = Object.keys(callerGroups).length;
  const firstCallResolved = Object.values(callerGroups).filter(
    (calls: any) => calls.length === 1,
  ).length;

  if (totalCallers === 0) return 0;
  return (firstCallResolved / totalCallers) * 100;
};

export const calculateAbandonmentRate = async (filteredCalls) => {
  const inboundCalls = filteredCalls.filter(
    (call) => call.userfield === 'Inbound',
  );
  const abandonedCalls = inboundCalls.filter((call) =>
    ['NO ANSWER', 'BUSY', 'FAILED'].includes(call.disposition),
  );

  if (inboundCalls.length === 0) return 0;

  return (abandonedCalls.length / inboundCalls.length) * 100;
};

export const calculateOccupancyRate = async (
  filteredCalls,
  workingHours = 8,
) => {
  const answeredCalls = filteredCalls.filter(
    (call) =>
      call.disposition === 'ANSWERED' &&
      call.userfield === 'Inbound' &&
      call.lastapp !== 'ForkCDR',
  );

  const totalTalkTime = answeredCalls.reduce(
    (sum, call) => sum + call.billsec,
    0,
  );
  const totalAnsweredCalls = answeredCalls.length;

  const workingTimeSeconds = workingHours * 3600;
  const totalAvailableTime = totalTalkTime + totalAnsweredCalls * 180; // 3 minutes = 180 seconds

  if (totalAvailableTime === 0) return 0;

  return (workingTimeSeconds / totalAvailableTime) * 100;
};

export const calculateAverageSpeedOfAnswer = async (filteredCalls) => {
  const answeredCalls = filteredCalls.filter(
    (call) =>
      call.disposition === 'ANSWERED' &&
      call.userfield === 'Inbound' &&
      call.lastapp !== 'ForkCDR',
  );

  const totalWaitTime = answeredCalls.reduce((sum, call) => {
    const startTime = parseDate(call.start).getTime();
    const answerTime = parseDate(call.answer).getTime();
    const waitTime = (answerTime - startTime) / 1000;
    return sum + waitTime;
  }, 0);

  if (answeredCalls.length === 0) return 0;

  return totalWaitTime / answeredCalls.length;
};

export const calculateAverageHandlingTime = async (filteredCalls) => {
  const answeredCalls = filteredCalls.filter(
    (call) =>
      call.disposition === 'ANSWERED' &&
      call.userfield === 'Inbound' &&
      call.lastapp !== 'ForkCDR',
  );

  const totalHandlingTime = answeredCalls.reduce(
    (sum, call) => sum + call.billsec,
    0,
  );

  if (answeredCalls.length === 0) return 0;

  return totalHandlingTime / answeredCalls.length;
};
