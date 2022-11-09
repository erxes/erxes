// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'erxes Inc',
  tagline:
    'erxes is a free and open fair-code licensed all-in-one growth marketing and management tool for a smoother customer journey',
  url: 'https://www.erxes.org',
  baseUrl: '/',
  favicon: 'img/favicon.png',
  organizationName: 'erxes',
  projectName: 'erxes',
  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/erxes/erxes/edit/erxes-docs-blog/docs'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      })
    ]
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */

    ({
      navbar: {
        logo: {
          alt: 'erxes logo',
          src: 'img/logo_dark.svg'
        },
        items: [
          {
            href: 'https://erxes.io/resource-center',
            position: 'right',
            label: 'Resource center'
          },

          {
            label: 'Documentation',
            type: 'dropdown',
            position: 'right',
            items: [
              {
                label: 'Developer Docs',
                to: '/docs/intro',
                className: 'bold'
              },
              {
                label: 'Setup & Deployment',
                to: '/docs/category/setup--deployment/'
              },
              {
                label: 'Development resources',
                to: '/docs/category/developer-resources/'
              },
              {
                label: 'Contributing to open source',
                to: '/docs/contribute/overview/'
              },
              {
                label: 'User guide',
                to: '/docs/user-guide/',
                className: 'bold'
              },
              {
                label: 'XOS',
                to: '/docs/user-guide/xos/xos-intro/'
              },
              {
                label: 'Use cases',
                to: '/docs/user-guide/use-case/'
              }
            ]
          },

          {
            type: 'dropdown',
            label: 'Eco system',
            position: 'right',
            items: [
              {
                label: 'Erxes',
                to: '#',
                className: 'bold',
              },
              {
                label: 'Website',
                to: 'https://erxes.io/'
              },
              { label: 'Blog', to: 'https://erxes.io/blog' },
              { label: 'Roadmap', to: 'https://github.com/orgs/erxes/projects/11/views/18' },
              { label: 'Invest', to: 'https://erxes.io/invest' },
              { label: 'Market place', to: 'https://erxes.io/marketplace' },
              

              {
                label: 'Community',
                to: '#',
                className: 'bold'
              },

              {
                label: 'Discord',
                to: 'https://discord.gg/K3hfx6ShmU'
              },
              {
                label: 'Forum - not ready',
                to: '#'
              },
              {
                label: 'Show your use-case',
                to: 'https://erxes.io/showcase'
              },
              {
                label: 'Become a partner',
                to: 'https://erxes.io/partners'
              },

              { label: 'Resources', to: '#', className: 'bold' },
                
              { label: 'Use-cases', to: '/docs/user-guide/use-case/' },
            ]
          },

          {
            href: 'https://github.com/erxes/erxes',
            position: 'right',
            label: 'Star',
            className: 'github-button hide-mobile',
            'data-show-count': 'true',
            'data-size': 'large',
            'aria-label': 'Star erxes/erxes on GitHub'
          },
          {
            href: 'https://github.com/erxes/erxes',
            label: 'GitHub',
            position: 'right'
          }
        ]
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme
      }
    })
};

module.exports = config;
