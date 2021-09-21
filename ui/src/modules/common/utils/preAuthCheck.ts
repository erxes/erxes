export const preAuthCheck = async (preAuth: any) => {
  let data = {};
  await preAuth.then(result => {
    data = Object.assign({}, result);
  });
  return data;
};
