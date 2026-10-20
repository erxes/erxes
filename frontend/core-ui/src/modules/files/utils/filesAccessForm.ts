import { IFilesAccessGrant } from 'ui-modules';
import { z } from 'zod';
import { FILES_PRINCIPAL_TYPES, FILES_ROLES } from '../constants/filesAccess';

// Mirrors the server's grant validation.
export const filesAccessSchema = z.object({
  restricted: z.boolean(),
  access: z
    .array(
      z
        .object({
          type: z.enum(FILES_PRINCIPAL_TYPES),
          id: z.string().optional(),
          role: z.enum(FILES_ROLES),
        })
        .refine((grant) => grant.type === 'everyone' || !!grant.id, {
          path: ['id'],
          message: 'required',
        }),
    )
    .max(100),
});

export type TFilesAccessForm = z.infer<typeof filesAccessSchema>;

// Apollo adds __typename; the mutation input rejects it.
export const toFormGrant = ({ type, id, role }: IFilesAccessGrant) => ({
  type,
  id: id || undefined,
  role,
});

export const toGrantInput = ({
  type,
  role,
  id,
}: TFilesAccessForm['access'][number]) => ({
  type,
  role,
  ...(type === 'everyone' ? {} : { id }),
});

export const principalTypeOf = (value: string) =>
  FILES_PRINCIPAL_TYPES.find((type) => type === value);
