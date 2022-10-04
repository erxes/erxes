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
          src: 'img/logo_dark.svg',
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
                href: '/docs/intro'
              },
              {
                label: 'User Guide',
                href: '/docs/user-guide'
              },
              {
                label: '└─ Get Started',
                to: '/docs/user-guide/get-started'
              },
              {
                label: '└─ Plugins',
                to: '/docs/category/plugins'
              },
              {
                label: '└─ Use Cases',
                to: '/docs/category/use-cases'
              }
            ]
          },

          {
            type: 'dropdown',
            label: 'Eco system',
            position: 'right',
            items: [
              { label: 'Erxes', to: '#' },
              {
                label: '└─ Website',
                to: 'https://erxes.io/'
              },
              { label: '└─ Blog', to: 'https://erxes.io/blog' },

              { label: 'Community', to: '#' },
              {
                label: '└─ Discord',
                to: 'https://discord.gg/K3hfx6ShmU'
              },
              {
                label: '└─ Forum - not ready',
                to: '#'
              },
              { label: 'Resources', to: '#' },
              {
                label: '└─ Tutorials',
                to: '/docs/plugin-tutorials/'
              }
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
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/deployment/#preparing-the-installation-1'
              },
              {
                label: 'Installation Guide',
                to: '/docs/developer/ubuntu'
              },
              {
                label: 'Administrator`s Guide',
                to: 'docs/administrator/creating-first-user'
              },
              {
                label: 'Developers Guide',
                to: '/docs/developer/developing-plugins'
              },
              {
                label: 'Graphql API reference',
                to: '/docs/api/objects'
              }
            ]
          },
          {
            title: 'Company',
            items: [
              {
                label: 'About Us',
                href: 'https://erxes.io/team'
              },
              {
                label: 'Blog',
                to: '/blog'
              },
              {
                label: 'Interviews',
                to: '/interviews'
              },
              {
                label: 'Case Studies',
                to: '/caseStudies'
              },
              {
                label: 'Roadmap',
                href: 'https://erxes.io/roadmap'
              },
              {
                label: 'GSoD',
                href: 'docs/gsod'
              }
            ]
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discussions',
                href: 'https://github.com/erxes/erxes/discussions '
              },
              {
                label: 'Discord',
                href: 'https://discord.gg/CEPj6vPh'
              }
            ]
          }
        ],
        logo: {
          alt: 'erxes Open Source Logo',
          src: 'img/logo.svg',
          href: 'https://erxes.io'
        },
        copyright: `Copyright © ${new Date().getFullYear()} erxes Inc.`
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme
      }
    })
};

module.exports = config;
