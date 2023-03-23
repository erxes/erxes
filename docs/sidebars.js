var pluginTutorialSideBar = require('./plugin.tutorial.sidebars');
var userGuideSidebar = require('./user.guide.sidebar');


// 'deployment/deployment

var sideBar = {
  docs: [
    {
      type: 'category',
      label: 'Getting started',
      link: {
        type: 'doc',
        id: 'intro'
      },
      collapsed: true,
      items: ['introduction/architecture', 'introduction/faq']
    },
    {
      type: 'category',
      label: 'Setup & Deployment',
      link: {
        type: 'generated-index'
      },
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Local installation',
          link: {
            type: 'generated-index'
          },
          collapsed: true,
          items: [
            'deployment/installation/installation-ubuntu',
            'deployment/installation/installation-mac'
          ]
        },

        {
          type: 'category',
          label: 'Deployment',
          link: {
            type: 'generated-index'
          },
          collapsed: true,
          items: [
            'deployment/deployment/deploymentDocker',
            'deployment/deployment/deploymentDockerCompose'
          ]
        }
      ]
    },

    {
      type: 'category',
      label: 'Development',
      link: {
        type: 'generated-index'
      },
      collapsed: true,
      items: [
        'developer/developing-plugins',
        'developer/developing-integration-plugins'
      ]
    },
    {
      type: 'category',
      label: 'Developer Resources',
      link: {
        type: 'generated-index'
      },
      collapsed: true,
      items: [
        {
          'GraphQL API': [
            'api/introduction',
            'api/objects',
            'api/inputObjects',
            'api/enums',
            'api/scalars',
            'api/queries',
            'api/mutations',
            {
              type: 'category',
              label: 'Erxes Collections',
              items: [
                {
                  type: 'link',
                  label: 'Collection Download', // The link label
                  href: 'https://github.com/erxes/erxes/releases'
                }
              ]
            }
          ]
        },
        {
          'Code reference': [
            {
              UI: [
                {
                  type: 'category',
                  label: 'Components',
                  link: {
                    type: 'generated-index'
                  },
                  items: [
                    'components/AnimatedLoader/animatedLoader',
                    'components/Attachment/attachment',
                    'components/AvatarUpload/avatarUpload',
                    'components/Box/box',
                    'components/BreadCrumb/breadcrumbs',
                    'components/Button/buttons',
                    'components/Chip/chip',
                    'components/CollapseContent/collapsecontent',
                    'components/DatawithLoader/datawithloader',
                    'components/EmptyContent/emptycontent',
                    'components/EmptyState/emptystate',
                    'components/ErrorMsg/errormsg',
                    'components/FilePreview/filepreview',
                    'components/FilterableList/filterablelist',
                    'components/FilterByParams/filterbyparams',
                    'components/HeaderDescription/headerdescription',
                    'components/HelpPopOver/helppopover',
                    'components/Icon/icon',
                    'components/Info/info',
                    'components/Label/label',
                    'components/ModifiableList/modifiablelist',
                    'components/Namecard/namecard',
                    'components/ProgressBar/progressbar',
                    'components/SortHandler/sorthandler',
                    'components/Spinner/spinners',
                    'components/Steps/steps',
                    'components/SubMenu/submenu',
                    'components/Table/table',
                    'components/Tabs/tabs',
                    'components/Tag/tag',
                    'components/TextDivider/textdivider',
                    'components/TextInfo/textinfo',
                    'components/Timer/timer',
                    'components/Tip/tip',
                    'components/Toggle/toggle',
                    'components/Uploader/uploader'
                  ]
                }
              ],
              API: ['code-reference/api/common-functions']
            }
          ]
        }
      ]
    },
    {
      type: 'category',
      label: 'Contributing to open source',
      link: {
        type: 'doc',
        id: 'contribute/overview'
      },
      collapsed: true,
      items: [
        'contribute/contribute-to-codebase',
        'contribute/contribute-to-documentation',
        'contribute/documentation-style-guide'
      ]
    },
    {
      type: 'link',
      label: 'Erxes XOS user guide',
      href: 'https://docs.erxes.io/docs/user-guide/'
    },
    
  ],
  ...pluginTutorialSideBar,
  ...userGuideSidebar
};

module.exports = sideBar;
