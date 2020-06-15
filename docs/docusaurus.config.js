module.exports = {
  title: 'erxes',
  tagline: 'Documentation',
  url: 'https://www.erxes.org',
  baseUrl: '/',
  favicon: 'img/favicon.png',
  organizationName: 'erxes', // Usually your GitHub org/user name.
  projectName: 'erxes', // Usually your repo name.
  themeConfig: {
    googleAnalytics: {
      trackingID: 'UA-87254317-8',
    },
    algolia: {
      apiKey: '807b5401b0a7d39f4b0596cd989bba35',
      indexName: 'erxes',
      algoliaOptions: {},
    },
    sidebarCollapsible: true,
    image: 'img/erxes.png',
    navbar: {
      logo: {
        alt: 'erxes logo',
        src: 'img/logo_dark.svg',
        srcDark: 'img/logo.svg',
      },
      links: [
        {
          to: 'overview/getting-started/',
          activeBasePath: '',
          label: 'Documentation',
          position: 'right',
        },
        {
          href: 'https://github.com/erxes/erxes',
          label: 'GitHub',
          position: 'right'
        },
        {
          to: 'blog/',
          label: 'Blog',
          position: 'right'
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Style Guide',
              to: 'docs/',
            },
            {
              label: 'Second Doc',
              to: 'docs/doc2/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/erxes',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/ErxesHQ',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              href: 'https://erxes.io/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/erxes/erxes',
            },
          ],
        },
      ],
      logo: {
        alt: 'erxes Open Source Logo',
        src: 'img/logo.svg',
        href: 'https://erxes.io',
      },
      copyright: `Copyright © ${new Date().getFullYear()} erxes Inc.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // It is recommended to set document id as docs home page (`docs/` path).
          homePageId: '',
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '',
          editUrl: 'https://github.com/erxes/erxes/edit/develop/docs',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
