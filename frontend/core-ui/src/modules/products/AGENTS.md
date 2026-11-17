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
| `product-detail/utils/similarityDraft.ts`                    | A new group's draft values taken from the product it is made from                                                         |
| `components/ProductEditorPanel.tsx`                          | Settings editors (categories, UOMs, rules, conditions) beside their list in the core panel host                           |

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
  both are set, then saves them with the type. A type chosen while a type
  save is in flight is compared with that save's type, not the cached one.
- Forms reset by Cancel re-key the description `Editor`: it re-reads
  `initialContent` only when that is non-empty.
- `productsEdit` sets every edited product `active`, so a deleted product is
  read-only in the panel until Restore, as is any product without
  `productsUpdate`: `ProductRecordPanel` wraps every editable tab (Details,
  Description, Media, Barcodes, Properties, Similarity) in a disabled
  `PanelReadOnlyTab` with a notice and swaps `save` for a no-op. Properties
  also swap their mutate hook for `useReadOnlyFieldEdit`, since a disabled
  `fieldset` does not stop rich-text fields; Similarity hides Add field,
  Save and Create.
- `PanelReadOnlyTab` always draws its `fieldset`, so neither read-only nor
  `disabled` remounts a tab. Drafts pass `disabled` while Create sends
  (products: once the draft is read, not while it settles), and a
  similarity group's form while it saves: a change then would be lost.
- A disabled `fieldset` does not stop content-editable text, so each such
  cell is locked itself: rich-text `Editor`s get `readonly`,
  `GeneratedProductsTable` gets `disabled` for its name and code cells, and
  the Properties content of a read-only product, or of a draft while Create
  sends, is `inert`. Pass it as `{ inert: '' }`: React 18 drops
  `inert={true}` without writing the attribute.
- Create hides the panel's back and close buttons while busy, and stops
  before `productsAdd` if the panel unmounted while the draft settled or its
  files were linked.
- `productsAdd` sends `currency` and `files` along with the other draft
  values; a product's `subUoms` may be `null`.
- Legacy `?product_id=` links redirect to the side panel (`RecordDetailLink`).
- `productPackagesEdit` sets only the fields it is sent (status included),
  so a package panel save sends just the change, one save at a time. A
  products change and the price that follows the server's `totalPrice` at
  the discount are one queued step (`saveProducts`), so a price or discount
  edit made meanwhile lands after both; a total of 0 prices it at 0. A price
  or discount change sets the other (`utils/packagePricing.ts`); a price of
  0 is a 100% discount. The list's status cell uses
  `productPackagesChangeStatus` with `_ids`.
- A similarity group's tabs are Details, Media and Products; Products holds
  the variant fields above the rows they generate. A package's tabs are
  Details (fields, pricing and cover image) and Products. A draft's total is priced in
  `PackagePanelNew` (`usePackageProductsTotal`), so Details shows it before
  the Products tab is opened.
- A package's products are added through the shared `SelectProduct` search
  and listed alone with quantity and line total (`PackageProductPicker`).
  Their names and unit prices come from `productPackageChosenProducts`,
  which reads `products(ids:)`: it returns every id, where `productsMain`
  refuses a page over 100. A failed load shows Retry in place of the lines,
  and a draft keeps its total and price until the products load.
- A similarity group is never saved per field: Save regenerates its
  products. Cells write to the form; after Save, or Discard, the form is
  re-keyed so it and its editors read the saved group.
- Packages and similarity groups are read-only in the panel without
  `productsUpdate`; Delete needs `productsDelete`. Deleting a package
  archives it; deleting a group keeps its products.
- Legacy `?activePackageId=` and `?similarityId=` links redirect to the
  side panel.
- A product's Similarity tab starts a new group as a draft stacked on the
  product: `openNewRecord` with `TSimilarityDraftDefaults`, read back by
  `SimilarityPanelNew`; Back returns to the product. A group's create, edit
  and delete change its products too, so each refetches
  `SIMILARITY_CHANGE_REFETCH_QUERIES` (groups, their count,
  `PRODUCT_DETAIL_QUERY`, `ProductsMain`). The product tab's inline Save is
  held, as the panel's is, while the generated rows have duplicate codes.
- Creating a variant field without an option returns to the field list: it
  is no variant axis until it has options.
- Nothing inside a product panel opens a sheet or dialog. Adding a variant
  field replaces the field list (`VariantFieldAddView`); linking a product
  to a generated row is a dropdown (`ProductChooser`); a bundle rule row
  replaces the rule's form in its panel, which stays mounted underneath;
  category conditions open in `ProductEditorPanel`.

## Known limitations

- Plugin form widgets (`FormWidgetSideTabs`) are not shown in the product
  panel, because no plugin registers one for `core:product`. A plugin that
  adds one needs a tab for it in `ProductRecordPanel` and `ProductPanelNew`.
- Merging products (`ProductMerge`) opens a sheet over the list, like
  merging contacts.
- Packages and similarity groups have no activity log.
