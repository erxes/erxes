import Button from 'modules/common/components/Button';
import { FormGroup } from 'modules/common/components/form';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { ICommonFormProps } from 'modules/settings/common/types';
import { WEBHOOK_ACTIONS } from 'modules/settings/constants';
import React from 'react';
import { IWebhookAction } from '../types';

type Props = {
    renderButton: (props: IButtonMutateProps) => JSX.Element;
    endpointUrl?: string;
    webhookActions: IWebhookAction[];
    refetchQueries: any;
} & ICommonFormProps;

type State = {
    actions: any[];
    selectedActions: any[];
    endpointUrl: string;
};

class WebhookAddForm extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);


        const webhookActions = props.webhookActions.map(item => item.label);
        const actions = WEBHOOK_ACTIONS.incoming;
        const selectedActions = actions.map(item => {
            if (webhookActions.includes(item.label)) {
                return {
                    ...item,
                    checked: true
                }
            }

            return {
                ...item,
                checked: false
            }
        })

        this.state = {
            actions,
            selectedActions,
            endpointUrl: props.endpointUrl || "",
        };
    }



    onChange = e => {
        const index = (e.currentTarget as HTMLInputElement).value;
        const isChecked = (e.currentTarget as HTMLInputElement).checked;

        const selected = this.state.selectedActions[index];
        const selectedActions = this.state.selectedActions;

        selectedActions[index] = { type: selected.type, action: selected.action, label: selected.label, checked: isChecked };
        this.setState({ selectedActions });
    };

    onChangeUrl = e => {
        const value = (e.currentTarget as HTMLInputElement).value;
        this.setState({ endpointUrl: value })
    };


    renderContent = (formProps: IFormProps) => {
        const { selectedActions } = this.state;
        const { closeModal, renderButton, endpointUrl } = this.props;
        const { isSubmitted } = formProps;

        return (
            <>

                <FormGroup>
                    <ControlLabel>Endpoint url</ControlLabel>
                    <FormControl
                        id="endpoint-url"
                        type="text"
                        placeholder="https://"
                        value={endpointUrl}
                        onChange={this.onChangeUrl}
                    />
                </FormGroup>
                <table style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th>
                                <ControlLabel required={true}>Actions</ControlLabel>
                            </th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {selectedActions.map((input, i) => (

                            <tr key={i}>

                                <td>
                                    <FormControl
                                        value={i}
                                        componentClass="checkbox"
                                        checked={input.checked}
                                        onChange={this.onChange}
                                        inline={true}
                                    >
                                        {__(`${input.label}`)}
                                    </FormControl>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>


                <ModalFooter>
                    <Button
                        btnStyle="simple"
                        onClick={closeModal}
                        icon="times-circle"
                        uppercase={false}
                    >
                        Cancel
            </Button>

                    {renderButton({
                        name: 'add webhook',
                        values: {
                            isOutgoing: true, actions: this.state.selectedActions.filter(e => e.checked === true).map(obj => {
                                return { type: obj.type, label: obj.label, action: obj.action }
                            }), url: this.state.endpointUrl
                        },
                        isSubmitted,
                        callback: closeModal
                    })}
                </ModalFooter>
            </>
        );
    };

    render() {
        return (
            <>


                <Form autoComplete="off" renderContent={this.renderContent} />
            </>
        );
    }
}

export default WebhookAddForm;
