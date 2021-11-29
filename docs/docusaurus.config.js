module.exports = {
  title: "erxes Inc",
  tagline:
    "erxes is a free and open fair-code licensed all-in-one growth marketing and management tool for a smoother customer journey",
  url: "https://www.erxes.org",
  baseUrl: "/",
  favicon: "img/favicon.png",
  organizationName: "erxes", // Usually your GitHub org/user name.
  projectName: "erxes", // Usually your repo name.
  onBrokenLinks: "warn",
  themeConfig: {
    googleAnalytics: {
      trackingID: "UA-87254317-8",
    },
    algolia: {
      apiKey: "807b5401b0a7d39f4b0596cd989bba35",
      indexName: "erxes",
      algoliaOptions: {},
    },
    sidebarCollapsible: true,
    image: "img/erxes.png",
    navbar: {
      logo: {
        alt: "erxes logo",
        src: "img/logo_dark.svg",
        srcDark: "img/logo.svg",
      },
      items: [
        {
          to: "overview/deployment-overview",
          label: "Documentation",
          position: "left",
        },
        {
          to: "/user/subscription-getting-started",
          label: "User's guide",
          position: "left",
        },
        {
          to: "/invest",
          label: "Invest",
          position: "left",
        },
        {
          to: "/components/AnimatedLoader/animatedLoader",
          label: "Components",
          position: "left",
        },
        {
          href: "https://github.com/erxes/erxes",
          position: "right",
          label: "Star",
          className: "github-button hide-mobile",
          "data-show-count": "true",
          "data-size": "large",
          "aria-label": "Star erxes/erxes on GitHub",
        },
        {
          href: "https://github.com/erxes/erxes",
          label: "GitHub",
          position: "right",
        },
        {
          to: "blog/",
          label: "Blog",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Getting Started",
              to: "overview/deployment-overview",
            },
            {
              label: "Installation Guide",
              to: "/installation/docker/",
            },
            {
              label: "Administrator`s Guide",
              to: "/administrator/creating-first-user",
            },
            {
              label: "Developers Guide",
              to: "/developer/developer",
            },
          ],
        },
        {
          title: "Company",
          items: [
            {
              label: "About Us",
              href: "https://erxes.io/team",
            },
            {
              label: "Blog",
              href: "/blog",
            },
            {
              label: "Roadmap",
              href: "https://erxes.io/roadmap",
            },
            {
              label: "Install server",
              href: "http://localhost:3500/install",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Community Chat",
              href: "https://community.erxes.io/register/Gw4WRJnk9fSbyAXTq",
            },
            {
              label: "Facebook Group",
              href: "https://www.facebook.com/groups/erxescommunity",
            },
          ],
        },

        {
          title: "Support Us",
          items: [
            {
              label: "Back us on Github",
              href: "https://github.com/sponsors/erxes",
            },
          ],
        },
      ],
      logo: {
        alt: "erxes Open Source Logo",
        src: "img/logo.svg",
        href: "https://erxes.io",
      },
      copyright: `Copyright © ${new Date().getFullYear()} erxes Inc.`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          // It is recommended to set document id as docs home page (`docs/` path).
          // homePageId: '/', Deprecated
          sidebarPath: require.resolve("./sidebars.js"),
          routeBasePath: "/",
          editUrl: "https://github.com/erxes/erxes/edit/develop/docs",
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
