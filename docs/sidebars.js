module.exports = {
  docs: [
    {
      type: "category",
      label: "Getting Started",
      items: [
        {
          "Deploying on server": [
            "overview/deployment-overview",
            {
              "Installation Guide": [
                {
                  Ubuntu: [
                    "installation/ubuntu",
                    {
                      Installation: [
                        "installation/ubuntu-quickstart",
                        "installation/ubuntu-step-by-step",
                        "installation/ubuntu-troubleshooting",
                      ],
                    },
                  ],
                },
                "installation/docker",
                "installation/upgrade",
              ],
            },
          ],
        },
        {
          "Contributing on open source": [
            "getting-started/contributing-guide",
            "getting-started/submitting",
            "getting-started/commit",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Overview",
      items: ["overview/overview", "overview/architecture-overview"],
    },
    {
      type: "category",
      label: "Developer's Guide",
      items: [
        "developer/developer",
        "developer/documentation_guide",
        {
          "Administrator's Guide": [
            "administrator/creating-first-user",
            "administrator/environment-variables",
            "administrator/system-config",
            "administrator/migration",
          ],
        },
        {
          Tutorials: [
            "developer/graphql-api",
            "developer/android-sdk",
            "developer/ios-sdk",
            "developer/push-notifications",
            "user/script-install",
          ],
        },
        {
          Integrations: [
            "developer/integrations-overview/facebook",
            "developer/integrations-overview/twitter",
            "developer/integrations-overview/gmail",
            "developer/integrations-overview/google-cloud-storage",
            "developer/integrations-overview/aws-s3",
            "developer/integrations-overview/aws-ses",
            "developer/integrations-overview/nylas-integrations",
            "developer/integrations-overview/whatsApp-integration",
            "developer/integrations-overview/sunshine-conversations",
          ],
        },
        "developer/troubleshooting",
      ],
    },
    {
      type: "category",
      label: "Changelog",
      items: [
        {
          type: "link",
          label: "Release Notes", // The link label
          href: "https://github.com/erxes/erxes/releases", // The external URL
        },
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
  components: [
    {
      type: "category",
      label: "Getting Started",
      collapsed: false,
      items: ["components/GettingStarted/introduction"],
    },
    {
      type: "category",
      label: "Components",
      collapsed: false,
      items: [
        "components/AnimatedLoader/animatedLoader",
        "components/Attachment/attachment",
        "components/AvatarUpload/avatarUpload",
        "components/BreadCrumb/breadcrumbs",
        "components/Button/buttons",
        "components/Chip/chip",
        "components/DatawithLoader/datawithloader",
        "components/EmptyContent/emptycontent",
        "components/EmptyState/emptystate",
        "components/ErrorMsg/errormsg",
        "components/FilePreview/filepreview",
        "components/Filter/filter",
        "components/FilterByParams/filterbyparams",
        "components/Form/form",
        "components/HelpPopOver/helppopover",
        "components/Info/info",
        "components/Label/label",
        "components/ModalTrigger/modaltrigger",
        "components/Namecard/namecard",
        "components/Pagination/pagination",
        "components/ProgressBar/progressbar",
        "components/SortableList/sortablelist",
        "components/SortHandler/sorthandler",
        "components/Spinner/spinners",
        "components/SubMenu/submenu",
        "components/Table/table",
        "components/Tabs/tabs",
        "components/Tag/tag",
        "components/TextDivider/textdivider",
        "components/TextInfo/textinfo",
        "components/Tip/tip",
        "components/Toggle/toggle",
        "components/Uploader/uploader",
      ],
    },
    {
      type: "category",
      label: "Utilities",
      collapsed: false,
      items: [
        "utilities/Alert/alert",
        "utilities/Box/box",
        "utilities/CollapseContent/collapsecontent",
        "utilities/CountsByTag/countsbytag",
        "utilities/FilterableList/filterablelist",
        "utilities/HeaderDescription/headerdescription",
        "utilities/ModifiableList/modifiablelist",
        {
          Step: ["utilities/Step/Step/step", "utilities/Step/Steps/steps"],
        },
        "utilities/Timer/timer",
        "utilities/Rule/rule",
      ],
      // items: ["utilities/Step/Step/step", "utilities/Steps/steps"],
    },
    {
      type: "category",
      label: "Icons",
      collapsed: false,
      items: [
        "icons/icons",
        "icons/IconComponent",
      ],
    },
    {
      type: "category",
      label: "Styles",
      collapsed: false,
      items: [
        "styles/Colors/colors",
        "styles/Dimensions/dimensions",
        "styles/Typography/typography",
      ],
    },
  ],
};
