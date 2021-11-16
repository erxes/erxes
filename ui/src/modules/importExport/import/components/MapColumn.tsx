import React from 'react';
import { DataWithLoader, Table, __ } from 'erxes-ui';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import { Description, SubHeading } from 'modules/settings/styles';
import Row from './Row';

type Props = {
  columns: any[];
  fields: any[];
};

class MapColumn extends React.Component<Props, {}> {
  render() {
    const { columns, fields } = this.props;

    const content = (
      <Table>
        <thead>
          <tr>
            <th>{__('MATCHED')}</th>
            <th>{__('COLUMN HEADER FROM FILE')}</th>
            <th>{__('PREVIEW INFORMATION')}</th>
            <th>{__('PROPERTY')}</th>
          </tr>
        </thead>
        <tbody className={'expand'}>
          {Object.keys(columns).map(column => (
            <Row
              key={Math.random()}
              columns={columns}
              column={column}
              fields={fields}
            />
          ))}
        </tbody>
      </Table>
    );

    return (
      <>
        <FlexItem>
          <FlexPad direction="column" overflow="auto">
            <SubHeading>
              {__('Map columns in your file to properties')}
            </SubHeading>
            <Description>
              {__(
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam facilisis leo leo, ut porttitor lorem suscipit ac. Mauris commodo consectetur finibus. Nullam id facilisis ante.'
              )}
            </Description>
            <DataWithLoader
              data={content}
              loading={false}
              emptyText="Upload your file"
              emptyImage="/images/actions/18.svg"
            />
          </FlexPad>
        </FlexItem>
      </>
    );
  }
}

export default MapColumn;
