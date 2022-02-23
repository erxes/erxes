import React from "react";
import {
    VISITOR_AUDIENCE_RULES
} from '../../constants/engage';
import { ModalFooter } from '../../styles/main';
import FormControl from '../form/Control';
import Button from '../Button';
import { ControlLabel, Form, FormGroup } from "../form";

type Props = {
    closeModal: () => void;
    onChange: (e: any) => void;
};

type State = {
    selectedMembers: string[];
};

class ChannelForm extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

    }

    onSelect = (e: any) => {
        this.props.onChange(e)
        this.props.closeModal();
    }


    renderContent = () => {
        const { closeModal } = this.props;

        return (
            <>
                <FormGroup>
                    <ControlLabel>Rules</ControlLabel>
                    <p> Add rules as many as you want</p>

                    <FormControl componentClass="select" onChange={this.onSelect}>
                        {VISITOR_AUDIENCE_RULES.map((rule, index) => (
                            <option key={index} value={rule.value}>
                                {rule.text}
                            </option>
                        ))}
                    </FormControl>
                </FormGroup>
                <ModalFooter>
                    <Button
                        btnStyle="simple"
                        type="button"
                        icon="cancel-1"
                        onClick={closeModal}
                    >
                        Close
                    </Button>
                </ModalFooter>
            </>

        );
    };

    render() {
        return <Form renderContent={this.renderContent} />;
    }
}

export default ChannelForm;
