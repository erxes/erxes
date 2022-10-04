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
  ...pluginTutorialSideBar,
  ...userGuideSidebar
};

module.exports = sideBar;
