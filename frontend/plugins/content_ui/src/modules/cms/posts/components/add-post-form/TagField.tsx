import { useLazyQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { useCallback, useMemo, useState } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { Form, MultipleSelector, type MultiSelectOption } from 'erxes-ui';
import { cmsLanguageAtom } from '~/modules/cms/shared/states/cmsLanguageState';
import { POST_CMS_TAGS } from '../../graphql/queries/postCmsTagsQuery';
import { useInlineTag } from './hooks/useInlineTag';

interface TagFieldProps {
  form: UseFormReturn<FieldValues>;
  tags: MultiSelectOption[];
  websiteId: string;
}

interface CmsTagSearchResult {
  _id: string;
  name?: string | null;
}

interface CmsTagsQueryData {
  cmsTags?: {
    tags?: CmsTagSearchResult[];
  };
}

interface CmsTagsQueryVariables {
  clientPortalId?: string;
  limit?: number;
  searchValue?: string;
  language?: string;
}

interface TagSelectOption extends MultiSelectOption {
  existing?: boolean;
}

const TAG_SEARCH_LIMIT = 100;

/** Normalizes typed tag search text before sending it to the CMS tag query. */
const normalizeSearchText = (value: string) => value.toLowerCase().trim();

/** Merges tag option lists while preserving a single option per tag ID. */
const mergeTagOptions = (
  currentOptions: TagSelectOption[],
  incomingOptions: TagSelectOption[],
) => {
  const optionsMap = new Map<string, TagSelectOption>();

  [...currentOptions, ...incomingOptions].forEach((option) => {
    if (!option.value) return;
    optionsMap.set(option.value, option);
  });

  return Array.from(optionsMap.values());
};

/** Reads selected tag IDs from the form field value. */
const getSelectedTagIds = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((tagId): tagId is string => typeof tagId === 'string')
    : [];

/** Converts CMS tag query results into MultipleSelector options. */
const mapTagOptions = (tags: CmsTagSearchResult[]): TagSelectOption[] =>
  tags
    .filter((tag) => tag._id && tag.name)
    .map((tag) => ({
      label: tag.name || '',
      value: tag._id,
      existing: true,
    }));

export const TagField = ({ form, tags, websiteId }: TagFieldProps) => {
  const language = useAtomValue(cmsLanguageAtom);
  const { resolveTagIds } = useInlineTag(websiteId);
  const [searchTags] = useLazyQuery<CmsTagsQueryData, CmsTagsQueryVariables>(
    POST_CMS_TAGS,
    {
      fetchPolicy: 'network-only',
    },
  );
  const [searchedOptions, setSearchedOptions] = useState<TagSelectOption[]>([]);

  const initialOptions = useMemo<TagSelectOption[]>(
    () =>
      tags.map((tag) => ({
        ...tag,
        existing: true,
      })),
    [tags],
  );

  const selectableOptions = useMemo(
    () => mergeTagOptions(initialOptions, searchedOptions),
    [initialOptions, searchedOptions],
  );

  const handleSearch = useCallback(
    async (searchValue: string) => {
      const normalizedSearchValue = normalizeSearchText(searchValue);
      const { data } = await searchTags({
        variables: {
          clientPortalId: websiteId,
          limit: TAG_SEARCH_LIMIT,
          searchValue: normalizedSearchValue || undefined,
          language,
        },
      });

      const remoteOptions = mapTagOptions(data?.cmsTags?.tags || []);

      setSearchedOptions((currentOptions) =>
        mergeTagOptions(currentOptions, remoteOptions),
      );

      return normalizedSearchValue
        ? remoteOptions
        : mergeTagOptions(initialOptions, remoteOptions);
    },
    [initialOptions, language, searchTags, websiteId],
  );

  return (
    <Form.Field
      control={form.control}
      name="tagIds"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Tag</Form.Label>
          <Form.Control>
            <MultipleSelector
              value={selectableOptions.filter((option) =>
                getSelectedTagIds(field.value).includes(option.value),
              )}
              defaultOptions={initialOptions}
              options={selectableOptions}
              placeholder="Select"
              hidePlaceholderWhenSelected={true}
              emptyIndicator="Empty"
              loadingIndicator={
                <span className="block px-2 py-4 text-sm text-muted-foreground">
                  Loading tags...
                </span>
              }
              creatable
              triggerSearchOnFocus
              onSearch={handleSearch}
              onChange={async (opts) => {
                const ids = await resolveTagIds(opts, selectableOptions);
                field.onChange(ids);
              }}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
