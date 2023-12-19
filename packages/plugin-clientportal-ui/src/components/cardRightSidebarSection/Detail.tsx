import {
  ItemBox,
  ItemIndicator
} from '@erxes/ui-cards/src/boards/styles/stage';
import { ICompany } from '@erxes/ui-contacts/src/companies/types';
import { getCPUserName } from '@erxes/ui-log/src/activityLogs/utils';
import { renderFullName } from '@erxes/ui/src/utils';
import React from 'react';
import { ClientPortalConfig, IClientPortalUser } from '../../types';

type Props = {
  item: ClientPortalConfig | IClientPortalUser | ICompany;
  color: string;
};

class Detail extends React.Component<Props> {
  renderItem(item, color) {
    return (
      <ItemBox>
        <ItemIndicator color={color} />
        {item.name ||
          item.primaryName ||
          renderFullName(item) ||
          getCPUserName(item)}
      </ItemBox>
    );
  }

  render() {
    const { item, color } = this.props;

    if (!item) {
      return null;
    }

    return <>{this.renderItem(item, color)}</>;
  }
}

export default Detail;
