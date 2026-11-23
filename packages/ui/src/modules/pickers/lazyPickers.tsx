import { onDemand } from 'erxes-ui/components/on-demand';
import type { PickerFamily } from './pickerFamilyType';

/*
 * The record pickers load the first time a page shows one: erxes-ui is one chunk every route
 * loads, and only plugin pages use them. Each part draws nothing until its code is in.
 */

/** A picker family whose parts load from `load` on first use. */
export const lazyFamily = <P,>(load: () => Promise<PickerFamily<P>>): PickerFamily<P> => ({
  Content: onDemand(async () => (await load()).Content),
  Value: onDemand(async () => (await load()).Value),
  InlineCell: onDemand(async () => (await load()).InlineCell),
  FormItem: onDemand(async () => (await load()).FormItem),
  Field: onDemand(async () => (await load()).Field),
  FilterItem: onDemand(async () => (await load()).FilterItem),
  FilterView: onDemand(async () => (await load()).FilterView),
  FilterBar: onDemand(async () => (await load()).FilterBar),
});

const units = () => import('./SelectUnits');
const products = () => import('./SelectProducts');
const contacts = () => import('./SelectContacts');

/**
 * Picks core's branches in a table cell, a form field or a filter.
 * 3.x's `SelectBranches`, as a tree. Each part takes `units` (`unitQueries` from
 * `@erxes/core-contract/client`), `value` and `onValueChange`; `mode="multiple"` picks several.
 */
export const SelectBranches = lazyFamily(async () => (await units()).SelectBranches);

/**
 * Picks core's departments in a table cell, a form field or a filter.
 * 3.x's `SelectDepartments`, as a tree. Each part takes `units`, `value` and `onValueChange`.
 */
export const SelectDepartments = lazyFamily(async () => (await units()).SelectDepartments);

/**
 * Picks core products in a table cell, a form field or a filter.
 * 3.x's `SelectProduct`. Each part takes `products` (`productQueries` from
 * `@erxes/core-contract/client`), `value` and `onValueChange`; it searches as you type.
 */
export const SelectProduct = lazyFamily(async () => (await products()).SelectProduct);

/**
 * Picks core's product categories from a tree that folds.
 * 3.x's `SelectCategory`: each part takes `products` (`productQueries`), `value` and
 * `onValueChange`.
 */
export const SelectCategory = lazyFamily(async () => (await products()).SelectCategory);

/**
 * Picks core's customers in a table cell, a form field or a filter.
 * 3.x's `SelectCustomer`. Each part takes `contacts` (`contactSearchQueries` from
 * `@erxes/core-contract/client`), `value` and `onValueChange`.
 */
export const SelectCustomer = lazyFamily(async () => (await contacts()).SelectCustomer);

/**
 * Picks core's companies in a table cell, a form field or a filter.
 * 3.x's `SelectCompany`. Each part takes `contacts` (`contactSearchQueries`), `value` and
 * `onValueChange`.
 */
export const SelectCompany = lazyFamily(async () => (await contacts()).SelectCompany);

/**
 * Branches by id as their names, joined.
 * Past two, a count, with the names on hover.
 */
export const BranchesInline = onDemand(async () => (await units()).BranchesInline);

/**
 * Departments by id as their names, joined.
 * Past two, a count, with the names on hover.
 */
export const DepartmentsInline = onDemand(async () => (await units()).DepartmentsInline);

/**
 * A branch as a badge: its code and name.
 * It reads the branch by `branchId` unless `branch` is given.
 */
export const BranchBadge = onDemand(async () => (await units()).BranchBadge);

/**
 * A department as a badge: its code and name.
 * It reads the department by `departmentId` unless `department` is given.
 */
export const DepartmentBadge = onDemand(async () => (await units()).DepartmentBadge);

/** Products by id: the first one's code and name, "+N more" after it. */
export const ProductsInline = onDemand(async () => (await products()).ProductsInline);

/**
 * Customers by id: their avatars, and the name.
 * With several, it says how many.
 */
export const CustomersInline = onDemand(async () => (await contacts()).CustomersInline);

/**
 * Companies by id: their avatars, and the name.
 * With several, it says how many.
 */
export const CompaniesInline = onDemand(async () => (await contacts()).CompaniesInline);

/**
 * A sheet that picks many products at once, as 3.x's did.
 * The catalog with its stock (`remainders`) on the left, the picked ones on the right; Add
 * hands `onSelect` the ids. `children` is the button that opens it.
 */
export const SelectProductsBulk = onDemand(
  async () => (await import('./SelectProductsBulk')).SelectProductsBulk,
);
