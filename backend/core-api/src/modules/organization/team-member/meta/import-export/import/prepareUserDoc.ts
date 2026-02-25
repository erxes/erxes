import { IModels } from '~/connectionResolvers';

const toArray = (val: any) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    return val
      .split(/[;,]/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
};

const mapNamesToIdsStrict = async (
  model: any,
  field: 'name' | 'title',
  names: string[],
  labelForError: string,
) => {
  if (!names.length) return { ids: [], missing: [] as string[] };
  if (!model?.find) return { ids: [], missing: names };

  const docs = await model
    .find({ [field]: { $in: names } })
    .select('_id ' + field)
    .lean();

  const map = new Map<string, string>();
  docs.forEach((d: any) => map.set(String(d[field]), String(d._id)));

  const ids: string[] = [];
  const missing: string[] = [];
  for (const n of names) {
    const id = map.get(n);
    if (id) ids.push(id);
    else missing.push(n);
  }

  return { ids, missing };
};

const parseBool = (v: any) => {
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v ?? '').toLowerCase().trim();
  return ['true', '1', 'yes', 'y'].includes(s);
};

export async function prepareUserDoc(models: IModels, row: any) {
  const doc: any = {};

  if (row.username) doc.username = String(row.username).trim();
  if (row.email) doc.email = String(row.email).toLowerCase().trim();
  if (row.employeeId) doc.employeeId = String(row.employeeId).trim();

  if (row.isActive !== undefined && row.isActive !== null && row.isActive !== '') {
    doc.isActive = parseBool(row.isActive);
  }

  // details
  const details: any = {};
  const setDetail = (k: string, value: any) => {
    if (value === undefined || value === null || value === '') return;
    details[k] = value;
  };

  setDetail('firstName', row.firstName);
  setDetail('middleName', row.middleName);
  setDetail('lastName', row.lastName);
  setDetail('shortName', row.shortName);
  setDetail('fullName', row.fullName);
  setDetail('location', row.location);
  setDetail('description', row.description);
  setDetail('operatorPhone', row.operatorPhone);

  for (const k of ['birthDate', 'workStartedDate'] as const) {
    const raw = row[k];
    if (!raw) continue;
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) details[k] = d;
  }

  if (Object.keys(details).length) doc.details = details;

  // relations (names -> ids)
  const errors: string[] = [];

  const brandNames = toArray(row.brands || row.Brands);
  if (brandNames.length) {
    const { ids, missing } = await mapNamesToIdsStrict(models.Brands, 'name', brandNames, 'Brands');
    if (missing.length) errors.push(`Brands not found: ${missing.join(', ')}`);
    else doc.brandIds = ids;
  }

  const departmentNames = toArray(row.departments || row.Departments);
  if (departmentNames.length) {
    const { ids, missing } = await mapNamesToIdsStrict(models.Departments, 'title', departmentNames, 'Departments');
    if (missing.length) errors.push(`Departments not found: ${missing.join(', ')}`);
    else doc.departmentIds = ids;
  }

  const branchNames = toArray(row.branches || row.Branches);
  if (branchNames.length) {
    const { ids, missing } = await mapNamesToIdsStrict(models.Branches, 'title', branchNames, 'Branches');
    if (missing.length) errors.push(`Branches not found: ${missing.join(', ')}`);
    else doc.branchIds = ids;
  }

  if (errors.length) throw new Error(errors.join(' | '));

  return doc;
}
