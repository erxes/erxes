import { ITag } from 'ui-modules';
import { TagsListDescriptionField } from './columns/TagsListDescriptionField';
import { TagsListNameField } from './columns/TagsListNameField';
import { TagsListCell } from './TagsListCell';
import { TagsListCreatedAtField } from './columns/TagsListCreatedAtField';
import { TagsListColorField } from './columns/TagsListColorField';
import { Collapsible, cn } from 'erxes-ui';

export const TagsListRow = ({ tag }: { tag: ITag }) => {
  if (tag.isGroup) {
    return <TagsListGroupRow tag={tag} />;
  }
  return <TagsListRowContent tag={tag} />;
};

export const TagsListGroupRow = ({ tag }: { tag: ITag }) => {
  return (
    <Collapsible className="first:rounded-t-lg last:rounded-b-lg">
      <Collapsible.Trigger className="w-full text-start">
        <TagsListRowContent tag={tag} />
      </Collapsible.Trigger>
      <Collapsible.Content>
        <TagsListRowContent tag={tag} />
      </Collapsible.Content>
    </Collapsible>
  );
};

export const TagsListRowContent = ({ tag }: { tag: ITag }) => {
  return (
    <div
      className={cn(
        'h-10 w-full shadow-xs flex items-center px-12 group hover:bg-foreground/10 bg-background relative ',
        tag.parentId &&
          'pl-18 last:[--svg-height:calc(2.5rem/2-10px)] [--svg-height:calc(2.5rem)] [&>div>svg]:block',
      )}
    >
      <div className="absolute w-px bg-border h-(--svg-height) top-0 left-[calc(3rem+24px/2)]">
        <svg
          className="absolute top-[calc(2.5rem/2-10px)] text-border hidden"
          width="14"
          height="8"
          viewBox="0 0 14 8"
          fill="currentColor"
          role="img"
          focusable="false"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 0h1v1c0 2.5 2.212 3.546 2.212 3.546L9.737 8.06c.568.306.094 1.186-.474.88l-6.48-3.488S0 4 0 1V0Z"></path>
        </svg>
      </div>
      <TagsListCell className="w-full md:max-w-[30%] gap-2">
        <TagsListColorField
          colorCode={tag.colorCode || ''}
          isGroup={tag.isGroup || false}
          id={tag._id}
        />
        <TagsListNameField name={tag.name} id={tag._id} />
      </TagsListCell>
      <TagsListDescriptionField
        description={tag.description || ''}
        id={tag._id}
      />
      <TagsListCreatedAtField createdAt={tag.createdAt || ''} />
    </div>
  );
};
