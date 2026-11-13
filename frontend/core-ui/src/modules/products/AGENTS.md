# Products module (core-ui)

The `/settings/products` app: the product list, product detail and create in
the record side panel, packages and similarity groups in the same panel,
categories, UOMs, conditions and the other product settings pages. Backend
rules live in `backend/core-api/src/modules/products`; shared pieces
(`PRODUCT_FORM_SCHEMA`, `useAddProduct`, `ProductFilesUpload`,
`useProductFileLinks`) live in `frontend/libs/ui-modules/src/modules/products`.

## Layout

| Path                                                         | Responsibility                                                                                                            |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `product-detail/components/panel/ProductRecordPanel.tsx`     | A saved product in the side panel (also `/settings/products/:id`)                                                         |
| `product-detail/components/panel/ProductPanelNew.tsx`        | Create: a draft drawn with the same tabs, kept until Create                                                               |
| `product-detail/components/panel/ProductPanelFields.tsx`     | The Details cells; each saves on its own                                                                                  |
| `product-detail/hooks/useProductPanelSave.ts`                | Queued `productsEdit` saves built from the cached product                                                                 |
| `product-detail/utils/productFormValues.ts`                  | Product ⇄ form values ⇄ `productsEdit` variables                                                                          |
| `hooks/useProductConditionToggle.ts`                         | Adds or removes one condition (`productsSetConditionCodes`)                                                               |
| `product-detail/components/panel/ProductPanelCells.tsx`      | Panel cells shared with packages and similarities (vendor, currency, errors)                                              |
| `packages/components/panel/PackageRecordPanel.tsx`           | A package in the side panel (`core:productPackage`, also `/settings/products/packages/:id`)                               |
| `packages/components/panel/PackagePanelNew.tsx`              | Create a package: a draft with the same tabs, kept until Create                                                           |
| `packages/hooks/usePackagePanelSave.ts`                      | Queued `productPackagesEdit` saves of one changed field each                                                              |
| `bulk-similarity/components/panel/SimilarityRecordPanel.tsx` | A similarity group in the side panel (`core:productSimilarity`, also `/settings/products/similarities/:id`) and its draft |
| `bulk-similarity/components/panel/SimilarityPanelForm.tsx`   | The group's form as panel tabs, saved only on Save                                                                        |

## Rules

- `productsEdit` re-derives barcodes and the UOM from the whole product, so
  a panel save sends every field from the cache with the change on top, one
  save at a time. It never sends or selects `conditionCodes`: only the
  condition toggle changes conditions, and a field save in flight would
  otherwise write back codes it read before a toggle.
- `ProductsMain` is refetched only when a save touches a field the list shows
  (name, code, category, vendor, price); other changes reach it through the
  normalized `Product` in the response.
- The create draft passes `overviewTab="detail"` to `RecordSidePanel.Tabs`,
  so Details stays mounted and every opened tab stays mounted. Data Extension
  values live in `DataExtensionCreateFields` state and are cleared on unmount;
  Create is offered on every tab.
- A draft is validated as a whole with `PRODUCT_FORM_SCHEMA` on Create; each
  schema field shown in Details has a `FieldError` row under it.
- A unique product needs a duration and its type. Choosing `unique`, or a
  saved unique product missing either (e.g. imported), holds the values until
  both are set, then saves them with the type.
- Forms reset by Cancel re-key the description `Editor`: it re-reads
  `initialContent` only when that is non-empty.
- `productsEdit` sets every edited product `active`, so a deleted product is
  read-only in the panel until Restore, as is any product without
  `productsUpdate`: `ProductRecordPanel` wraps its editable tabs in a disabled
  `fieldset` with a notice and swaps `save` for a no-op.
- Create hides the panel's back and close buttons while busy, and stops
  before `productsAdd` if the panel unmounted while the draft settled or its
  files were linked.
- `productsAdd` sends `currency` and `files` along with the other draft
  values; a product's `subUoms` may be `null`.
- Legacy `?product_id=` links redirect to the side panel (`RecordDetailLink`).
- `productPackagesEdit` sets only the fields it is sent, so a package panel
  save sends just the change, one save at a time. A products change saves,
  then the price follows the server's `totalPrice` and the discount
  (`utils/packagePricing.ts`); a price or discount change sets the other.
- A similarity group is never saved per field: Save regenerates its
  products. Cells write to the form; after Save, or Discard, the form is
  re-keyed so it and its editors read the saved group.
- Packages and similarity groups are read-only in the panel without
  `productsUpdate`; Delete needs `productsDelete`. Deleting a package
  archives it; deleting a group keeps its products.
- Legacy `?activePackageId=` and `?similarityId=` links redirect to the
  side panel.

## Known limitations

- Plugin form widgets (`FormWidgetSideTabs`) are not shown in the product
  panel, because no plugin registers one for `core:product`. A plugin that
  adds one needs a tab for it in `ProductRecordPanel` and `ProductPanelNew`.
- A product's own Similarity tab still creates a group in a sheet
  (`ProductSimilarityCreateSheet` → `BulkProductSheetForm`), and the variant
  field and product chooser pickers open as sheets over the panel.
- Packages and similarity groups have no activity log.
