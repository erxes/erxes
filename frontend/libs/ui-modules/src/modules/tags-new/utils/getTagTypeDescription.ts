import _ from "lodash";
export const getTagTypeDescription = ({type, tagTypes}: {type: string | null, tagTypes: Record<string, {description: string; contentType: string}[]>}) => {
  let result = "";
  const tagTypesEntries = Object.entries(tagTypes);
  if (!type) {
    return "Workspace";
  }
if (!type?.startsWith("core")) {
  result += type.split(":")[0] + " ";
}
result += type.split(":")[1];
return _.startCase(result);
}