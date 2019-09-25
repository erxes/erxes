import Table from 'modules/common/components/table';
import { __ } from 'modules/common/utils';
import { LeftContent } from 'modules/growthHacks/styles';
import React from 'react';

type Props = {
  growthHacks: any[];
};

class Left extends React.Component<Props> {
  render() {
    return (
      <LeftContent>
        <Table hover={true}>
          <thead>
            <tr>
              <th>{__('Task name')}</th>
              <th style={{ width: 40 }}>{__('Impact')}</th>
              <th style={{ width: 40 }}>{__('Effort')}</th>
            </tr>
          </thead>
          <tbody className="with-input">
            {this.props.growthHacks.map(growthHack => {
              return (
                <tr key={growthHack._id}>
                  <td>{growthHack.name}</td>
                  <td>
                    <input defaultValue={growthHack.impact} />
                  </td>
                  <td>
                    <input defaultValue={growthHack.ease} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </LeftContent>
    );
  }
}

export default Left;
