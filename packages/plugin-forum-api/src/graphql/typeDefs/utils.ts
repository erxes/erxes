export const requiredIf = (x: boolean): string => (x ? '!' : '');

export const createPagedListType = (originalTypeName: string) => `
type ${originalTypeName}ListPaged {
    items: [${originalTypeName}]
    total: Int
    limit: Int
    offset: Int
}
`;
