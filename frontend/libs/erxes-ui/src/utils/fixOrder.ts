export const fixOrder = ({
  order,
  name,
}: {
  order?: string;
  name?: string;
}) => {
  let fixedOrder = order;
  if (name?.includes('/')) {
    fixedOrder = fixedOrder?.replace(name, name.replace(/\//g, ''));
  }
  if (fixedOrder?.endsWith('/')) {
    fixedOrder = fixedOrder?.slice(0, -1);
  }
  return fixedOrder;
};
