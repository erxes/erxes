import Icon from 'modules/common/components/Icon';
import Button from 'modules/common/components/Button';
import { colors, dimensions } from '@erxes/ui/src/styles';
import { Flex } from '@erxes/ui/src/styles/main';
import { __ } from 'modules/common/utils';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { Alert } from 'modules/common/utils';
import {
  ListContainer,
  ListHeader,
  ListTitle,
  ColorText,
  Card,
  GrayText
} from '../styles';

const PluginContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const PluginPic = styled.img`
  width: 60px;
  height: 60px;
`;

const PluginInformation = styled.div`
  margin: ${dimensions.unitSpacing}px 0 ${dimensions.unitSpacing}px 0;

  b {
    text-transform: capitalize;
  }
`;

// const Footer = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
// `;

// const Rating = styled.div`
//   height: ${dimensions.coreSpacing}px;
//   width: 90px;
//   background: ${colors.bgGray};
// `;

const Description = styled.p`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden !important;
`;

type Props = {
  onSearch?: (e) => void;
  clearSearch?: () => void;
  results?;
  enabledServicesQuery;
  manageInstall;
};

class PluginPreview extends React.Component<
  Props,
  { showInput: boolean; searchValue: string; loading: any }
> {
  // private wrapperRef;

  constructor(props) {
    super(props);

    this.state = { showInput: false, searchValue: '', loading: {} };
  }

  renderList = () => {
    // const space = "\u00a0";
    const { enabledServicesQuery } = this.props;
    const { loading } = this.state;

    const enabledServices = enabledServicesQuery.enabledServices || {};

    const manageInstall = (type: string, name: string) => {
      this.setState({ loading: { [name]: true } });

      this.props
        .manageInstall({
          variables: { type, name }
        })
        .then(() => {
          Alert.success('You successfully installed');
          window.location.reload();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const plugins = [
      {
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
      },
      {
        image: '/images/integrations/graphic-design.png',
        title: 'Forms',
        shortDescription:
          'Turn regular visitors into qualified leads by capturing them with a customizable pop-ups, forms, and embedded placements. The forms plugin helps you to create stylish and contextual pop-ups, banners and bars to fit all your marketing needs.',
        descriptions: [
          'No coding skills required',
          'Run more effective pop-up campaigns with our ready to go templates in forms, without having to write a line of code. Customise the look and feel to match your brand styles, look and feel.'
        ],
        features: [
          {
            name: 'Tags to filter pop-ups and forms',
            text:
              'You can use tags to filter your pop-ups and forms, so staying organized is easy. With pop-ups and forms, you can use tags for:',
            list: [
              'Engage messages',
              'Conversations',
              'Customers',
              'Integrations',
              'Product & Service'
            ]
          },
          {
            name: 'Variety of uses',
            text:
              'Carefully planned pop-ups and forms can bring more leads. You can use them for:',
            list: [
              'Drive more sales',
              'Build your email list',
              'Run surveys',
              'Upsell and cross sell',
              'Improve customer experience',
              'Reduce cart abandonment and many more'
            ]
          },
          {
            name: 'Records of previous pop-up campaigns',
            text:
              'The forms plugin keeps all your previous records of pop-ups and forms. You can have a full view of your pop-ups and forms with full analytics, including:',
            list: ['Number of views', 'Conversation rate', 'Gathered contacts']
          }
        ],
        class: 'marketing',
        categories: ['Marketing']
      },
      {
        image: '/images/integrations/wireframe.png',
        title: 'Sales pipeline',
        shortDescription:
          'All your customer information and sales process in one board to follow up flawlessly. Have your sales managers to know everything needed to deliver increased levels of personalization before they contact customers.',
        descriptions: [
          'Easy and straightforward sales funnels allow you to control your sales pipeline from one responsive field with board, calendar, and conversion views. With different views and filtering tools, you can precisely analyze your progress and determine your next best step for success.'
        ],
        features: [
          {
            name:
              'Unlimited boards and history of every single sale at one-click',
            text: '',
            list: [
              'Create an unlimited number of sales boards and pipelines for your different products and brands.',
              'Set up all of the various products and services on separate sales boards to follow up flawlessly and introduce your other products to the potential customers.'
            ]
          },
          {
            name: 'Efficient communication within your sales team',
            text: '',
            list: [
              'Supply team members with all the necessities to deliver increased personalization levels before they contact customers.',
              'Track the entire sales pipeline, including deadlines, assigned person, updates on process, and sales process conversations.'
            ]
          },
          {
            name: 'Full insight into your sales performance',
            text: '',
            list: [
              'Automatic analytic tools that can generate all useful statistics and graphics related to your sales.',
              'View won and lost deal reports for free.',
              'Insights filter helps you to see your sales records by-products, pipeline, dates, and salesperson.'
            ]
          },
          {
            name: 'Track your sales pipelines and accomplish your sales goal',
            text: '',
            list: []
          }
        ],
        class: 'sales',
        categories: ['Sales']
      },
      {
        image: '/images/integrations/contact-book.png',
        title: 'Contact management',
        shortDescription:
          'Manage Visitors, Customers, and Companies at all touchpoints',
        descriptions: [
          'Use the Contact Management plugin to coordinate and manage your contacts and interactions with your customers. This plugin provides complete segmentation tools for you to work more efficiently.'
        ],
        features: [
          {
            name: 'Customer history page',
            text: '',
            list: [
              'One-click contact details',
              'View all previous engagement history of the customer.'
            ]
          },
          {
            name: 'Set up segmentation and tag',
            text: '',
            list: [
              'All the necessary segmentation, tags, and filtering tools.',
              'Ability to set up the customer segmentation and tag while you communicate with your customer in tandem.'
            ]
          },
          {
            name: 'Contact your segmented customers',
            text: '',
            list: [
              'Filter your contact list with tags and segments.',
              'Reach your targeted customers with automated personalized messaging.'
            ]
          },
          {
            name:
              'Build your customer database and see them with 360 degree vision',
            text: '',
            list: []
          }
        ],
        class: 'communications',
        categories: ['Communications']
      },
      {
        image: '/images/integrations/inbox.png',
        title: 'Team inbox',
        shortDescription:
          'Communicate faster and easier with your customers via one truly omnichannel platform',
        descriptions: [
          'Combine real-time client and team communication with in-app messaging, live chat, email, and form, so your customers can reach you, however and wherever they want. With Team Inbox, you can bring all inboxes in one window and manage all your interaction from a single responsive dashboard. Shared Team Inbox keeps all history of your engagement and provides tag and filter tools to help you to be more productive.'
        ],
        features: [
          {
            name: 'Clear view with segments',
            text: '',
            list: [
              'Unlimited number of brands and channels',
              'Segment all your communication histories by brands, channels, integrations, and tags',
              `View your customer's past interaction, history, and preferences`
            ]
          },
          {
            name: 'Ticket box for unsolved cases',
            text: '',
            list: [
              'Invite team members to channels',
              'Ticket labels that help you to recognize the urgency of the issues and take action '
            ]
          },
          {
            name: 'Insights tools to monitor analytics',
            text: '',
            list: []
          }
        ],
        class: 'communications',
        categories: ['Communications']
      },
      {
        image: '/images/integrations/chat.png',
        title: 'Messenger',
        shortDescription:
          'Talk to Your Customers in Continuous Omnichannel Conversations',
        descriptions: [
          'Enable businesses to capture every single customer feedback and communicate in real time. Works in tandem with the Knowledge Base plugin to help you educate your customers.'
        ],
        features: [
          {
            name: 'Connect your website with Erxes Messenger',
            text: '',
            list: [
              'Connect your website with Erxes messenger and enable to capture every single customer feedback or questions'
            ]
          },
          {
            name: 'FAQ in your Messenger',
            text: '',
            list: [
              'Direct your customers with most asked or frequently asked questions which leads to satisfied customers'
            ]
          },
          {
            name: 'Automated messenger reply',
            text: '',
            list: [
              'Create automated reply on your messenger while you are away.'
            ]
          },
          {
            name: 'Monitor on all sorts of analytics erxes provide',
            text: '',
            list: [
              `Analytics can lead to better and more productive customer relationships through the evaluation of the organization's customer service and analyzing the customers.`
            ]
          }
        ],
        class: 'communications',
        categories: ['Communications']
      },
      {
        image: '/images/integrations/documentation.png',
        title: 'Knowledge base',
        shortDescription: 'Create Help Articles for Customer Self-service',
        descriptions: [
          'Educate both your customers and staff by creating a help center related to your brands, products and services to reach higher level of satisfactions.'
        ],
        features: [
          {
            name: 'Create contents for FAQ',
            text: '',
            list: [
              'Resolve cases faster with instant access to records of how agents solved similar cases'
            ]
          },
          {
            name: 'Label the answer and questions',
            text: '',
            list: [
              'Organize your Knowledge base menu with labels or folders by brands, products and even by type of questions'
            ]
          },
          {
            name: 'Knowledge base on your webiste',
            text: '',
            list: [
              'Create embeddable knowledge base and FAQs on your messenger of website.'
            ]
          },
          {
            name: 'Auto updates',
            text: '',
            list: [
              'Create new page on your website and connect your knowledge base menu to your website.'
            ]
          }
        ],
        class: 'marketing service',
        categories: ['Marketing', 'Service']
      },
      {
        image: '/images/integrations/goal.png',
        title: 'Task management',
        shortDescription: 'Collaborate more effectivelly and get more done',
        descriptions: [
          'Turn chaos into clarity, This plugin provides all the must have task management tools. Team members can attach documents, add process notes, deadlines, checklists and all related information. Bringing everyone in one board with different tasks will make team members be informed and updated.'
        ],
        features: [
          {
            name: 'Unlimited boards and pipelines',
            text: '',
            list: [
              'Filter views by: Companies, Customers, Priority, Team Members, Labels, and Due Dates'
            ]
          },
          {
            name: 'Synergy with our other plugins',
            text: '',
            list: [
              'The time management plugins works perfectly with the sales pipeline, ticket, and Contact plugins'
            ]
          },
          {
            name: 'Keep up to date in your calendar',
            text: '',
            list: ['Recieve notifications for the due dates that you set']
          }
        ],
        class: 'service',
        categories: ['Service']
      },
      {
        image: '/images/integrations/shipping.png',
        title: 'Products & Services',
        shortDescription:
          'Store all your products and services and stay organized!',
        descriptions: [
          'Having all your products and services categorized and stored in one place is a great way to stay organized'
        ],
        features: [
          {
            name: 'Store as many product and services as you wish',
            text: '',
            list: [
              'No matter how many products and services you have, you can store them in the most efficient way, with all the related information'
            ]
          },
          {
            name: 'Create custom products & services',
            text: '',
            list: ['Easily customize your account for your unique product. ']
          },
          {
            name: 'Connect to all the parts of your business',
            text: '',
            list: [
              'Increase the synergy between many parts of your business by linking products and services with features like sales, conversations, tickets and tasks.'
            ]
          },
          {
            name: 'Create custom filters',
            text: '',
            list: [
              'Creating unique filters allows you to organize and find specific products.',
              `With the help of a filter and search engine, you'll save time better spent on enjoying the fruits of your labor.`
            ]
          }
        ],
        class: 'service',
        categories: ['Service']
      },
      {
        image: '/images/integrations/flow-chart.png',
        title: 'Segments',
        shortDescription:
          'Filter, target, and engage a certain group of contacts',
        descriptions: [
          'The Segments plugin helps you to filter, target, and engage a group of contacts as defined by you. This plugin integrated with the Contacts and Engage plugins.  Use custom properties to target any segment you can think of.'
        ],
        features: [
          {
            name: 'Create a parent segment',
            text: '',
            list: [
              'Use this segment to target a larger and more broadly defines set of customers.'
            ]
          },
          {
            name: 'Create subsegments',
            text: '',
            list: ['Use subsegments to finely tune the scope of the segment']
          },
          {
            name: 'Prepare your email content',
            text: '',
            list: ['Use to reach any predefined segments or subsegment.']
          },
          {
            name: 'Create a new message with Engage',
            text: '',
            list: []
          }
        ],
        class: 'service',
        categories: ['Service']
      }
    ];

    return (
      <PluginContainer>
        {plugins.map(plugin => (
          <Card key={plugin.title}>
            <PluginPic src={plugin.image} />
            <PluginInformation>
              <b>{plugin.title}</b>
              <Description>{plugin.shortDescription}</Description>
            </PluginInformation>
            {enabledServices[plugin.title.toLowerCase()] ? (
              <>
                <span>
                  {loading[plugin.title.toLowerCase()] ? 'Loading ...' : ''}
                </span>
                <div>
                  <button
                    onClick={manageInstall.bind(
                      this,
                      'uninstall',
                      plugin.title.toLowerCase()
                    )}
                    className="uninstall"
                  >
                    Uninstall
                  </button>

                  <button
                    onClick={manageInstall.bind(
                      this,
                      'update',
                      plugin.title.toLowerCase()
                    )}
                    className="update"
                  >
                    Update
                  </button>

                  <div style={{ clear: 'both' }} />
                </div>
              </>
            ) : (
              <button
                onClick={manageInstall.bind(
                  this,
                  'install',
                  plugin.title.toLowerCase()
                )}
                className="install"
              >
                {loading[plugin.title.toLowerCase()]
                  ? 'Loading ...'
                  : 'Install'}
              </button>
            )}
            {/* <Flex>
              <Button size="small">
                <Icon
                  icon="shopping-cart-alt"
                  size={15}
                  color={colors.colorPrimary}
                />
              </Button>
              <Button size="small">
                <b>Install</b>
              </Button>
            </Flex> */}
          </Card>
        ))}
        {/* {plugins.map((plugin) => {
          enabledServices[plugin.title] && (
            <Card key={plugin.title}>
              <PluginPic src={plugin.image} />
              <PluginInformation>
                <b>{plugin.title}</b>
                <Description>{plugin.shortDescription}</Description>
              </PluginInformation>
              <Flex>
                <Button size="small">
                  <Icon
                    icon="shopping-cart-alt"
                    size={15}
                    color={colors.colorPrimary}
                  />
                </Button>
                <Button size="small">
                  <b>Install</b>
                </Button>
              </Flex>
            </Card>
          );
        })} */}
      </PluginContainer>
    );
  };

  render() {
    return (
      <ListContainer>
        <ListHeader>
          <ListTitle>Plugins</ListTitle>
          <ColorText>View all</ColorText>
        </ListHeader>
        {this.renderList()}
      </ListContainer>
    );
  }
}

export default PluginPreview;
