import {
  CardDetailBadges,
  formatFieldValue,
  hasFieldValue,
  useFields,
  useGetTags,
  type CardDetailBadgeItem,
  type IField,
} from 'ui-modules';

const MAX_VISIBLE_TAGS = 5;
const MAX_VISIBLE_PROPERTIES = 3;
const TAG_COLOR = '#FF6600';
const PROPERTY_COLOR = '#0EA5E9';

const getPropertyItems = (
  fields: IField[],
  propertiesData?: Record<string, unknown>,
): CardDetailBadgeItem[] =>
  fields
    .filter((field) => hasFieldValue(propertiesData?.[field._id]))
    .map((field) => ({
      _id: field._id,
      name: `${field.name}: ${formatFieldValue(
        field,
        propertiesData?.[field._id],
      )}`,
    }));

type TicketCardDetailsProps = {
  tagIds: string[];
  propertiesData?: Record<string, unknown>;
  onTagsOverflowClick: () => void;
  onPropertiesOverflowClick: () => void;
};

export const TicketCardDetails = ({
  tagIds,
  propertiesData,
  onTagsOverflowClick,
  onPropertiesOverflowClick,
}: TicketCardDetailsProps) => {
  const { fields } = useFields({ contentType: 'frontline:ticket' });
  const { tags } = useGetTags({ variables: { type: 'frontline:ticket' } });

  const selectedTags = tagIds
    .map((tagId) => tags?.find((tag) => tag._id === tagId))
    .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag));

  const propertyItems = getPropertyItems(fields || [], propertiesData);

  if (!selectedTags.length && !propertyItems.length) {
    return null;
  }

  return (
    <div className="mt-1 flex flex-col gap-1 p-3 pt-0">
      <CardDetailBadges
        items={selectedTags}
        color={TAG_COLOR}
        maxVisibleItems={MAX_VISIBLE_TAGS}
        onOverflowClick={onTagsOverflowClick}
      />
      <CardDetailBadges
        items={propertyItems}
        color={PROPERTY_COLOR}
        maxVisibleItems={MAX_VISIBLE_PROPERTIES}
        onOverflowClick={onPropertiesOverflowClick}
      />
    </div>
  );
};
