module.exports = {
  docs: [
    {
      type: 'category',
      label: '🚀 Getting started',
      link: {
        type: 'generated-index'
      },
      collapsed: true,
      items: ['intro', 'introduction/architecture', 'introduction/faq']
    },
    {
      type: 'category',
      label: '⚙️ Setup & Deployment',
      link: {
        type: 'generated-index'
      },
      collapsed: true,
      items: ['deployment/deployment']
    },
    {
      type: 'category',
      label: '📦 Plugins',
      link: {
        type: 'generated-index'
      },
      collapsed: true,
      items: ['plugins/plugin-installation']
    },
    {
      type: 'category',
      label: 'Configuration',
      link: {
        type: 'generated-index'
      },
      collapsed: true,
      items: [
        {
          "Administrator's Guide": [
            'administrator/creating-first-user',
            'administrator/environment-variables',
            'administrator/system-config',
            'administrator/migration'
          ]
        },
        {
          Integrations: [
            'integrations-overview/facebook',
            'integrations-overview/gmail',
            'integrations-overview/google-cloud-storage',
            'integrations-overview/aws-s3',
            'integrations-overview/aws-ses'
          ]
        },
        'developer/webhook',

        {
          'GraphQL API': [
            'api/introduction',
            'api/objects',
            'api/inputObjects',
            'api/enums',
            'api/scalars',
            'api/queries',
            'api/mutations'
          ]
        },
        'developer/push-notifications',
        'developer/script-install'
      ]
    },
    {
      type: 'category',
      label: '🛠️ Development',
      link: {
        type: 'generated-index'
      },
      collapsed: true,
      items: [
        {
          'XOS Installation': [
            { Docker: ['developer/ubuntu', 'developer/mac'] }
          ]
        },
        'developer/developing-plugins',
        'developer/upgrade',
        'developer/troubleshooting',
        {
          Changelog: [
            {
              type: 'link',
              label: 'Release Notes', // The link label
              href: 'https://github.com/erxes/erxes/releases' // The external URL
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
      label: 'Erxes XOS user guide',
      link: {
        type: 'generated-index'
      },
      collapsed: true,
      items: ['developer/erxes-xos-user-guide']
    }
  ]
};
