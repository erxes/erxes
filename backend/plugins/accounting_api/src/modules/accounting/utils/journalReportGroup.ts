export const groupRecords = async (records, groupRule) => {
  if (!groupRule) {
    return { 'items': records }
  }

  const resultDic = {};

  await toGroup(resultDic, records, groupRule);
  return resultDic;
}

type AnyDict = { [key: string]: any };

interface GroupRule {
  key: string;        // prefix key
  code: string;       // code field
  name?: string;      // name field
  group: string;      // grouping key
  group_rule?: GroupRule | null; // sub group rule
}

function toGroup(
  resultDic: AnyDict,
  groupRuleItems: AnyDict[],
  groupRule: GroupRule
) {
  // iterate over rows to group
  for (const item of groupRuleItems) {
    const groupKey = item[groupRule.group];

    // If group does not exist in resultDic, initialize it
    if (!resultDic[groupKey]) {
      resultDic[groupKey] = {
        items: [],
        [`${groupRule.key}_id`]: String(groupKey),                     // id
        [`${groupRule.key}_code`]: String(item[groupRule.code]),       // code
        [`${groupRule.key}_name`]: groupRule.name
          ? String(item[groupRule.name])
          : "",                                                       // name
      };

      // if sub-group rule exists -> initialize empty dict
      if (groupRule.group_rule?.key) {
        resultDic[groupKey][groupRule.group_rule.key] = {};
      }
    }

    // get existing items under this group
    const dicItems = resultDic[groupKey]["items"] || [];

    // add current record
    dicItems.push(item);

    // reassign
    resultDic[groupKey]["items"] = dicItems;
  }

  sortGroupByCode(resultDic, `${groupRule.key}_code`);

  // if sub-group rule exists, recursively call
  if (groupRule.group_rule?.key) {
    for (const key of Object.keys(resultDic)) {
      toGroup(
        resultDic[key][groupRule.group_rule.key],
        resultDic[key]["items"],
        groupRule.group_rule
      );
      resultDic[key]["items"] = undefined
    }
  }
}

function sortGroupByCode(resultDic: AnyDict, sortKey: string) {
  const sortedEntries = Object.entries(resultDic).sort((a: any, b: any) => {
    const aCode = a[1]?.[sortKey] ?? "";
    const bCode = b[1]?.[sortKey] ?? "";
    return String(aCode).localeCompare(String(bCode), "mn");
  });

  // object-г дахин build хийнэ (JS object өөрөө сортлогддоггүй)
  Object.keys(resultDic).forEach(k => delete resultDic[k]);

  for (const [k, v] of sortedEntries) {
    resultDic[k] = v;
  }
}