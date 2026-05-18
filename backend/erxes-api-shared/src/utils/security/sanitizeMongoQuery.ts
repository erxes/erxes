type MongoEqExpr<T> = { $eq: T };

/**
 * Wrap a value for safe use in a Mongoose query field where the value
 * originates from untrusted input (HTTP body, webhook payload, query params).
 *
 * Mongoose treats `{ field: value }` as an equality match when `value` is a
 * primitive, but if an attacker can supply a query-operator subdocument like
 * `{ $ne: null }` or `{ $gt: '' }`, the same shape becomes a NoSQL query
 * predicate. Wrapping as `{ field: { $eq: value } }` forces Mongoose to treat
 * the entire payload as the literal value to match, neutralizing the
 * operator-injection class flagged by CodeQL `js/sql-injection`.
 */
export const safeEq = <T>(value: T): MongoEqExpr<T> => ({ $eq: value });
