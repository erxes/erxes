export const STEPS = [
  {
    title: 'Getting Started',
    key: 'setup',
    image: '/images/usingGuide.png'
  },
  {
    title: 'Learn more',
    key: 'documentation',
    image: '/images/documentation.svg'
  },
  {
    title: 'Using guide',
    key: 'usingGuide',
    image: '/images/guidebook.png'
  },
  {
    title: 'Join our community',
    key: 'community',
    image: '/images/community.png'
  }
];

export const SETUP = [
  {
    title: 'System configurations',
    icon: 'cog',
    content:
      '<ol><li><b>Go to the settings and find System Configurations</b></li><li><b>Access General Settings. From here configure:</b><ul style="list-style-type: disc;"><li>Language (choose from 34 languages available)</li><li>Currency</li><li>Team members who can access every branches and departments</li></ul></li><li><b>Go to the Theme and set up:</b><ul style="list-style-type: disc;"><li>Logo</li><li>Favicon</li><li>Background</li><li>Text color</li><li>Motto</li><li>Login page description</li></ul></li><li><b>Configure additional settings</b> that are essential for you to begin using erxes, such as Cloudflare, AWS SES, and more.</li></ol>',
    btnText: 'Go to the general setting',
    url: '/settings/general',
    action: 'generalSettingsCreate'
  },
  {
    title: 'Create a brand',
    icon: 'bolt-alt',
    content:
      '<ol><li><b>Go to the settings and find Brands</b></li><li><b>Click on ‘Add New Brand’ and fill out:</b><ul style="list-style-type: disc;"><li>Name of the brand</li><li>Description</li><li>Email address from you wish to send your transactional emails</li><li>Create your own custom email template or use the default template</li></ul></li></ol>',
    btnText: 'Go to the general setting',
    url: '/settings/brands#showBrandAddModal=true',
    action: 'brandCreate'
  },
  {
    title: 'Set up permissions',
    icon: 'lock',
    content:
      '<ol><li>Go to the settings and find Permissions</li><li>Click on ‘Create user group’ and fill out:<ul style="list-style-type: disc;"><li>Name</li><li>Description</li><li>Add team members to the user group</li></ul></li><li>Click on ‘New permission’ and you can :<ul style="list-style-type: disc;"><li>Choose specific features and choose what actions can be done</li><li>Choose a group and add team members who can access it</li><li>Check if permission is allowed</li></ul></li></ol>',
    btnText: 'Go to the general setting',
    url: '/settings/permissions',
    action: 'userGroupCreate'
  },
  {
    title: 'Set organization structure',
    icon: 'layer-group',
    content:
      '<ol><li>Go to the settings and find Structure</li><li>Create a branch</li><li>Create a department <ul style="list-style-type: disc;"><li>Choose the supervisor of the department </li><li>Add team members</li></ul></li><li>Create a unit<ul style="list-style-type: disc;"><li>Choose the supervisor of the department </li><li>Choose the respective department </li><li>Add team members</li></ul></li></ol><p>The requires field “CODE” can be anything that helps you distinguish each branch, department and unit. </p>',
    btnText: 'Go to the general setting',
    url: '/settings/structure',
    action: ''
  },
  {
    title: 'Invite team members',
    icon: 'user-plus',
    content:
      '<ol><li>Go to the settings and find Team Member</li><li>Click on ‘Invite team members’</li><li>Input the email and create a password</li><li>Set the permission for each team member</li><li>Assign into respective branch, department and unit</li></ol>',
    btnText: 'Go to the general setting',
    url: '/settings/team',
    action: 'userCreate'
  }
];

export const COMMUNITY = [
  {
    name: 'Github',
    link: 'https://github.com/erxes/erxes',
    icon: 'github-circled'
  },
  {
    name: 'Discord',
    link: 'https://discord.com/invite/aaGzy3gQK5',
    image: '/images/discord.png'
  },
  {
    name: 'Youtube',
    link: 'https://www.youtube.com/channel/UCunYU3kJiiDsXGfB068BbDA',
    icon: 'youtube-play'
  },
  { name: 'Figma', link: '', image: '/images/figma.png' },
  { name: 'Twitter', link: 'https://twitter.com/erxeshq', icon: 'twitter' },
  {
    name: 'Facebook',
    link: 'https://www.facebook.com/erxesHQ/',
    icon: 'facebook'
  },
  {
    name: 'Blog',
    link: 'https://erxes.io/blog',
    image: '/images/glyph_dark.png'
  }
];

export const DOCS = [
  {
    title: 'Documentation',
    desc: 'Resources for developers',
    url: 'https://docs.erxes.io',
    icon: 'copy-1'
  },
  {
    title: 'Help Center',
    desc: 'Find your answers to your issues and create tickets',
    url: 'https://help.erxes.io/',
    icon: 'info-circle'
  },
  {
    title: 'Invest',
    desc: 'Take part and invest in erxes',
    url: 'https://erxes.io/invest',
    icon: 'dollar-alt'
  },
  {
    title: 'Resource center',
    desc: 'Access all resources you looking for',
    url: 'https://erxes.io/resource-center',
    icon: 'folder-2'
  }
];

export const VIDEO = [
  {
    title: 'Notification',
    desc: 'How to configure notifications settings',
    icon: 'bell',
    url: 'https://www.youtube.com/embed/rK-lAt9bXtY?si=9h3sGgMaEbvlh4bx'
  },
  {
    title: 'Logs',
    desc: 'How to view activity logs',
    icon: 'file-blank',
    url: 'https://www.youtube.com/embed/AHOtbefxwaw?si=bqh-TV5OtLVWBezP'
  },
  {
    title: 'Email signatures',
    desc: 'How to create your email signature',
    icon: 'envelope',
    url: 'https://www.youtube.com/embed/Eg9D4r38aso?si=zKqRtmuZlWSgDVsJ'
  },
  {
    title: 'Import & Export',
    desc: 'How to import and export your data',
    icon: 'import',
    url: 'https://www.youtube.com/embed/llQfH8yGwh8?si=kmNJD0Q2AQ1oHr0D'
  },
  {
    title: 'Segments',
    desc: 'How to create segmentation',
    icon: 'chart-pie-alt',
    url: 'https://www.youtube.com/embed/uUe98rmz89c?si=k0I6Tc2JFX3jcxNc'
  },
  {
    title: 'Tags',
    desc: 'How to create tags and filter customers',
    icon: 'pricetag-alt',
    url: 'https://www.youtube.com/embed/5tGbsUsUiJ4?si=Nqqo71dZEDAqtVGr'
  },
  {
    title: 'Pop-ups & Forms',
    desc: 'How to create pop-ups and forms and how to use it',
    icon: 'file-alt',
    url: 'https://www.youtube.com/embed/7lz3mIbfIS4?si=IQa2C6cgIPgda-Ey'
  },
  {
    title: 'Script installation',
    desc:
      'How to install erxes messenger script code to integrate to your platform',
    icon: 'download-3',
    url: 'https://www.youtube.com/embed/Ky0IQ5UJ5xo?si=MxjHLtFmukLPTY5P'
  },
  {
    title: 'Integrations',
    desc: 'How to integrate external platforms to erxes',
    icon: 'puzzle-piece',
    url: 'https://www.youtube.com/embed/ZHdwkZSnkxU?si=wPUlu33bEBCep9xS'
  },
  {
    title: 'Sales pipeline',
    desc: 'How to create new sales board and pipeline',
    icon: 'subject',
    url: 'https://www.youtube.com/embed/yqc9l_1-qFA?si=HyHEnNRvpJ47rfX_'
  },
  {
    title: 'Team inbox',
    desc: 'How to centralize communication platforms in a single team inbox',
    icon: 'comments',
    url: 'https://www.youtube.com/embed/eVcqpG0zsiY?si=hIXflgXpE22kHbEb'
  },
  {
    title: 'Knowledge base',
    desc: 'How to create a knowledge base and add articles',
    icon: 'book-open',
    url: 'https://www.youtube.com/embed/r0s1aOUa0_c?si=rxmnkEMt771iRtVU'
  },
  {
    title: 'Email templates',
    desc: 'How to prepare email templates',
    icon: 'envelope-open',
    url: 'https://www.youtube.com/embed/dsmQl2mhT1Y?si=BTDDD-60aRo3CdBk'
  },
  {
    title: 'Response templates',
    desc: 'How to create response templates',
    icon: 'comment-alt-lines',
    url: 'https://www.youtube.com/embed/olfky0vuHmU?si=2BYdB2JT9_f681nd'
  }
];
