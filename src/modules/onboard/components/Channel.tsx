import { IUser } from 'modules/auth/types';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { IChannel } from 'modules/settings/channels/types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select-plus';
import * as RTG from 'react-transition-group';
import { IIntegration } from '../types';
import { ChannelList } from './';
import { Description, Footer, TopContent } from './styles';

type Props = {
  members: IUser[];
  channelsTotalCount: number;
  channels: IChannel[];
  loading: boolean;
  integrations: IIntegration[];
  remove: (channelId: string) => void;
  save: (
    doc: {
      name: string;
      memberIds: string[];
      integrationIds: string[];
    }
  ) => void;
  changeStep: (increase: boolean) => void;
};

type State = {
  selectedMembers: IUser[];
  selectedMessengers: IIntegration[];
  showChannels: boolean;
};

class ChannelForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedMembers: [],
      selectedMessengers: [],
      showChannels: true
    };
  }

  toggleChannels = () => {
    this.setState({ showChannels: !this.state.showChannels });
  };

  save = e => {
    e.preventDefault();

    const { save } = this.props;

    save(this.generateDoc());
  };

  collectValues = items => {
    return items.map(item => item.value);
  };

  generateListParams = items => {
    return items.map(item => ({
      value: item._id,
      label:
        item.name || (item.details && item.details.fullName) || item.email || ''
    }));
  };

  generateDoc = () => {
    return {
      name: (document.getElementById('channel-name') as HTMLInputElement).value,
      memberIds: this.collectValues(this.state.selectedMembers),
      integrationIds: this.collectValues(this.state.selectedMessengers)
    };
  };

  renderContent() {
    const { members, integrations, channels, remove } = this.props;
    const { showChannels } = this.state;

    const self = this;

    const onChange = items => {
      self.setState({ selectedMembers: items });
    };

    const onChangeIntegrations = items => {
      self.setState({ selectedMessengers: items });
    };

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl id="channel-name" type="text" required={true} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Users</ControlLabel>

          <Select
            placeholder={__('Choose members')}
            onChange={onChange}
            value={self.state.selectedMembers}
            options={self.generateListParams(members)}
            multi={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Messengers</ControlLabel>

          <Select
            placeholder={__('Choose messengers')}
            onChange={onChangeIntegrations}
            value={self.state.selectedMessengers}
            options={self.generateListParams(integrations)}
            multi={true}
          />
        </FormGroup>

        <Description>
          <Icon icon="checked-1" /> {__('You already have')}{' '}
          <b>{this.props.channelsTotalCount}</b> {__('channels')}.{' '}
          <a href="javascript:;" onClick={this.toggleChannels}>
            {showChannels ? __('Show') : __('Hide')} ›
          </a>
        </Description>

        <RTG.CSSTransition
          in={showChannels}
          appear={true}
          timeout={300}
          classNames="slide-in-small"
          unmountOnExit={true}
        >
          <ChannelList remove={remove} channels={channels} />
        </RTG.CSSTransition>
      </React.Fragment>
    );
  }

  render() {
    const { channelsTotalCount, changeStep } = this.props;

    return (
      <form onSubmit={this.save}>
        <TopContent>
          <h2>{__('Create channel')}</h2>
          {this.renderContent()}
        </TopContent>
        <Footer>
          <div>
            <Button btnStyle="link" onClick={changeStep.bind(null, false)}>
              Previous
            </Button>
            <Button
              btnStyle="success"
              disabled={channelsTotalCount === 0}
              onClick={this.save}
            >
              {__('Finish')} <Icon icon="rightarrow-2" />
            </Button>
          </div>
          <Link to="/inbox">{__('Go to Inbox')} »</Link>
        </Footer>
      </form>
    );
  }
}

export default ChannelForm;
