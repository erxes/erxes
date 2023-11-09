import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Common from '@erxes/ui-automations/src/components/forms/actions/Common';
import PlaceHolderInput from '@erxes/ui-automations/src/components/forms/actions/placeHolder/PlaceHolderInput';
import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import { IAction } from '@erxes/ui-automations/src/types';
import React from 'react';

type Props = {
  onSave: () => void;
  closeModal: () => void;
  activeAction: IAction;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
  triggerType: string;
};

type State = {
  config: any;
};

class ReplyFbMessage extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      config: props?.activeAction?.config || null
    };
  }

  render() {
    const { activeAction, closeModal, addAction, triggerType } = this.props;
    const { config } = this.state;

    return (
      <DrawerDetail>
        <Common
          closeModal={closeModal}
          addAction={addAction}
          activeAction={activeAction}
          config={config}
        >
          <FormGroup>
            <ControlLabel>{'From'}</ControlLabel>
            <SelectTeamMembers
              name="fromUserId"
              initialValue={config?.fromUserId}
              label="Select from user"
              onSelect={value =>
                this.setState({ config: { ...config, fromUserId: value } })
              }
              filterParams={{
                status: 'Verified'
              }}
              multi={false}
            />
          </FormGroup>

          <PlaceHolderInput
            config={config}
            triggerType={triggerType}
            inputName="text"
            label="Reply Text"
            onChange={config => this.setState({ config })}
          />
        </Common>
      </DrawerDetail>
    );
  }
}

export default ReplyFbMessage;
