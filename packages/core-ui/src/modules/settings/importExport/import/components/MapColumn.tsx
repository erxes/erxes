import React from 'react';

import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import Row from './Row';

import { ColumnTable } from 'modules/settings/importExport/styles';
import { isBoardKind } from '@erxes/ui-segments/src/utils';
import { Info } from '@erxes/ui/src/styles/main';
import { __ } from 'modules/common/utils';
import { Description, SubHeading } from '@erxes/ui-settings/src/styles';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';

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

  renderInfo = () => {
    const { contentType } = this.props;

    if (isBoardKind(contentType)) {
      return (
        <Info>
          {__(
            'To complete your import, you have to choose Board, Pipeline, Stage.'
          )}
        </Info>
      );
    }

    return null;
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
          <FlexPad type="stepper" direction="column">
            <SubHeading>
              {__(`${this.renderText(contentType)} mapping`)}
            </SubHeading>
            <Description>Map columns in your file to properties</Description>

            {this.renderInfo()}
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
