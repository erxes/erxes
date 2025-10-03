export function removeTypename(obj: Record<string, any>): Record<string, any> {
    const { __typename, ...rest } = obj;
    return rest;
  }
  