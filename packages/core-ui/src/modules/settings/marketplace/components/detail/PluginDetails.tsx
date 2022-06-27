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
  id: string;
};

type State = {
  tabType: string;
  plugin: any;
};

class PluginDetails extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      tabType: 'Description',
      plugin: {}
    };
  }

  async componentDidMount() {
    await fetch(`https://erxes.io/pluginDetail/${this.props.id}`)
      .then(async response => {
        const plugin = await response.json();

        this.setState({ plugin });
      })
      .catch(e => {
        console.log(e);
      });
  }

  render() {
    const { plugin } = this.state;

    const breadcrumb = [
      { title: __('Store'), link: '/settings/installer' },
      { title: plugin.title || '' }
    ];

    const tabContent = this.state.tabType === 'Description' && (
      <>
        <Detail>
          <ListHeader>
            <ColorHeader>
              <b>📝 DESCRIPTION</b>
            </ColorHeader>
          </ListHeader>
          <p>{plugin.description}</p>
        </Detail>
        <Detail>
          <ListHeader>
            <ColorHeader>
              <b>✨ FEATURES</b>
            </ColorHeader>
          </ListHeader>
          {([] as any).map(feature => (
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
                {[].map(category => (
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
