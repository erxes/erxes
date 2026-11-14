import { ERRORS, type ErrorCode } from '@erxes/core-contract';
import { ORPCError, type ValidationError } from '@orpc/server';
import type { NextFunction, Request, Response } from 'express';
import { DatabaseError } from 'pg';
import type { z } from 'zod';

type DataOf<C extends ErrorCode> = (typeof ERRORS)[C] extends { data: infer S extends z.ZodType }
  ? z.input<S>
  : undefined;

/**
 * An error the API answers with: one of the contract's codes (`ERRORS` in
 * `@erxes/core-contract`), with the status and the `data` it declares. The
 * only place an `ORPCError` is made. A procedure that declares the code
 * answers with it as a defined error, typed for the client.
 */
export const fail = <C extends ErrorCode>(
  code: C,
  message: string,
  ...[data]: undefined extends DataOf<C> ? [data?: DataOf<C>] : [data: DataOf<C>]
) => new ORPCError(code, { status: ERRORS[code].status, message, data, defined: true });

export const notFound = (what: string) => fail('NOT_FOUND', `${what} not found`);

/** Input the contract refuses (oRPC's `ValidationError`, or a `ZodError`): its issues, path by path. */
export const invalidInput = ({ issues }: Pick<ValidationError, 'issues'>) =>
  fail('INVALID_INPUT', 'The request is not valid', {
    issues: issues.map((issue) => ({
      path: (issue.path ?? []).flatMap((segment) => {
        const key = typeof segment === 'object' ? segment.key : segment;

        return typeof key === 'symbol' ? [] : [key];
      }),
      message: issue.message,
    })),
  });

/** The pg error behind a Drizzle error (DrizzleQueryError wraps it in `cause`). */
const databaseError = (error: unknown, depth = 0): DatabaseError | undefined => {
  if (error instanceof DatabaseError) return error;

  return error instanceof Error && depth < 4 ? databaseError(error.cause, depth + 1) : undefined;
};

/** The SQLSTATE of the pg error behind `error`, e.g. 23505 for a unique violation. */
export const pgCode = (error: unknown) => databaseError(error)?.code;

/**
 * The unique indexes and foreign keys input can run into, by constraint name:
 * the input field and what to tell the caller. A unique violation answers
 * `TAKEN`, a foreign key violation `INVALID_REFERENCE`.
 */
const CONSTRAINTS: Record<string, { field: string; message: string }> = {
  core_customers_org_primary_email_key: {
    field: 'primaryEmail',
    message: 'A customer with this email already exists',
  },
  core_customers_org_primary_phone_key: {
    field: 'primaryPhone',
    message: 'A customer with this phone already exists',
  },
  core_customer_logins_org_kind_value_key: {
    field: 'value',
    message: 'Another customer signs in with this',
  },
  core_companies_org_primary_name_key: {
    field: 'primaryName',
    message: 'A company with this name already exists',
  },
  core_tags_org_type_name_key: { field: 'name', message: 'A tag with this name already exists' },
  core_lead_stages_org_name_key: {
    field: 'name',
    message: 'A stage with this name already exists',
  },
  core_field_groups_org_type_code_key: {
    field: 'code',
    message: 'A group with this code already exists',
  },
  core_fields_org_type_code_key: {
    field: 'code',
    message: 'A field with this code already exists',
  },
  core_fields_org_type_label_key: {
    field: 'label',
    message: 'A field with this label already exists',
  },
  core_product_categories_org_parent_name_key: {
    field: 'name',
    message: 'A category with this name is already there',
  },
  core_products_org_code_key: { field: 'code', message: 'Another product has this code' },
  core_products_org_barcode_key: { field: 'barcode', message: 'Another product has this barcode' },
  core_users_org_email_key: {
    field: 'email',
    message: 'A team member with this email already exists',
  },
  core_organizations_subdomain_key: {
    field: 'subdomain',
    message: 'Another workspace has this subdomain',
  },
  core_customers_owner_id_fkey: { field: 'ownerId', message: 'The owner is not a team member' },
  core_companies_owner_id_fkey: { field: 'ownerId', message: 'The owner is not a team member' },
  core_customers_lead_stage_id_fkey: { field: 'leadStageId', message: 'No such lead stage' },
  core_companies_lead_stage_id_fkey: { field: 'leadStageId', message: 'No such lead stage' },
  core_fields_group_id_fkey: { field: 'groupId', message: 'No such field group' },
  core_products_category_fkey: { field: 'categoryId', message: 'No such category' },
  core_product_categories_parent_fkey: { field: 'parentId', message: 'No such category' },
  core_users_role_fkey: { field: 'role', message: 'No such role' },
};

/**
 * A unique or foreign key violation the caller caused, as the error it
 * means; anything else as it is. Every procedure's errors pass through it
 * (`unscoped` in `~/orpc`).
 */
export const fromDatabase = (error: unknown) => {
  const pg = databaseError(error);
  const known = pg?.constraint ? CONSTRAINTS[pg.constraint] : undefined;

  if (!known) return error;

  if (pg?.code === '23505') return fail('TAKEN', known.message, { field: known.field });

  if (pg?.code === '23503') return fail('INVALID_REFERENCE', known.message, { field: known.field });

  return error;
};

/**
 * Express's error handler, for what fails outside oRPC (Express routes, auth,
 * body parsing): the same body oRPC sends, or a logged 500.
 */
export const answerError = (error: unknown, req: Request, res: Response, _next: NextFunction) => {
  const known =
    error instanceof SyntaxError && 'body' in error
      ? fail('INVALID_JSON', 'The request body is not valid JSON')
      : fromDatabase(error);

  if (known instanceof ORPCError) {
    res.status(known.status).json(known.toJSON());

    return;
  }

  req.log.error({ err: error }, 'unhandled error');
  res.status(500).json({
    defined: false,
    code: 'INTERNAL_SERVER_ERROR',
    status: 500,
    message: 'Something went wrong',
  });
};
