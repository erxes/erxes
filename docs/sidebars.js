var pluginTutorialSideBar = require('./plugin.tutorial.sidebars');
var userGuideSidebar = require('./user.guide.sidebar');

// 'deployment/deployment

var sideBar = {
  docs: [
    {
      type: 'category',
      label: 'Getting started',
      link: {
        type: 'generated-index'
      },
      collapsed: true,
      items: ['intro', 'introduction/architecture', 'introduction/faq']
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
          label: 'Installation',
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
          items: ['deployment/deployment/deploymentDocker']
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
      items: ['developer/developing-plugins']
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
            'api/types',
            'api/inputTypes',
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
        }
      ]
    },
    {
      type: 'category',
      label: 'Contributing to open source',
      link: {
        type: 'generated-index'
      },
      collapsed: true,
      items: [
        'contribute/overview',
        'contribute/contribute-to-codebase',
        'contribute/contribute-to-documentation',
        'contribute/documentation-style-guide'
      ]
    },
    {
      type: 'category',
      label: 'Update & Migration',
      link: {
        type: 'generated-index'
      },
      collapsed: true,
      items: ['update/update', 'update/migration']
    },
    {
      type: 'category',
      label: 'Erxes XOS user guide',
      link: {
        type: 'generated-index'
      },
      collapsed: true,
      items: ['developer/erxes-xos-user-guide']
    }
  ],
  components: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: ['components/GettingStarted/introduction']
    },
    {
      type: 'category',
      label: 'Components',
      collapsed: false,
      items: [
        'components/AnimatedLoader/animatedLoader',
        'components/Attachment/attachment',
        'components/AvatarUpload/avatarUpload',
        'components/BreadCrumb/breadcrumbs',
        'components/Button/button',
        'components/Chip/chip',
        'components/DatawithLoader/datawithloader',
        'components/EmptyContent/emptycontent',
        'components/EmptyState/emptystate',
        'components/ErrorMsg/errormsg',
        'components/FilePreview/filepreview',
        'components/FilterByParams/filterbyparams',
        'components/HelpPopOver/helppopover',
        'components/Icon/icon',
        'components/Info/info',
        'components/Label/label',
        'components/ModalTrigger/modaltrigger',
        'components/Namecard/namecard',
        'components/Pagination/pagination',
        'components/ProgressBar/progressbar',
        'components/SortableList/sortablelist',
        'components/SortHandler/sorthandler',
        'components/Spinner/spinner',
        'components/SubMenu/submenu',
        'components/Table/table',
        'components/Tab/tab',
        'components/Tag/tag',
        'components/TextDivider/textdivider',
        'components/TextInfo/textinfo',
        'components/Tip/tip',
        'components/Toggle/toggle',
        'components/Uploader/uploader'
      ]
    },
    {
      type: 'category',
      label: 'Utilities',
      collapsed: false,
      items: [
        'utilities/Alert/alert',
        'utilities/Box/box',
        'utilities/CollapseContent/collapsecontent',
        'utilities/CountsByTag/countsbytag',
        'utilities/FilterableList/filterablelist',
        'utilities/Form/form',
        'utilities/HeaderDescription/headerdescription',
        'utilities/ModifiableList/modifiablelist',
        {
          Step: ['utilities/Step/Step/step', 'utilities/Step/Steps/steps']
        },
        'utilities/Timer/timer',
        'utilities/Rule/rule'
      ]
    },
    {
      type: 'category',
      label: 'Icons',
      collapsed: false,
      items: ['icons/usage', 'icons/icons']
    },
    {
      type: 'category',
      label: 'Styles',
      collapsed: false,
      items: [
        'styles/Color/color',
        'styles/Dimension/dimension',
        'styles/Typography/typography'
      ]
    }
  ],
  ...pluginTutorialSideBar,
  ...userGuideSidebar
};

module.exports = sideBar;
