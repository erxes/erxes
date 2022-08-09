module.exports = {
  docs: [
    {
      type: 'category',
      label: '🚀 Getting started',
      items: [
        'introduction/introduction',
        'introduction/architecture',
        'introduction/faq',
        'overview/quickstart'
      ]
    },
    {
      type: 'category',
      label: '⚙️ Setup & Deployment',
      items: [
        {
          'Installation for Production': [
            'ubuntu/server',
            'ubuntu/ubuntu',
            'mac/mac'
          ]
        },
        {
          'XOS & Installation': [
            { Docker: ['developer/ubuntu', 'developer/mac'] }
          ]
        },
        {
          Configuration: ['integrations/configuration']
        },
        {
          Deployment: ['integrations/3rd-party-integration']
        }
      ]
    },
    {
      type: 'category',
      label: '📦 Plugins',
      items: ['contribute/plugin-Installation', 'contribute/integration']
    },
    {
      type: 'category',
      label: '🛠️ Development',
      items: [
        {
          Installation: [{ Docker: ['development/ubuntu', 'development/mac'] }]
        },
        'development/developing-plugins',
        'development/troubleshooting',
        'development/changelog'
      ]
    },
    {
      type: 'category',
      label: 'Contributing to open source',
      items: [
        'contribute/overview',
        'contribute/contribute-to-codebase',
        'contribute/contribute-to-documentation',
        'contribute/documentation-style-guide'
      ]
    },
    {
      type: 'category',
      label: 'Erxes XOS user guide',
      items: ['development/erxes-xos-user-guide']
    },
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        {
          'Deploying on server': [
            'overview/deployment-overview',
            {
              'Installation Guide': [
                {
                  Ubuntu: [
                    'installation/ubuntu',
                    {
                      Installation: [
                        'installation/ubuntu-quickstart',
                        'installation/ubuntu-step-by-step',
                        'installation/ubuntu-troubleshooting'
                      ]
                    }
                  ]
                },
                'installation/docker',
                'installation/upgrade'
              ]
            }
          ]
        },
        {
          'Contributing on open source': [
            'getting-started/contributing-guide',
            'getting-started/submitting',
            'getting-started/commit'
          ]
        }
      ]
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
  ]
};
