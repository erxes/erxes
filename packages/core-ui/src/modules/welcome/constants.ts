export const STEPS = [
  {
    title: "Getting Started",
    key: "setup",
    image: "/images/usingGuide.png"
  },
  {
    title: "Learn more",
    key: "documentation",
    image: "/images/documentation.svg"
  },
  {
    title: "Using guide",
    key: "usingGuide",
    image: "/images/guidebook.png"
  },
  {
    title: "Join our community",
    key: "community",
    image: "/images/community.png"
  }
];

export const SETUP = [
  {
    title: "System configurations",
    icon: "cog",
    content:
      '<ol><li><b>Go to the settings and find System Configurations</b></li><li><b>Access General Settings. From here configure:</b><ul style="list-style-type: disc;"><li>Language (choose from 34 languages available)</li><li>Currency</li><li>Team members who can access every branches and departments</li></ul></li><li><b>Go to the Theme and set up:</b><ul style="list-style-type: disc;"><li>Logo</li><li>Favicon</li><li>Background</li><li>Text color</li><li>Motto</li><li>Login page description</li></ul></li><li><b>Configure additional settings</b> that are essential for you to begin using erxes, such as Cloudflare, AWS SES, and more.</li></ol>',
    btnText: "Go to the general setting",
    url: "/settings/general",
    action: "generalSettingsCreate"
  },
  {
    title: "Create a brand",
    icon: "bolt-alt",
    content:
      '<ol><li><b>Go to the settings and find Brands</b></li><li><b>Click on ‘Add New Brand’ and fill out:</b><ul style="list-style-type: disc;"><li>Name of the brand</li><li>Description</li><li>Email address from you wish to send your transactional emails</li><li>Create your own custom email template or use the default template</li></ul></li></ol>',
    btnText: "Go to the general setting",
    url: "/settings/brands#showBrandAddModal=true",
    action: "brandCreate"
  },
  {
    title: "Set up permissions",
    icon: "lock",
    content:
      '<ol><li>Go to the settings and find Permissions</li><li>Click on ‘Create user group’ and fill out:<ul style="list-style-type: disc;"><li>Name</li><li>Description</li><li>Add team members to the user group</li></ul></li><li>Click on ‘New permission’ and you can :<ul style="list-style-type: disc;"><li>Choose specific features and choose what actions can be done</li><li>Choose a group and add team members who can access it</li><li>Check if permission is allowed</li></ul></li></ol>',
    btnText: "Go to the general setting",
    url: "/settings/permissions",
    action: "userGroupCreate"
  },
  {
    title: "Set organization structure",
    icon: "layer-group",
    content:
      '<ol><li>Go to the settings and find Structure</li><li>Create a branch</li><li>Create a department <ul style="list-style-type: disc;"><li>Choose the supervisor of the department </li><li>Add team members</li></ul></li><li>Create a unit<ul style="list-style-type: disc;"><li>Choose the supervisor of the department </li><li>Choose the respective department </li><li>Add team members</li></ul></li></ol><p>The requires field “CODE” can be anything that helps you distinguish each branch, department and unit. </p>',
    btnText: "Go to the general setting",
    url: "/settings/structure",
    action: ""
  },
  {
    title: "Invite team members",
    icon: "user-plus",
    content:
      "<ol><li>Go to the settings and find Team Member</li><li>Click on ‘Invite team members’</li><li>Input the email and create a password</li><li>Set the permission for each team member</li><li>Assign into respective branch, department and unit</li></ol>",
    btnText: "Go to the general setting",
    url: "/settings/team",
    action: "userCreate"
  }
];

export const COMMUNITY = [
  {
    name: "Github",
    link: "https://github.com/erxes/erxes",
    icon: "github-circled"
  },
  {
    name: "Discord",
    link: "https://discord.com/invite/aaGzy3gQK5",
    image: "/images/discord.png"
  },
  {
    name: "Youtube",
    link: "https://www.youtube.com/channel/UCunYU3kJiiDsXGfB068BbDA",
    icon: "youtube-play"
  },
  { name: "Figma", link: "", image: "/images/figma.png" },
  { name: "Twitter", link: "https://twitter.com/erxeshq", icon: "twitter" },
  {
    name: "Facebook",
    link: "https://www.facebook.com/erxesHQ/",
    icon: "facebook"
  },
  {
    name: "whatsapp",
    link: "https://www.whatsapp.com/erxesHQ/",
    icon: "whatsapp"
  },
  {
    name: "Blog",
    link: "https://erxes.io/blog",
    image: "/images/glyph_dark.png"
  }
];

export const DOCS = [
  {
    title: "Documentation",
    desc: "Resources for developers",
    url: "https://docs.erxes.io",
    icon: "copy-1"
  },
  {
    title: "Help Center",
    desc: "Find your answers to your issues and create tickets",
    url: "https://help.erxes.io/",
    icon: "info-circle"
  },
  {
    title: "Invest",
    desc: "Take part and invest in erxes",
    url: "https://erxes.io/invest",
    icon: "dollar-alt"
  },
  {
    title: "Resource center",
    desc: "Access all resources you looking for",
    url: "https://erxes.io/resource-center",
    icon: "folder-2"
  }
];

export const VIDEO = [
  {
    title: "Notification",
    desc: "How to configure notifications settings",
    icon: "bell",
    url: "https://www.youtube.com/embed/rK-lAt9bXtY?si=9h3sGgMaEbvlh4bx"
  },
  {
    title: "Logs",
    desc: "How to view activity logs",
    icon: "file-blank",
    url: "https://www.youtube.com/embed/AHOtbefxwaw?si=bqh-TV5OtLVWBezP"
  },
  {
    title: "Email signatures",
    desc: "How to create your email signature",
    icon: "envelope",
    url: "https://www.youtube.com/embed/Eg9D4r38aso?si=zKqRtmuZlWSgDVsJ"
  },
  {
    title: "Import & Export",
    desc: "How to import and export your data",
    icon: "import",
    url: "https://www.youtube.com/embed/llQfH8yGwh8?si=kmNJD0Q2AQ1oHr0D"
  },
  {
    title: "Segments",
    desc: "How to create segmentation",
    icon: "chart-pie-alt",
    url: "https://www.youtube.com/embed/uUe98rmz89c?si=k0I6Tc2JFX3jcxNc"
  },
  {
    title: "Tags",
    desc: "How to create tags and filter customers",
    icon: "pricetag-alt",
    url: "https://www.youtube.com/embed/5tGbsUsUiJ4?si=Nqqo71dZEDAqtVGr"
  },
  {
    title: "Pop-ups & Forms",
    desc: "How to create pop-ups and forms and how to use it",
    icon: "file-alt",
    url: "https://www.youtube.com/embed/7lz3mIbfIS4?si=IQa2C6cgIPgda-Ey"
  },
  {
    title: "Script installation",
    desc: "How to install erxes messenger script code to integrate to your platform",
    icon: "download-3",
    url: "https://www.youtube.com/embed/Ky0IQ5UJ5xo?si=MxjHLtFmukLPTY5P"
  },
  {
    title: "Integrations",
    desc: "How to integrate external platforms to erxes",
    icon: "puzzle-piece",
    url: "https://www.youtube.com/embed/ZHdwkZSnkxU?si=wPUlu33bEBCep9xS"
  },
  {
    title: "Sales pipeline",
    desc: "How to create new sales board and pipeline",
    icon: "subject",
    url: "https://www.youtube.com/embed/yqc9l_1-qFA?si=HyHEnNRvpJ47rfX_"
  },
  {
    title: "Team inbox",
    desc: "How to centralize communication platforms in a single team inbox",
    icon: "comments",
    url: "https://www.youtube.com/embed/eVcqpG0zsiY?si=hIXflgXpE22kHbEb"
  },
  {
    title: "Knowledge base",
    desc: "How to create a knowledge base and add articles",
    icon: "book-open",
    url: "https://www.youtube.com/embed/r0s1aOUa0_c?si=rxmnkEMt771iRtVU"
  },
  {
    title: "Email templates",
    desc: "How to prepare email templates",
    icon: "envelope-open",
    url: "https://www.youtube.com/embed/dsmQl2mhT1Y?si=BTDDD-60aRo3CdBk"
  },
  {
    title: "Response templates",
    desc: "How to create response templates",
    icon: "comment-alt-lines",
    url: "https://www.youtube.com/embed/olfky0vuHmU?si=2BYdB2JT9_f681nd"
  }
];

export const Setups = [
  {
    id: 1,
    image: "/images/welcome/item-4.png",
    type: "general",
    title: "General configurations",
    desc: "Configure your settings and preferences for a customized experience."
  },
  {
    id: 2,
    image: "/images/welcome/item-2.png",
    type: "operational",
    title: "Operational Setup",
    desc: "Establish your digital workplace for efficient and streamlined operations."
  },
  {
    id: 3,
    image: "/images/welcome/item-3.png",
    title: "Set up permissions",
    desc: "Set up Insight to gain valuable data and analytics for informed decisions.",
    totalStep: 2,
    comingSoon: true
  }
];

export const Learn = [
  {
    id: 1,
    image: "/images/welcome/icons/1.png",
    title: "User Documentation",
    desc: "Get started in no time",
    url: "https://docs.erxes.io"
  },
  {
    id: 2,
    image: "/images/welcome/icons/2.png",
    title: "Plugin",
    desc: "Find complete information about plugins",
    url: "https://erxes.io/marketplace"
  },
  {
    id: 3,
    image: "/images/welcome/icons/3.png",
    title: "Blog",
    desc: "Stay up-to-do-date on all the latest devlopments",
    url: "https://erxes.io/resources/blog"
  }
];

export const Community = [
  {
    id: 1,
    image: "/images/welcome/icons/discord.png",
    title: "Discord",
    desc: "Connect with erxes Community",
    url: "https://discord.com/invite/aaGzy3gQK5"
  },
  {
    id: 2,
    image: "/images/welcome/icons/github.png",
    title: "Github",
    desc: "Where everything happens",
    url: "https://github.com/erxes/erxes"
  },
  {
    id: 3,
    image: "/images/welcome/icons/twitter.png",
    title: "Twitter",
    desc: "Get the latest news",
    url: "https://x.com/erxeshq"
  }
];

export const GeneralTasks = [
  {
    id: 1,
    icon: "user-plus",
    title: "Invite Team Members",
    desc: "The team members will help you to invite your team members to join your organizations to work together effectively by working on the same database.",
    url: "/settings/team",
    action: "userCreate"
  },
  {
    id: 2,
    icon: "sitemap-1",
    title: "Establish Organizational Structures",
    desc: "Establishing organizational structures involves defining roles, responsibilities, and efficient decision-making within a company.",
    url: "/settings/structure",
    action: "EstablishOrganizationalStructure"
  },
  {
    id: 3,
    icon: "file-plus-alt",
    title: "Import Customer Data",
    desc: "The Contacts plugin is integral to inserting, tracking, and registering all connected data and to being able to categorize them for better use.",
    url: "/settings/import",
    action: "ImportCustomerData"
  },
  {
    id: 4,
    icon: "tag-alt",
    title: "Create Brand",
    desc: "Add unlimited Brands with unlimited support to further your growth and accelerate your business",
    url: "/settings/brands#showBrandAddModal=true",
    action: "brandCreate"
  },
  {
    id: 5,
    icon: "layers",
    title: "Create Channels",
    desc: "Channels are important to know how and where your team members are spread out.Manage your channels and stay at the top of your game",
    url: "/settings/channels#showChannelAddModal=true",
    action: "ChannelCreate"
  },
  {
    id: 6,
    icon: "graph-bar",
    title: "Create your Insight",
    desc: "Optimize sales and marketing with interactive dashboards. Easy to use, become a data wizard fast.",
    url: "/insight#addDashboard",
    action: "InsightCreate"
  }
];

export const MarketingTasks = [
  {
    id: 2,
    icon: "file-info-alt",
    title: "Create Email template",
    desc: "The email template plugin will help you to create your email templates for your needs.",
    url: "settings/email-templates",
    action: "emailTemplateCreate"
  },
  {
    id: 3,
    icon: "megaphone",
    title: "Launch Broadcast Campaigns",
    desc: "The campaign plugin allows the user to automatically send out Emails, Messages and SMS which will grow your brand.",
    url: "/campaigns/create",
    action: "setCampaignLive"
  },
  {
    id: 4,
    icon: "layer-group",
    title: "Design Popups & Forms with Builder",
    desc: "The Pop-ups & Forms plugin allows users to prepare simple to advanced-level forms and pop-ups for all aspects of your businesses.",
    url: "/forms/create",
    action: "formCreate"
  },
  {
    id: 5,
    icon: "monitor-1",
    title: "Set up Client Portal",
    desc: "Professionalize your web page to educate your customers and employees about company and your product and services.",
    url: "/settings/client-portal/form",
    action: "clientPortalSetup"
  },
  {
    id: 6,
    icon: "arrow-growth",
    title: "Create Segments",
    desc: "Create segments for your desired target groups and engage your contacts in ways that are meaningful to them.",
    url: "/segments/new?contentType=core:customer",
    action: "subSegmentCreate"
  },
  {
    id: 7,
    icon: "file-check-alt",
    title: "Configure Task Management",
    desc: "The Task Management plugin helps team members with the planning process of their projects for the day, week, month, and year.",
    url: "/task",
    action: "TaskPipelineConfigured"
  },
  {
    id: 8,
    icon: "comments",
    title: "Integrate Facebook Messenger",
    desc: "With Facebook, you can get your messages received in your erxes Team inbox and can reply directly from your inbox with your team members.",
    url: "/settings/integrations/createFacebook?kind=facebook-messenger",
    action: "facebookmessengerIntegrationCreated"
  },
  {
    id: 9,
    icon: "comment-alt-heart",
    title: "Integrate Facebook Post",
    desc: "With Facebook, you can get your messages received in your erxes Team inbox and can reply directly from your inbox with your team members.",
    url: "/settings/integrations/createFacebook?kind=facebook-post",
    action: "facebookpostIntegrationCreated"
  },
  {
    id: 10,
    icon: "instagram",
    title: "Integrate Instagram",
    desc: "With Instagram, you can get your messages received in your erxes Team inbox and can reply directly from your inbox with your team members.",
    url: "/settings/integrations/createInstagram?kind=instagram-post",
    action: "instagramIntegrationCreated"
  },
  {
    id: 11,
    icon: "book-open",
    title: "Build Knowledgebase",
    desc: "The knowledge base helps you to create solutions to common issues, product or feature documentation, FAQ`s and to address any issues.",
    url: "/knowledgeBase",
    action: "knowledgeBaseArticleCreate"
  }
];

export const SalesTasks = [
  {
    id: 1,
    icon: "piggy-bank",
    title: "Set up Sales Processes",
    desc: "The sales pipeline section helps team members with the process of receiving, managing, and resolving incoming sales deals.",
    url: "/deal",
    action: "DealsPipelineConfigured"
  },
  {
    id: 2,
    icon: "layer-group",
    title: "Design Popups & Forms with Builder",
    desc: "The Pop-ups & Forms plugin allows users to prepare simple to advanced-level forms and pop-ups for all aspects of your businesses.",
    url: "/forms/create",
    action: "formCreate"
  },
  {
    id: 3,
    icon: "document",
    title: "Organize Documents",
    desc: "Efficiently organize your office documents, encompassing contracts, job descriptions, and various business papers.",
    url: "/settings/documents",
    action: "documentTemplateCreate"
  },
  {
    id: 4,
    icon: "book-open",
    title: "Build Knowledgebase",
    desc: "The knowledge base helps you to create solutions to common issues, product or feature documentation, FAQ`s and to address any issues.",
    url: "/knowledgeBase",
    action: "knowledgeBaseArticleCreate"
  },
  {
    id: 5,
    icon: "monitor-1",
    title: "Set up Client Portal",
    desc: "Professionalize your web page to educate your customers and employees about company and your product and services.",
    url: "/settings/client-portal/form",
    action: "clientPortalSetup"
  },
  {
    id: 6,
    icon: "arrow-growth",
    title: "Create Segments",
    desc: "Create segments for your desired target groups and engage your contacts in ways that are meaningful to them.",
    url: "/segments/new?contentType=core:customer",
    action: "subSegmentCreate"
  },
  {
    id: 7,
    icon: "megaphone",
    title: "Launch Broadcast Campaigns",
    desc: "The campaign plugin allows the user to automatically send out Emails, Messages and SMS which will grow your brand.",
    url: "/campaigns/create",
    action: "setCampaignLive"
  },
  {
    id: 8,
    icon: "file-check-alt",
    title: "Configure Task Management",
    desc: "The Task Management plugin helps team members with the planning process of their projects for the day, week, month, and year.",
    url: "/task",
    action: "TaskPipelineConfigured"
  },
  {
    id: 9,
    icon: "ticket",
    title: "Set up Ticket Management",
    desc: "Organize your product and service-related inquiries. This will allow you to handle your tickets in a well-organized manner without losing track of information.",
    url: "/ticket",
    action: "TicketPipelineConfigured"
  }
];

export const FrontlineTasks = [
  {
    id: 1,
    icon: "envelope-shield",
    title: "Install erxes Messenger",
    desc: "Erxes Messenger connects you to your customers like never before with its powerful capability of having a real-time conversation from the places where they are.",
    url: "/settings/integrations/createMessenger?kind=messenger",
    action: "erxesMessagerConnect"
  },
  {
    id: 2,
    icon: "ticket",
    title: "Set up Ticket Management",
    desc: "Organize your product and service-related inquiries. This will allow you to handle your tickets in a well-organized manner without losing track of information.",
    url: "/ticket",
    action: "TicketPipelineConfigured"
  },
  {
    id: 3,
    icon: "comments",
    title: "Integrate Facebook Messenger",
    desc: "With Facebook, you can get your messages received in your erxes Team inbox and can reply directly from your inbox with your team members.",
    url: "/settings/integrations/createFacebook?kind=facebook-messenger",
    action: "facebookmessengerIntegrationCreated"
  },
  {
    id: 4,
    icon: "comment-alt-heart",
    title: "Integrate Facebook Post",
    desc: "With Facebook, you can get your messages received in your erxes Team inbox and can reply directly from your inbox with your team members.",
    url: "/settings/integrations/createFacebook?kind=facebook-post",
    action: "facebookpostIntegrationCreated"
  },
  {
    id: 5,
    icon: "envelope-add",
    title: "Connect IMAP",
    desc: "Where everything happens",
    url: "/settings/integrations#createImap",
    action: "imapIntegrationCreated"
  },
  {
    id: 6,
    icon: "instagram",
    title: "Integrate Instagram",
    desc: "With Instagram, you can get your messages received in your erxes Team inbox and can reply directly from your inbox with your team members.",
    url: "/settings/integrations/createInstagram?kind=instagram-post",
    action: "instagramIntegrationCreated"
  },
  {
    id: 7,
    icon: "phone-alt",
    title: "Create Call",
    desc: "Connect with erxes Community",
    url: "/calls",
    action: "callsIntegrationCreated"
  },
  {
    id: 10,
    icon: "layer-group",
    title: "Design Popups & Forms with Builder",
    desc: "The Pop-ups & Forms plugin allows users to prepare simple to advanced-level forms and pop-ups for all aspects of your businesses.",
    url: "/forms/create",
    action: "formCreate"
  },
  {
    id: 11,
    icon: "book-open",
    title: "Build Knowledgebase",
    desc: "The knowledge base helps you to create solutions to common issues, product or feature documentation, FAQ`s and to address any issues.",
    url: "/knowledgeBase",
    action: "knowledgeBaseArticleCreate"
  },
  {
    id: 12,
    icon: "monitor-1",
    title: "Set up Client Portal",
    desc: "Professionalize your web page to educate your customers and employees about company and your product and services.",
    url: "/settings/client-portal/form",
    action: "clientPortalSetup"
  },
  {
    id: 13,
    icon: "arrow-growth",
    title: "Create Segments",
    desc: "Create segments for your desired target groups and engage your contacts in ways that are meaningful to them.",
    url: "/segments/new?contentType=core:customer",
    action: "subSegmentCreate"
  },
  {
    id: 17,
    icon: "circular",
    title: "Implement Operational Automations",
    desc: "The automation plugin allows users to automate repetitive tasks by setting triggers and creating actions if the trigger conditions are met.",
    url: "/automations",
    action: "automationCreate"
  },
  {
    id: 18,
    icon: "megaphone",
    title: "Launch Broadcast Campaigns",
    desc: "The campaign plugin allows the user to automatically send out Emails, Messages and SMS which will grow your brand.",
    url: "/campaigns/create",
    action: "setCampaignLive"
  }
];

export const OperationTasks = [
  {
    id: 1,
    icon: "file-check-alt",
    title: "Configure Task Management",
    desc: "The Task Management plugin helps team members with the planning process of their projects for the day, week, month, and year.",
    url: "/task",
    action: "TaskPipelineConfigured"
  },
  {
    id: 2,
    icon: "ticket",
    title: "Set up Ticket Management",
    desc: "Organize your product and service-related inquiries. This will allow you to handle your tickets in a well-organized manner without losing track of information.",
    url: "/ticket",
    action: "TicketPipelineConfigured"
  },
  {
    id: 3,
    icon: "piggy-bank",
    title: "Set up Sales Processes",
    desc: "The sales pipeline section helps team members with the process of receiving, managing, and resolving incoming sales deals.",
    url: "/deal",
    action: "DealsPipelineConfigured"
  },
  {
    id: 4,
    icon: "book-open",
    title: "Build Knowledgebase",
    desc: "The knowledge base helps you to create solutions to common issues, product or feature documentation, FAQ`s and to address any issues.",
    url: "/knowledgeBase",
    action: "knowledgeBaseArticleCreate"
  },
  {
    id: 5,
    icon: "file-bookmark-alt",
    title: "Manage Files with the File Manager",
    desc: "Where everything happens",
    url: "/filemanager",
    action: "fileManagerFileCreate"
  },
  {
    id: 6,
    icon: "layer-group",
    title: "Design Popups & Forms with Builder",
    desc: "The Pop-ups & Forms plugin allows users to prepare simple to advanced-level forms and pop-ups for all aspects of your businesses.",
    url: "/forms/create",
    action: "formCreate"
  },
  {
    id: 7,
    icon: "monitor-1",
    title: "Set up Client Portal",
    desc: "Professionalize your web page to educate your customers and employees about company and your product and services.",
    url: "/settings/client-portal/form",
    action: "clientPortalSetup"
  },
  {
    id: 8,
    icon: "document",
    title: "Organize Documents",
    desc: "Efficiently organize your office documents, encompassing contracts, job descriptions, and various business papers.",
    url: "/settings/documents",
    action: "documentTemplateCreate"
  },
  {
    id: 9,
    icon: "arrow-growth",
    title: "Create Segments",
    desc: "Create segments for your desired target groups and engage your contacts in ways that are meaningful to them.",
    url: "/segments/new?contentType=core:customer",
    action: "subSegmentCreate"
  },
  {
    id: 11,
    icon: "circular",
    title: "Implement Operational Automations",
    desc: "The automation plugin allows users to automate repetitive tasks by setting triggers and creating actions if the trigger conditions are met.",
    url: "/automations",
    action: "automationCreate"
  },
  {
    id: 12,
    icon: "megaphone",
    title: "Launch Broadcast Campaigns",
    desc: "The campaign plugin allows the user to automatically send out Emails, Messages and SMS which will grow your brand.",
    url: "/campaigns/create",
    action: "setCampaignLive"
  }
];
