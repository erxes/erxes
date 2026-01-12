import { Card, Resizable, Sheet } from 'erxes-ui';
import ReactJson from 'react-json-view';
import { ILogDoc } from '../types';
import { maskFields } from '../utils/logFormUtils';

export const MongoLogDetailContent = ({ payload, action }: ILogDoc) => {
  const { collectionName, fullDocument } = payload || {};

  const ContentComponent =
    action === 'update' ? (
      <MongoUpdateLogDetailContent payload={payload} action={action} />
    ) : (
      <ReactJson
        src={maskFields(fullDocument, ['password'])}
        collapsed={1}
        name={false}
      />
    );

  return (
    <div className="flex-1 flex flex-col gap-2 p-4 overflow-auto">
      <Card.Title>{(collectionName || '').toUpperCase()}</Card.Title>
      {ContentComponent}
    </div>
  );
};

const MongoUpdateLogDetailContent = ({
  payload,
}: {
  action: string;
  payload: any;
}) => {
  const { collectionName, fullDocument, prevDocument, updateDescription } =
    payload;

  return (
    <div className="flex-1 flex flex-col gap-2 p-4 overflow-auto">
      <Card.Title>{(collectionName || '').toUpperCase()}</Card.Title>
      <div className="h-full overflow-auto p-4">
        <Card.Description className="mb-2">Diff</Card.Description>
        <ReactJson src={updateDescription} collapsed={1} name={false} />
      </div>
    </div>
  );
};
