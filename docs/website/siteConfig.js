/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

// List of projects/orgs using your project for the users page.
const users = [
  {
    caption: 'User1',
    // You will need to prepend the image path with your baseUrl
    // if it is not '/', like: '/test-site/img/docusaurus.svg'.
    image: '/img/docusaurus.svg',
    infoLink: 'https://www.facebook.com',
    pinned: true,
    docsSideNavCollapsible: true,
    onPageNav: 'separate'
  }
];

const siteConfig = {
  title: 'erxes', // Title for your website.
  tagline: 'Documentation',
  url: 'https://docs.erxes.io', // Your website URL
  baseUrl: '/', // Base URL for your project */
  editUrl: 'https://github.com/erxes/erxes/edit/develop/docs/docs/',
  cname: 'docs.erxes.io',
  gaTrackingId: "UA-87254317-8",
  gaGtag: true,
  scrollToTop: true,
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: 'erxes',
  organizationName: 'erxes',
  algolia: {
    apiKey: '807b5401b0a7d39f4b0596cd989bba35',
    indexName: 'erxes',
    algoliaOptions: {} // Optional, if provided by Algolia
  },
  docsUrl: '',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    {
      doc: 'overview/getting-started',
      label: 'Docs'
    },
    {
      href: 'https://erxes.io/pricing',
      label: 'Pricing & Trial',
      external: true
    },
    { href: 'https://erxes.io/blog/', label: 'Blog', external: true },
    {
      href: 'https://github.com/erxes/erxes',
      label: 'GitHub',
      external: true
    },
  ],

  // If you have users set above, you add it here:
  users,

  /* path to images for header/footer */
  headerIcon: 'img/erxes.png',
  footerIcon: 'img/erxes.png',
  favicon: 'img/favicon.png',

  /* Colors for website */
  colors: {
    primaryColor: '#5629b6',
    secondaryColor: '#205C3B'
  },

  /* Custom fonts for website */
  /*
  fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },
  */

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} erxes Inc`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'default'
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ['https://buttons.github.io/buttons.js'],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,
  docsSideNavCollapsible: true,
  // Open Graph and Twitter card images.
  ogImage: 'img/erxes.png',
  twitterImage: 'img/erxes.png',

  // Show documentation's last contributor's name.
  enableUpdateBy: true,

  // Show documentation's last update time.
  enableUpdateTime: true,

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  //   repoUrl: 'https://github.com/facebook/test-site',
};

module.exports = siteConfig;
