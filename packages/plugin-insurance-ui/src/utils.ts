export const filterFieldGroups = (fieldsGroups, categoryCode) => {
  const codes = ['vehicle', 'travel'];

  if (categoryCode) {
    // fieldsGroups = fieldsGroups.filter(
    //   (group) => group.code === codeMap[categoryCode] || group.parentId,
    // );

    const foundCode = codes.find((code) => categoryCode.includes(code));

    fieldsGroups = fieldsGroups.filter(
      (group) => group.code.includes(foundCode) || group.parentId || group.code.length === 0
    );
  }

  return fieldsGroups;
};

export const renderCompanyName = data => {
  if (data.primaryName || data.primaryPhone || data.primaryEmail) {
  
    return (
      (data.primaryName || '') +
      ' ' +
      (data.primaryEmail || '') +
      ' ' +
      (data.primaryPhone || '')
    );
  }

  if (data.primaryEmail || data.primaryPhone) {
    return data.primaryEmail || data.primaryPhone;
  }

  if (data.emails && data.emails.length > 0) {
    return data.emails[0] || 'Unknown';
  }

  return 'Unknown';
};