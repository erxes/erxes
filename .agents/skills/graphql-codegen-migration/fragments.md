# Rewriting interpolated documents

Codegen reads each `gql` string as written. Text spliced in with `${...}` never reaches it, so the document fails to parse or its fields drop out of the generated types while still being sent at runtime. Every document becomes one static string.

## Shared field list → fragment

Before:

```ts
const TAG_FIELDS = `_id name colorCode`;
export const GET_TAGS = gql`query tagsMain { tags { ${TAG_FIELDS} } }`;
```

After, define the fragment with `gql()` and spread it by name:

```ts
import { gql } from '~/gql';

export const TAG_FIELDS = gql(`
  fragment TagFields on Tag {
    _id
    name
    colorCode
  }
`);

export const GET_TAGS = gql(`
  query tagsMain {
    tags {
      ...TagFields
    }
  }
`);
```

Codegen resolves fragments by name across the whole plugin, and the generated document carries the fragment definition, so the spread works at runtime without an import. Fragment names are unique within the plugin. `readFragment` and `writeFragment` take the fragment document directly, as `operation_ui/src/modules/task/hooks/useUpdateTask.tsx` does.

## Fragment used once → inline fields

When only one document uses the shared string, paste the fields into that document and delete the constant.

## Interpolated arguments or operation shape

`${isDetail ? 'details { ... }' : ''}`, or argument lists built from a constant, become separate static documents, one per shape. Alternatively, use one document with `@include(if: $isDetail)`.

## Field lists from another package

An interpolated string imported from `ui-modules` or `erxes-ui` is that package's document. Inline the fields in this plugin's document, and leave the shared package alone.
