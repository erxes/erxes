import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { DATA_MODEL_DETAIL } from '../graphql';
import { modelPath, type DataModel } from '../types';

export const DataModelTargetLink = ({ modelId }: { modelId: string }) => {
  const { data, loading, error } = useQuery<{ dataModelDetail: DataModel }>(
    DATA_MODEL_DETAIL,
    { variables: { _id: modelId } },
  );
  if (!data?.dataModelDetail)
    return (
      <span className="text-xs text-muted-foreground">
        {loading ? 'Loading…' : error ? 'Object unavailable' : 'Related object'}
      </span>
    );
  return (
    <Link
      className="text-xs text-muted-foreground hover:text-primary hover:underline"
      to={modelPath(modelId)}
    >
      {data.dataModelDetail.labelPlural}
    </Link>
  );
};
