module.exports = {
  docs: [
    {
      type: "category",
      label: "Overview",
      items: [
        "overview/getting-started",
        "overview/overview",
        "overview/architecture-overview",
        "overview/deployment-overview",
        "overview/integrations-overview",
      ],
    },
    {
      type: "category",
      label: "Installation Guide",
      items: [
        {
          // https://v2.docusaurus.io/docs/docs-introduction/#sidebar-object
          Ubuntu: [
            "installation/ubuntu",
            {
              Installation: [
                "installation/ubuntu-quickstart",
                "installation/ubuntu-step-by-step",
                `installation/ubuntu-troubleshooting`,
              ],
            },
          ],
        },
        "installation/docker",
        "installation/upgrade",
      ],
    },

    {
      type: "category",
      label: "Administrator's Guide",
      items: [
        "administrator/creating-first-user",
        "administrator/environment-variables",
        "administrator/system-config",
        "administrator/migration",
      ],
    },
    {
      type: "category",
      label: "Developer's Guide",
      items: [
        "developer/developer",
        "developer/contributing",
        "developer/graphql-api",
        "developer/push-notifications",
        "developer/android-sdk",
        "developer/ios-sdk",
        "developer/troubleshooting",
        "developer/documentation_guide",
      ],
    },
  ],
  tutorials: [
    {
      type: "category",
      label: "User's Guide",
      items: [
        "user/subscription-getting-started",
        "user/initial-setup",
        "user/general-settings",
        "user/engage-phone-settings",
        "user/team-inbox",
        "user/knowledge-base",
        "user/popups",
        "user/script-install",
        "user/contacts",
        "user/segments",
        "user/sales-pipeline",
        "user/engage",
        "user/profile-settings",
        "user/notification",
        "user/mobile-apps",
        "user/import",
      ],
    },
  ],
};
