import { IPipelineLabel } from '@/deals/types/pipelines';

const Labels = ({ labels }: { labels: IPipelineLabel[] }) => {
  return labels.map((label) => (
    <div
      key={label._id}
      className="px-2 py-1 rounded text-white text-sm font-medium"
      style={{ backgroundColor: label.colorCode }}
    >
      {label.name}
    </div>
  ));
};

export default Labels;
