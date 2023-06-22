const mergeAndNoKeyField = { merge: true, keyFields: false };

export default function addMergeKeyfieldPolicy(typePolicies, noIdNestedTypes) {
  for (const noIdNestedType of noIdNestedTypes) {
    typePolicies[noIdNestedType] = mergeAndNoKeyField;
  }
}
