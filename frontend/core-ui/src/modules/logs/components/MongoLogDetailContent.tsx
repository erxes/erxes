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
      <Resizable.PanelGroup direction="vertical">
        <Resizable.Panel maxSize={35} defaultSize={15}>
          <div className="h-full overflow-auto p-4">
            <Card.Description className="mb-2">Diff</Card.Description>
            <ReactJson src={updateDescription} collapsed={1} name={false} />
          </div>
        </Resizable.Panel>
        <Resizable.Handle />
        <Resizable.Panel>
          <Resizable.PanelGroup
            direction="horizontal"
            className="flex-1 min-h-0"
          >
            <Resizable.Panel defaultSize={50} className="min-h-0 ">
              <div className="h-full overflow-auto p-4">
                <Card.Description className="mb-2">Before</Card.Description>
                <ReactJson
                  src={maskFields(prevDocument, ['password'])}
                  collapsed={1}
                  name={false}
                />
              </div>
            </Resizable.Panel>

            <Resizable.Handle />

            <Resizable.Panel defaultSize={50} className="min-h-0">
              <div className="h-full overflow-auto p-4">
                <Card.Description className="mb-2">After</Card.Description>
                <ReactJson
                  src={maskFields(fullDocument, ['password'])}
                  collapsed={1}
                  name={false}
                />
              </div>
            </Resizable.Panel>
          </Resizable.PanelGroup>
        </Resizable.Panel>
      </Resizable.PanelGroup>
    </div>
  );
};
