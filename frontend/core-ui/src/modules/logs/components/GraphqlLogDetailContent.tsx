import dayjs from 'dayjs';
import { Resizable, Sheet } from 'erxes-ui';
import ReactJson from 'react-json-view';
import { maskFields } from '../utils/logFormUtils';
import { ILogDoc } from '../types';

export const GraphqlLogDetailContent = ({ payload, createdAt }: ILogDoc) => {
  const { mutationName, args, result, error } = payload || {};

  const res = error ? error : result;

  return (
    <Resizable.PanelGroup direction="horizontal">
      <Resizable.Panel defaultSize={50} className="p-4">
        <Sheet.Description>Args</Sheet.Description>
        <ReactJson
          src={maskFields(args, ['password'])}
          collapsed={1}
          name={false}
        />
      </Resizable.Panel>
      <Resizable.Handle withHandle />
      <Resizable.Panel defaultSize={50} className="p-4">
        <Sheet.Description>Result</Sheet.Description>
        <ReactJson
          src={
            typeof res === 'string' ? { res } : maskFields(res, ['password'])
          }
          collapsed={1}
          name={false}
        />
      </Resizable.Panel>
    </Resizable.PanelGroup>
  );
};
