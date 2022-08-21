// schema/utils.js
export const convertStringPropToFunction = (propNames, dimensionDefinition) => {
  const newResult = { ...dimensionDefinition };

  propNames.forEach(propName => {
    const propValue = newResult[propName];

    if (!propValue) {
      return;
    }

    newResult[propName] = () => propValue;
  });

  return newResult;
};

export const transformDimensions = dimensions => {
  return Object.keys(dimensions).reduce((result, dimensionName) => {
    const dimensionDefinition = dimensions[dimensionName];
    return {
      ...result,
      [dimensionName]: convertStringPropToFunction(['sql'], dimensionDefinition)
    };
  }, {});
};

export const transformMeasures = measures => {
  return Object.keys(measures).reduce((result, dimensionName) => {
    const dimensionDefinition = measures[dimensionName];
    return {
      ...result,
      [dimensionName]: convertStringPropToFunction(
        ['sql', 'drillMembers'],
        dimensionDefinition
      )
    };
  }, {});
};
