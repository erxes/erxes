import { ITag } from 'ui-modules';

const Tags = ({ tags }: { tags: ITag[] }) => {
  return tags.map((tag) => (
    <div
      key={tag._id}
      className="px-2 py-1 rounded text-white text-sm font-medium"
      style={{ backgroundColor: tag.colorCode }}
    >
      {tag.name}
    </div>
  ));
};

export default Tags;
