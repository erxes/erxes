// Every server file of the extension. A namespace here is the first part of
// a function's name: followUps.list, followUps.set.
export { indexes, schema, uses } from './schema';
export { permissions } from './permissions';
export * as followUps from './followUps';
