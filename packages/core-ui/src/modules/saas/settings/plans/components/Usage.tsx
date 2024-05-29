import { IOrganization, chargeItemWithCountResponse } from '../types';

import Icon from '@erxes/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import React from 'react';
import Title from 'modules/saas/settings/plans/components/Title';
import WithPermission from '@erxes/ui/src/components/WithPermission';
import colors from '@erxes/ui/src/styles/colors';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import withChargeItems from '../containers/withChargeItems';
import withCurrentOrganization from '@erxes/ui-settings/src/general/saas/containers/withCurrentOrganization';

const Item = styledTS<{ bottomSpace?: number }>(styled.div)`
  padding: 5px 20px;
  background: ${rgba(colors.colorCoreTeal, 0.08)};
  margin-bottom: 5px;

  h5 {
    margin: 7px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    b {
      color: ${colors.colorPrimaryDark};
      font-weight: 800;
    }

    a {
      color: ${colors.textSecondary};
      font-size: 14px;
      width: fit-content;
      padding: 0;
      &:hover {
        background: none;
      }
    }

    em {
      font-size: 12px;
    }
  }
`;

type Props = {
  chargeItems: chargeItemWithCountResponse[];
  currentOrganization: IOrganization;
};

function Usage(props: Props) {
  const { currentOrganization } = props;

  return (
    <WithPermission action="editOrganizationInfo">
      <Item>
        <h5>
          <span>
            <Title currentOrganization={currentOrganization} />
          </span>
          <Link to="/settings/organizations">
            <Icon icon="cog" />
          </Link>
        </h5>
      </Item>
    </WithPermission>
  );
}

export default withCurrentOrganization(withChargeItems(Usage));
