import React from 'react';
import { DataWithLoader, __ } from 'erxes-ui';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import Row from './Row';
import { Description, SubHeading } from 'modules/settings/styles';
import { ColumnTable } from 'modules/settings/importExport/styles';

type Props = {
  columns: any[];
  fields: any[];
  columnWithChosenField: any;
  onChangeColumn: (column, value, contentType) => void;
  contentType: string;
};

class MapColumn extends React.Component<Props, {}> {
  renderText = value => {
    switch (value) {
      case 'customer':
        return 'Customers';
      case 'company':
        return 'Companies';
      case 'deal':
        return 'Deals';
      case 'ticket':
        return 'Tickets';
      case 'task':
        return 'Tasks';
      default:
        return value;
    }
  };

  render() {
    const { columns, fields, columnWithChosenField, contentType } = this.props;

    const content = (
      <ColumnTable>
        <thead>
          <tr>
            <th>Match</th>
            <th>Column header</th>
            <th>Preview data</th>
            <th>Property</th>
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
            <SubHeading>
              {__(`${this.renderText(contentType)}' mapping`)}
            </SubHeading>
            <Description>Map columns in your file to properties</Description>

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
