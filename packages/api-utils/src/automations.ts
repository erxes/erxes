export const replacePlaceHolders = async (
  {
    subdomain,
    actionData,
    target,
    isRelated = true,
    getRelatedValue
  }: {
    subdomain: string,
    actionData?: any,
    target: any,
    isRelated?: boolean,
    getRelatedValue: any,
  }
) => {
  if (actionData) {
    const targetKeys = Object.keys(target);
    const actionDataKeys = Object.keys(actionData);

    for (const actionDataKey of actionDataKeys) {
      for (const targetKey of targetKeys) {
        if (actionData[actionDataKey].includes(`{{ ${targetKey} }}`)) {
          const replaceValue = isRelated && await getRelatedValue(subdomain, target, targetKey) || target[targetKey];

          actionData[actionDataKey] = actionData[actionDataKey].replace(
            `{{ ${targetKey} }}`, replaceValue
          );
        }

        if (actionData[actionDataKey].includes(`{{ now }}`)) {
          actionData[actionDataKey] = actionData[actionDataKey].replace(`{{ now }}`, new Date())
        }
        if (actionData[actionDataKey].includes(`{{ tomorrow }}`)) {
          const today = new Date()
          const tomorrow = today.setDate(today.getDate() + 1)
          actionData[actionDataKey] = actionData[actionDataKey].replace(`{{ tomorrow }}`, tomorrow)
        }
        if (actionData[actionDataKey].includes(`{{ nextWeek }}`)) {
          const today = new Date()
          const nextWeek = today.setDate(today.getDate() + 7)
          actionData[actionDataKey] = actionData[actionDataKey].replace(`{{ nextWeek }}`, nextWeek)
        }
        if (actionData[actionDataKey].includes(`{{ nextMonth }}`)) {
          const today = new Date()
          const nextMonth = today.setDate(today.getDate() + 30)
          actionData[actionDataKey] = actionData[actionDataKey].replace(`{{ nextMonth }}`, nextMonth)
        }

        for (const complexFieldKey of ['customFieldsData', 'trackedData']) {
          if (actionData[actionDataKey].includes(complexFieldKey)) {
            const regex = new RegExp(`{{ ${complexFieldKey}.([\\w\\d]+) }}`);
            const match = regex.exec(actionData[actionDataKey]);
            const fieldId = (match && match.length === 2) ? match[1] : '';

            const complexFieldData = target[complexFieldKey].find(cfd => cfd.field === fieldId);

            if (complexFieldData) {
              actionData[actionDataKey] = actionData[actionDataKey].replace(
                `{{ ${complexFieldKey}.${fieldId} }}`, complexFieldData.value
              );
            }
          }
        }
      }

      actionData[actionDataKey] = actionData[actionDataKey].replace(/\[\[ /g, '').replace(/ \]\]/g, '')
    }
  }

  return actionData;
}