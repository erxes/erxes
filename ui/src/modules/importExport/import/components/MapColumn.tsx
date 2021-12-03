import React from 'react';
import { DataWithLoader, __ } from 'erxes-ui';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import { Description, SubHeading } from 'modules/settings/styles';
import Row from './Row';
import { ColumnTable } from 'modules/importExport/styles';

type Props = {
  columns: any[];
  fields: any[];
  columnWithChosenField: any;
  onChangeColumn: (column, value, contentType) => void;
  contentType: string;
};

class MapColumn extends React.Component<Props, {}> {
  render() {
    const { columns, fields, columnWithChosenField, contentType } = this.props;

    const content = (
      <ColumnTable>
        <thead>
          <tr>
            <th>
              <SubHeading>{__('Column Header')}</SubHeading>
              <Description>
                {__(
                  'This is the header title from the file you’ve uploaded. The order of these does not affect the importing process.'
                )}
              </Description>
            </th>
            <th>
              <SubHeading>{__('Preview Data')}</SubHeading>
              <Description>
                {__(
                  'This is a preview of the first 3 rows of data in each column.If empty, no data was found in that row.'
                )}
              </Description>
            </th>
            <th>
              <SubHeading>{__('Property')}</SubHeading>
              <Description>
                {__(
                  'Each column header should be mapped to a property in the system. Use the dropdown menu to map to an existing property or create a new custom property.'
                )}
              </Description>
            </th>
          </tr>
        </thead>
        <tbody className={'expand'}>
          {Object.keys(columns).map(column => (
            <Row
              contentType={contentType}
              key={Math.random()}
              columns={columns}
              column={column}
              fields={fields}
              columnWithChosenField={columnWithChosenField}
              onChangeColumn={this.props.onChangeColumn}
            />
          ))}
        </tbody>
      </ColumnTable>
    );

    return (
      <>
        <FlexItem>
          <FlexPad direction="column" overflow="auto">
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
