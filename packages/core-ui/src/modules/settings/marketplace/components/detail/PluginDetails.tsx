import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import styled from 'styled-components';
import Wrapper from './Wrapper';
import RightSidebar from './RightSidebar';
import Button from '@erxes/ui/src/components/Button';
import { Tabs } from '@erxes/ui/src/components/tabs/index';
import { TabTitle } from '@erxes/ui/src/components/tabs/index';
import { Flex } from '@erxes/ui/src/styles/main';
import { Card, ListHeader } from '../../styles';
import {
  DetailMainContainer,
  PluginTitle,
  DetailProfile,
  Center,
  Carousel,
  DetailInformation,
  Hashtag,
  Detail,
  ColorHeader
} from '../../styles';

type Props = {
  plugin?: {};
};

type State = {
  tabType: string;
};

class PluginDetails extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      tabType: 'Description'
    };
  }

  render() {
    const breadcrumb = [
      { title: __('Store'), link: '/store' },
      { title: 'WeeCommere Cart all in One' }
    ];
    const plugin = {
      image: '/images/integrations/planning.png',
      title: 'Logs',
      shortDescription:
        'From ideas to actual performance, make sure everything is recorded, prioritized, and centralized in a single platform. Test, learn, and grow with our easy to use plugin.',
      descriptions: [
        'The growth hacking plugin is the dedicated workspace for all growth teams.',
        'The ideal home for marketing, creativity, sales, supports folks, product warriors, data wizards, design artists, innovation souls, CRO specialists. This plugin provides many Growth Hacking templates for you to choose from. You can go one step further and create custom fields and questionnaires, ensuring you get the data you need to push your business forward.',
        'Unlimited Campaign & Projects: Manage your growth marketing campaigns, projects, and experiments in one place and build the entire growth operation.',
        'Pre-built growth hacking templates: Pick from many pre-built growth hacking templates provided in the system. Tweak these to your needs, or build your own.',
        'North Star metric: Take control of your entire growth marketing operation and make sure you are heading in the same direction and maximizing output.',
        'Find the balance between Important and Urgent: Determine the best growth hacking experiments that can maximize performance based on various views.',
        'ICE, RICE, PIE scoring model'
      ],
      features: [
        {
          name: 'Board view',
          text:
            'Your ideas will go through several steps, from created to implemented and evaluated. Board view allows you to see your workflow in its current condition and plan out the next steps.',
          list: []
        },
        {
          name: 'Priority matrix view',
          text:
            'This view allows you to evaluate ideas. choose from the least effort/highest performance view and many others.',
          list: []
        },
        {
          name: 'Weighted scoring view',
          text:
            'Evaluate the success percentage of your ideas by implementing an ICE/RICE/PIE scoring model. This will allow you to choose the highest payoff ideas to implement.',
          list: []
        },
        {
          name: 'Funnel view',
          text: `There are 6 (Awareness, Acquisition, Activation, Retention, Referral, Revenue) steps presented in the customers' journey. Every idea should pertain to one or a number of those six steps. Funnel view will allow you to see each experiment mapped to each stage in the customer journey - allowing you to match your ideas to your key customer journey pinch points.`,
          list: []
        }
      ],
      class: 'marketing',
      categories: ['Marketing']
    };

    const tabContent = this.state.tabType === 'Description' && (
      <>
        <Detail>
          <ListHeader>
            <ColorHeader>
              <b>📝 DESCRIPTION</b>
            </ColorHeader>
          </ListHeader>
          <p>{plugin.descriptions}</p>
        </Detail>
        <Detail>
          <ListHeader>
            <ColorHeader>
              <b>✨ FEATURES</b>
            </ColorHeader>
          </ListHeader>
          {plugin.features.map(feature => (
            <>
              <b>{feature.name}</b>
              <p>{feature.text}</p>
              <ul>
                {feature.list.map(listItem => (
                  <li>{listItem}</li>
                ))}
              </ul>
            </>
          ))}
        </Detail>
      </>
    );

    const handleSelect = tab => {
      this.setState({ tabType: tab });
    };

    const content = (
      <DetailMainContainer>
        <PluginTitle>
          <Center>
            <DetailProfile src={plugin.image} />
            <DetailInformation>
              <b>{plugin.title}</b>
              <span>{plugin.shortDescription}</span>
              <Flex>
                {plugin.categories.map(category => (
                  <Hashtag>
                    {'#'}
                    {category}
                  </Hashtag>
                ))}
              </Flex>
            </DetailInformation>
          </Center>
        </PluginTitle>

        <Carousel />

        <Tabs>
          <TabTitle onClick={() => handleSelect('Description')}>
            Description
          </TabTitle>
          <TabTitle onClick={() => handleSelect('Guide')}>Guide</TabTitle>
          <TabTitle onClick={() => handleSelect('Changelog')}>
            Changelog
          </TabTitle>
        </Tabs>

        {tabContent}
      </DetailMainContainer>
    );

    return (
      <Wrapper
        mainHead={<Wrapper.Header title="" breadcrumb={breadcrumb} />}
        rightSidebar={<RightSidebar plugin={plugin} />}
        content={content}
      />
    );
  }
}

export default PluginDetails;
