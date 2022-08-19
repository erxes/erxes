/**
 * Mongoose field options wrapper
 * @param {Object} options Mongoose schema options
 */
 export const field = options => {
  const { type, optional } = options;

  if (type === String && !optional) {
    options.validate = /\S+/;
  }

  return options;
};
