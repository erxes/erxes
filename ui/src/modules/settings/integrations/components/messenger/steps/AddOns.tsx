import Button from 'modules/common/components/Button';
import { ControlLabel, FormControl, FormGroup } from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import { ITopic } from 'modules/knowledgeBase/types';
import { Options } from 'modules/settings/integrations/styles';
import { IIntegration, ILeadMessengerApp, IMessengerApps, ITopicMessengerApp, IWebsiteMessengerApp } from 'modules/settings/integrations/types';
import React, { useEffect, useState } from 'react'
import Select from 'react-select-plus';
import styled from 'styled-components';

const WebsiteItem = styled.div`
	padding: 12px 16px 0 16px;
	background: #fafafa;
	border-radius: 4px;
	border: 1px solid #eee;
	position: relative;
`;

const RemoveButton = styled.div`
	position: absolute;
	right: 16px;
	top: 16px;
	background: rgba(0, 0, 0, 0.1);
	border-radius: 50%;
	width: 24px;
	height: 24px;
	display: flex;
	justify-content: center;
	align-items: center;
	transition: opacity ease .3s;

	&:hover {
		opacity: 0.8;
		cursor: pointer;
	}
`;

type Props = {
	type?: string;
	topics: ITopic[];
	leads: IIntegration[];
	selectedBrand?: string;
	leadMessengerApps: ILeadMessengerApp[];
	knowledgeBaseMessengerApps: ITopicMessengerApp[];
	websiteMessengerApps: IWebsiteMessengerApp[];
	handleMessengerApps: (messengerApps: IMessengerApps) => void
};

const AddOns = (props: Props) => {
	const { websiteMessengerApps = [], leadMessengerApps = [], knowledgeBaseMessengerApps = [] } = props;

	const initialWebsites = websiteMessengerApps.map(item => (
		{url: item.credentials.url, buttonText: item.credentials.buttonText, description: item.credentials.description}
	));
	const initialLeads = leadMessengerApps.map(item => item.credentials.formCode);
	const initialKb = knowledgeBaseMessengerApps.length > 0 && props.knowledgeBaseMessengerApps[0].credentials.topicId;

	const [knowledgeBase, setKnowledgeBase] = useState(initialKb || '');
	const [popups, setPopups] = useState(initialLeads || []);
	const [websites, setWebsites] = useState(initialWebsites || [
		{ url: '', buttonText: '', description: '' }
	]);

	const generateMessengerApps = () => {
		return {
			knowledgebases: [{topicId: knowledgeBase}],
			leads: popups.map(el => ({formCode: el})),
			websites
		}
	}

	const updateMessengerValues = () => {
		props.handleMessengerApps(generateMessengerApps());
	}

	const renderOption = option => {
    return (
      <Options>
        {option.label}
        <i>{option.brand && option.brand.name}</i>
      </Options>
    );
	};
	
	const generateObjectsParams = objects => {
    return objects.map(object => ({
      value: object.form ? object.form.code : object._id,
      label: object.name || object.title,
			brand: object.brand,
			disabled: props.selectedBrand ? props.selectedBrand !== object.brand._id : false
    }));
	};
	
	const onChangeKb = obj => {
		setKnowledgeBase(obj.value);
  };

	const onChangePopups = objects => {
		setPopups(objects.map(el => el.value));
	};

	const onChangeInput = (
    i: number,
    type: 'url' | 'description' | 'buttonText',
    e: React.FormEvent
  ) => {

    const { value } = e.target as HTMLInputElement;

    const entries = [...websites];

    entries[i] = { ...entries[i], [type]: value };

		setWebsites(entries);
		updateMessengerValues();
	};

	const handleRemoveWebsite = (i: number) => {
		setWebsites(websites.filter((item, index) => index !== i));
		updateMessengerValues();
  };
	
	const renderRemoveInput = (i: number) => {
    if (websites.length <= 1) {
      return null;
    }

    return (
			<Tip text={__('Remove')} placement="top">
				<RemoveButton onClick={handleRemoveWebsite.bind(null, i)}>
					<Icon icon="times" />
				</RemoveButton>
			</Tip>
    );
	};

	const onAddMoreInput = () => {
    setWebsites([...websites, { url: '', buttonText: '', description: '' }]);
	};

	useEffect(() => {
		updateMessengerValues();
		// eslint-disable-next-line
 	},[knowledgeBase, popups]);

	return (
		<FlexItem>
			<LeftItem>
				<FormGroup>
					<ControlLabel>Knowledge Base</ControlLabel>
					<p>{__('Which specific knowledgebase do you want to display in a separate tab in this messenger')}?</p>
					<Select
            value={knowledgeBase}
            options={generateObjectsParams(props.topics)}
            onChange={onChangeKb}
            optionRenderer={renderOption}
          />
					
				</FormGroup>
				<FormGroup>
					<ControlLabel>Pop Ups</ControlLabel>
					<p>{__('Which popup(s) do you want to display in this messenger')}?</p>
					<Select
            value={popups}
            options={generateObjectsParams(props.leads)}
						onChange={onChangePopups}
						optionRenderer={renderOption}
						multi={true}
          />
				</FormGroup>
				<FormGroup>
					<ControlLabel>Websites</ControlLabel>
					<p>{__('Which website(s) do you want to display in this messenger')}?</p>
				</FormGroup>
				{websites.map((website, index) => (
					<FormGroup key={index}>
						<WebsiteItem>
							<FormGroup>
								<ControlLabel required={true}>Website Title</ControlLabel>
								<FormControl
									name="description"
									onChange={onChangeInput.bind(null, index, 'description')}
									required={true}
									value={website.description}
								/>
							</FormGroup>
							<FormGroup>
								<ControlLabel required={true}>Website Url</ControlLabel>
								<FormControl value={website.url} onChange={onChangeInput.bind(null, index, 'url')} name="url" required={true} />
							</FormGroup>
							<FormGroup>
								<ControlLabel required={true}>Button text</ControlLabel>
								<FormControl onChange={onChangeInput.bind(null, index, 'buttonText')} value={website.buttonText} name="buttonText" required={true} />
							</FormGroup>
						</WebsiteItem>
						{renderRemoveInput(index)}
					</FormGroup>
				))}
				<Button uppercase={false} onClick={onAddMoreInput} icon="plus-circle" btnStyle="primary">
					{__('Add a Website')}
				</Button>
			</LeftItem>
		</FlexItem>
	)
}

export default AddOns;