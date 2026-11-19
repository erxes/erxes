/**
 * What old erxes stored in Mongo, for `import-mongo.ts`: the fields core
 * keeps, read leniently. A field of the wrong type reads as missing rather
 * than refusing the document; only an `_id` that is neither text nor an
 * ObjectId refuses it. Shapes follow erxes `main` (backend/core-api and
 * erxes-api-shared), which 3.x documents also fit.
 */
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const mongoId = z.union([
  z.string().min(1),
  z.instanceof(ObjectId).transform((value) => value.toHexString()),
]);

/** Text, or null when missing or blank; numbers in text fields become text. */
const text = z
  .unknown()
  .transform((value) =>
    typeof value === 'string' || typeof value === 'number' ? String(value).trim() || null : null,
  );

const texts = z
  .unknown()
  .transform((value) =>
    Array.isArray(value)
      ? value.flatMap((item) => (typeof item === 'string' && item.trim() ? [item.trim()] : []))
      : [],
  );

const ids = z
  .unknown()
  .transform((value) =>
    Array.isArray(value)
      ? value.flatMap((item) => {
          const parsed = mongoId.safeParse(item);

          return parsed.success ? [parsed.data] : [];
        })
      : [],
  );

const optionalId = z.unknown().transform((value) => {
  const parsed = mongoId.safeParse(value);

  return parsed.success ? parsed.data : null;
});

const when = z.unknown().transform((value) => {
  if (!(value instanceof Date || typeof value === 'string' || typeof value === 'number')) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
});

/** A calendar day, `YYYY-MM-DD`. */
const day = when.transform((date) => date?.toISOString().slice(0, 10) ?? null);

const flag = z.unknown().transform((value) => (typeof value === 'boolean' ? value : null));

const amount = z
  .unknown()
  .transform((value) => (typeof value === 'number' && Number.isFinite(value) ? value : null));

/** Named links (`{ facebook: 'https://…' }`), only those that are text. */
const links = z
  .unknown()
  .transform((value) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? Object.fromEntries(
          Object.entries(value).flatMap(([name, link]) =>
            typeof link === 'string' && link.trim() ? [[name, link.trim()]] : [],
          ),
        )
      : {},
  );

const stamps = { createdAt: when, updatedAt: when };

const contact = {
  primaryEmail: text,
  emails: texts,
  primaryPhone: text,
  phones: texts,
  avatar: text,
  code: text,
  description: text,
  ownerId: optionalId,
  tagIds: ids,
};

/** `users`: team members, with their profile under `details`. */
export const UserDocument = z.object({
  _id: mongoId,
  email: text,
  username: text,
  password: text,
  isOwner: flag,
  isActive: flag,
  role: text,
  registrationToken: text,
  employeeId: text,
  links,
  details: z.preprocess(
    (value) => (value && typeof value === 'object' ? value : {}),
    z.object({
      fullName: text,
      avatar: text,
      shortName: text,
      firstName: text,
      middleName: text,
      lastName: text,
      birthDate: day,
      workStartedDate: day,
      description: text,
      operatorPhone: text,
    }),
  ),
  branchIds: ids,
  departmentIds: ids,
  ...stamps,
});

/** `customers`: visitors, leads and customers. */
export const CustomerDocument = z.object({
  _id: mongoId,
  state: text,
  firstName: text,
  middleName: text,
  lastName: text,
  sex: amount,
  birthDate: day,
  position: text,
  department: text,
  ...contact,
  ...stamps,
});

/** `companies`. `industry` is a list in erxes main and text in 3.x. */
export const CompanyDocument = z.object({
  _id: mongoId,
  primaryName: text,
  names: texts,
  website: text,
  industry: z.unknown().transform((value) => texts.parse(value)[0] ?? text.parse(value)),
  size: amount,
  businessType: text,
  ...contact,
  ...stamps,
});

/** `tags`, of every record type; `type` is `core:customer`, `contacts:company`, `sales:deal` … */
export const TagDocument = z.object({
  _id: mongoId,
  name: text,
  type: text,
  colorCode: text,
  isGroup: flag,
  ...stamps,
});

/** `branches` and `departments`. */
export const UnitDocument = z.object({
  _id: mongoId,
  title: text,
  code: text,
  parentId: optionalId,
  supervisorId: optionalId,
  description: text,
  address: text,
  phoneNumber: text,
  email: text,
  createdBy: optionalId,
  ...stamps,
});

/** `conformities`: links between two records, either way round. */
export const ConformityDocument = z.object({
  mainType: text,
  mainTypeId: optionalId,
  relType: text,
  relTypeId: optionalId,
});

/** `product_categories`. */
export const CategoryDocument = z.object({
  _id: mongoId,
  name: text,
  parentId: optionalId,
  ...stamps,
});

/** `products`; `unitPrice` is in whole currency units. */
export const ProductDocument = z.object({
  _id: mongoId,
  name: text,
  code: text,
  categoryId: optionalId,
  type: text,
  barcodes: texts,
  description: text,
  unitPrice: amount,
  uom: text,
  currency: text,
  status: text,
  tagIds: ids,
  ...stamps,
});
