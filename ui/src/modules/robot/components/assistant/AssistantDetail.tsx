import Icon from 'modules/common/components/Icon';
import * as React from 'react';
import { NavButton, Title } from '../styles';
import { NotifyItem, NotifyList } from './styles';

type Props = {
  icon?: string;
};

type State = {
  show: boolean;
};

class AssistantDetail extends React.PureComponent<Props, State> {
  render() {
    return (
      <>
        <NavButton>
          <Icon icon="arrow-left" size={24} />
        </NavButton>

        <Title>Customer merge</Title>
        <p>
          Combine real-time client and team communication with in-app messaging,
          live chat, email and form.
        </p>
        <NotifyList>
          <NotifyItem>
            <Icon icon="check-circle" />
            <div>
              Merged <b>Ganzorig</b> and <b>Ganzorig Bayarsaikhan</b>
            </div>
          </NotifyItem>

          <NotifyItem>
            <Icon icon="check-circle" />
            <div>
              Merged <b>Ganzorig</b> and <b>Ganzorig Bayarsaikhan</b>
            </div>
          </NotifyItem>

          <NotifyItem>
            <Icon icon="check-circle" />
            <div>
              Merged <b>Ganzorig</b> and <b>Ganzorig Bayarsaikhan</b>
            </div>
          </NotifyItem>

          <NotifyItem>
            <Icon icon="check-circle" />
            <div>
              Merged <b>Ganzorig</b> and <b>Ganzorig Bayarsaikhan</b>
            </div>
          </NotifyItem>
        </NotifyList>
      </>
    );
  }
}

export default AssistantDetail;
