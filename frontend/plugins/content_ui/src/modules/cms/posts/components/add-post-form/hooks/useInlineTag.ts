import { useMutation } from '@apollo/client';
import { CMS_TAGS_ADD } from '../../../../tags/graphql/mutations';

const toSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const useInlineTag = (websiteId: string) => {
  const [addTagMutation] = useMutation(CMS_TAGS_ADD);

  const resolveTagIds = async (
    opts: any[],
    existingTags: any[],
  ): Promise<string[]> => {
    const existingIds = new Set(existingTags.map((t) => t.value));
    const resultIds: string[] = [];

    for (const opt of opts) {
      if (existingIds.has(opt.value)) {
        resultIds.push(opt.value);
      } else {
        try {
          const res = await addTagMutation({
            variables: {
              input: {
                name: opt.label,
                slug: toSlug(opt.label),
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
