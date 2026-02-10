import { IModels } from '~/connectionResolvers';
import { prepareUserDoc } from './prepareUserDoc';

export async function processUserRows(
  models: IModels,
  rows: any[],
): Promise<{ successRows: any[]; errorRows: any[] }> {
  const successRows: any[] = [];
  const errorRows: any[] = [];

  // Prefetch existing matches
  const emails = rows.map((r) => r.email).filter(Boolean).map((x) => String(x).toLowerCase().trim());
  const usernames = rows.map((r) => r.username).filter(Boolean).map((x) => String(x).trim());
  const employeeIds = rows.map((r) => r.employeeId).filter(Boolean).map((x) => String(x).trim());

  const orFilters = [
      ...(emails.length ? [{ email: { $in: emails } }] : []),
      ...(usernames.length ? [{ username: { $in: usernames } }] : []),
      ...(employeeIds.length ? [{ employeeId: { $in: employeeIds } }] : []),
      ];
    
  const existingDocs = orFilters.length
    ? await models.Users
    .find({ $or: orFilters })
    .select('_id email username employeeId')
    .lean()
    : [];

  const byEmail = new Map<string, any>();
  const byUsername = new Map<string, any>();
  const byEmployeeId = new Map<string, any>();

  for (const doc of existingDocs) {
    if (doc.email) byEmail.set(String(doc.email).toLowerCase(), doc);
    if (doc.username) byUsername.set(String(doc.username), doc);
    if (doc.employeeId) byEmployeeId.set(String(doc.employeeId), doc);
  }

  // Also detect duplicates INSIDE CSV itself
  const seenEmail = new Set<string>();
  const seenUsername = new Set<string>();
  const seenEmployeeId = new Set<string>();

  for (const row of rows) {
    try {
      const doc = await prepareUserDoc(models, row);

      const emailKey = doc.email ? String(doc.email).toLowerCase() : '';
      const userKey = doc.username ? String(doc.username) : '';
      const empKey = doc.employeeId ? String(doc.employeeId) : '';

      // required fields (at least email or username)
      if (!emailKey && !userKey) {
        errorRows.push({ ...row, error: 'Missing username/email' });
        continue;
      }

      // CSV internal dup check
      if (emailKey && seenEmail.has(emailKey)) {
        errorRows.push({ ...row, error: `Duplicated in file: email ${emailKey}` });
        continue;
      }
      if (userKey && seenUsername.has(userKey)) {
        errorRows.push({ ...row, error: `Duplicated in file: username ${userKey}` });
        continue;
      }
      if (empKey && seenEmployeeId.has(empKey)) {
        errorRows.push({ ...row, error: `Duplicated in file: employeeId ${empKey}` });
        continue;
      }
      if (emailKey) seenEmail.add(emailKey);
      if (userKey) seenUsername.add(userKey);
      if (empKey) seenEmployeeId.add(empKey);

      // DB dup check (DO NOT UPDATE — report error)
      const existing =
        (emailKey && byEmail.get(emailKey)) ||
        (userKey && byUsername.get(userKey)) ||
        (empKey && byEmployeeId.get(empKey));

      if (existing) {
        errorRows.push({
          ...row,
          error: `Duplicated: already exists (_id=${existing._id})`,
        });
        continue;
      }

      const created = await models.Users.createUser({
        username: doc.username,
        email: doc.email,
        password: '',             
        notUsePassword: true,      
        details: doc.details,
        links: doc.links || [],
        groupIds: doc.groupIds,
        isActive: doc.isActive ?? true,
      } as any);

      // Update additional fields that createUser may not cover
      const extraSet: any = {};
      if (doc.employeeId) extraSet.employeeId = doc.employeeId;
      if (doc.brandIds) extraSet.brandIds = doc.brandIds;
      if (doc.departmentIds) extraSet.departmentIds = doc.departmentIds;
      if (doc.branchIds) extraSet.branchIds = doc.branchIds;
      if (doc.positionIds) extraSet.positionIds = doc.positionIds;

      try {
          if (Object.keys(extraSet).length)
            await models.Users.updateOne({ _id: created._id }, { $set: extraSet });
        } catch (err) {
          await models.Users.deleteOne({ _id: created._id });
          throw err;
        }
        

      successRows.push({ ...row, _id: created._id });
    } catch (e: any) {
      errorRows.push({ ...row, error: e?.message || 'Failed to import row' });
    }
  }

  return { successRows, errorRows };
}
