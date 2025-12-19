// Helper function - implement according to your pricing rules
function calculatePremium(pricingConfig: any, insuredObject: any, typeName: string) {
  if (typeName === 'Vehicle Insurance') {
    const percentage = (pricingConfig.percentage || 3) / 100;
    return insuredObject.assessedValue * percentage;
  }

  if (typeName === 'Travel Insurance') {
    // Match rules, etc.
    const rule = pricingConfig.rules?.find((r: any) =>
      r.country === insuredObject.destinationCountry &&
      r.travelers === insuredObject.numTravelers &&
      r.days === insuredObject.numDays
    );
    return (rule?.pricePerPerson || 0) * insuredObject.numTravelers;
  }

  throw new Error('Unknown insurance type');
}

export { calculatePremium };