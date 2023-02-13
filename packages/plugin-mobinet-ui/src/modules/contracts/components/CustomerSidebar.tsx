import styled from 'styled-components';
import { colors, dimensions } from '@erxes/ui/src/styles';
import React from 'react';
import Box from '@erxes/ui/src/components/Box';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import { getEnv } from '@erxes/ui/src/utils';

type Props = {
  contracts: any[];
};

const List = styled(SidebarList)`
  li {
    border-bottom: 1px solid ${colors.borderPrimary};
    color: ${colors.textPrimary};
    white-space: normal;
    padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;

    span {
      color: ${colors.colorCoreLightGray};
      margin: 0;
    }

    i {
      margin-left: ${dimensions.unitSpacing / 2}px;
    }

    &:last-child {
      border: none;
    }
  }
`;

class Sidebar extends React.Component<Props> {
  render() {
    return (
      <Box title="Contacts" name="contacts">
        <List>
          {this.props.contracts.map(contract => {
            const href = `${
              getEnv().REACT_APP_API_URL
            }/pl:documents/print?_id=${contract.documentId}&contractId=${
              contract._id
            }`;

            return (
              <li>
                <a target="__blank" href={href}>
                  {contract.building.name}
                </a>
              </li>
            );
          })}
        </List>
      </Box>
    );
  }
}

export default Sidebar;
