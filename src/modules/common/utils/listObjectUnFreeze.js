const listObjectUnFreeze = source => {
  const target = [];

  source.forEach(element => {
    const targetElement = {};

    for (const property in element) {
      if (element.hasOwnProperty(property)) {
        targetElement[property] = element[property];
      }
    }

    target.push(targetElement);
  });

  return target;
};

export default listObjectUnFreeze;
