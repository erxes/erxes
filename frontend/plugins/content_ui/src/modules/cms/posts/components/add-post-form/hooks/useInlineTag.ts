import { useMutation } from '@apollo/client';
import { CMS_TAGS_ADD } from '../../../../tags/graphql/mutations';
import { createSlug } from '../../../../utils/createSlug';

interface InlineTagOption {
  value: string;
  label: string;
  existing?: boolean;
}

/** Normalizes tag labels for duplicate checks before inline tag creation. */
const normalizeTagLabel = (label: string) => label.toLowerCase().trim();

export const useInlineTag = (websiteId: string) => {
  const [addTagMutation] = useMutation(CMS_TAGS_ADD);

  const resolveTagIds = async (
    opts: InlineTagOption[],
    existingTags: InlineTagOption[],
  ): Promise<string[]> => {
    const existingTagsById = new Map(
      existingTags.map((tag) => [tag.value, tag]),
    );
    const existingTagsByLabel = new Map(
      existingTags.map((tag) => [normalizeTagLabel(tag.label), tag]),
    );
    const resultIds: string[] = [];

    for (const opt of opts) {
      const existingTag =
        existingTagsById.get(opt.value) ||
        existingTagsByLabel.get(normalizeTagLabel(opt.label));

      if (opt.existing || existingTag) {
        resultIds.push(existingTag?.value || opt.value);
      } else {
        try {
          const res = await addTagMutation({
            variables: {
              input: {
                name: opt.label,
                slug: createSlug(opt.label),
                clientPortalId: websiteId,
                colorCode: '',
              },
            },
            refetchQueries: ['CombinedCmsData'],
          });
          if (res.data?.cmsTagsAdd?._id) {
            resultIds.push(res.data.cmsTagsAdd._id);
          }
        } catch {
          // skip if creation fails
        }
      }
    }

    return resultIds;
  };

  return { resolveTagIds };
};
