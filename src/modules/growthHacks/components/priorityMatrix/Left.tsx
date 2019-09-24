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
              <th>{__('Task')}</th>
              <th>{__('Impact')}</th>
              <th>{__('Effort')}</th>
            </tr>
          </thead>
          <tbody>
            {this.props.growthHacks.map(growthHack => {
              return (
                <tr key={growthHack._id}>
                  <td>{growthHack.name}</td>
                  <td>
                    <b>
                      <input defaultValue={growthHack.impact} />
                    </b>
                  </td>
                  <td>
                    <b>
                      <input defaultValue={growthHack.ease} />
                    </b>
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
