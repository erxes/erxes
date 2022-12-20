export const postUsername = ({ post, typeKey, crmKey, cpKey }) => {
  if (post[typeKey] === 'CRM')
    return (
      (post[crmKey]?.username || post[crmKey]?.email || post[crmKey]?._id) +
      ' (Erxes)'
    );
  if (post[typeKey] === 'CP')
    return (
      (post[cpKey]?.username || post[cpKey]?.email || post[cpKey]?._id) +
      ' (Client Portal)'
    );
};
