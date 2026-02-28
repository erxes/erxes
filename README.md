<br>

<p align="center">
 <img src="https://github.com/erxes/erxes/assets/1748857/53a70732-7385-475d-9cb5-efd0ec801db5" alt="erxes logo" width="20%" />
</p>

<p align="center">Experience Operating System (XOS) that unifies marketing, sales, operations, and support — run your core business seamlessly while replacing HubSpot, Zendesk, Linear, Wix and more.</p>

<p align="center">
  <a href="https://erxes.io/">Website</a>
  |
  <a href="https://erxes.io/invest">Invest</a>
  |
  <a href="https://erxes.io/docs/introduction">Docs</a>
  |
  <a href="https://erxes.io/roadmap">Roadmap</a>
  |
  <a href="https://erxes.io/changelog">Changelog</a>
  |
  <a href="https://discord.com/invite/aaGzy3gQK5">Discord</a>
  </p>
</p>

<p align="center">
   <a href="https://github.com/erxes/erxes/blob/master/LICENSE.md">
      <img alt="License Badge" src="https://img.shields.io/badge/license-AGPLv3-brightgreen">
  </a>
  <a href="#">
      <img alt="Docker Pulls" src="https://img.shields.io/docker/pulls/erxes/erxes">
  </a>
   <a href="https://explore.transifex.com/erxes-inc/erxesxos/">
      <img alt="Transfix" src="https://img.shields.io/badge/translations-contribute-brightgreen">
  </a>
  <a href="./CLAUDE.md">
      <img alt="AI Assistant Guide" src="https://img.shields.io/badge/docs-CLAUDE.md-blue">
  </a>
</p>

<p align="center">
  <strong>🚀 Nx Monorepo</strong> •
  <strong>🔌 Plugin Architecture</strong> •
  <strong>⚡ GraphQL Federation</strong> •
  <strong>🎨 Module Federation</strong> •
  <strong>🔒 Self-Hosted</strong>
</p>

<p align="center">
 <a href="https://erxes.io" target="_blank" rel="noopener noreferrer"><img src="https://imagedelivery.net/5m26Aj-CutMXPPNacMs_yQ/e2382b5d-cdbf-4365-7238-e79db8cb6000/public" width="100%" alt="erxes: the source available experience management infrastructure">
</a>
</p>


Achieving growth and unity within your company is possible with erxes, because it is: 



- **100% free & sustainable:** erxes offers a sustainable business model in which both developers and users win. It is the source available software, but even better.
- **100% customizable:** Our plugin-based architecture provides unlimited customization and lets you meet all your needs, no matter how specific they are.
- **100% privacy:** We've designed the erxes platform to retain complete control over your company's sensitive data with no third-party monitoring.
- **100% in control:** You can build any experience you want, where all the channels your business operates on are connected and integrated.



## What does erxes mean? How do you pronounce it?

erxes (pronounced 'erk-sis') is a Mongolian word meaning “galaxy”. A galaxy is a system of stars, stellar remnants, interstellar gas, dust, and dark matter bound together by gravity. The word is derived from the Greek galaxias (γαλαξίας), literally 'milky', a reference to the Milky Way galaxy that contains the Solar System. It is branded as “erxes” with all lowercase letters.

erxes - Improving everyday experiences can significantly enhance the quality of life. These small, incremental improvements can lead to substantial benefits and better living. Better living and happier people will have a contagious effect on everything they touch, eventually improving the universe. 

## What is erxes?
erxes is a secure, self-hosted, and scalable source available experience management infrastructure that enables SaaS providers and digital marketing agencies/developers to create unique experiences that work for all types of business.

## erxes Core & Plugins
erxes is composed of 2 main components: **Core** & **Plugins**

**Core:** It contains the core five modules which goes with all plugins - **My inbox**, **Contacts**, **Products**, **Segments**, **Automation**, **Documents**


**Plugins:** erxes comes with a set of plugins that allow you to create unique business experiences. Below is a list of some plugins you can choose from our **<a href="https://erxes.io/marketplace" >marketplace</a>** after you’ve finished installing erxes XOS:

- **erxes | Frontline** - Frontline powers your customer-facing teams in one place. Omnichannel conversations, tickets, tasks - all seamless.
- **erxes | Operation**  – Keep projects on track with tasks, team resources, and cycle management in one workspace.
- **erxes | Sales**  – Turn regular visitors into qualified leads by capturing them with a customizable landing page, forms, pop-up, or embed placements.
- **erxes | Content** - Publish anywhere with headless website, corporate sites, e-commerce, scheduling, knowledge base, and help center tools. ![EE License Only](https://img.shields.io/badge/license-EE%20Only-orange.svg)
- **erxes | Accounting** – Simplify finances with accounting and salary management built into your workflow. ![EE License Only](https://img.shields.io/badge/license-EE%20Only-orange.svg)
- **erxes | Tourism**  – Run tours and properties seamlessly with booking and management systems in one place. ![EE License Only](https://img.shields.io/badge/license-EE%20Only-orange.svg)
- **erxes | Property**  – Oversee real estate with stacking plans, financing & leasing, asset management, community, and investment platforms. ![EE License Only](https://img.shields.io/badge/license-EE%20Only-orange.svg)
- **erxes | Team**  – Empower people with directories, time clocks, chat, updates, training, and rewards. ![EE License Only](https://img.shields.io/badge/license-EE%20Only-orange.svg)
- **erxes | Finance**   – Power your bank and non-banking organization with e-banking, mobile apps, core banking, and scoring systems and many more. ![EE License Only](https://img.shields.io/badge/license-EE%20Only-orange.svg)

## Architecture Overview

erxes is built as an **Nx-powered monorepo** with a modern microservices architecture:

- **Backend**: GraphQL Federation + tRPC microservices (Node.js, TypeScript, MongoDB, Redis, BullMQ)
- **Frontend**: Module Federation micro-frontends (React 18, Rspack, TailwindCSS)
- **Apps**: Standalone applications (Next.js customer portal, POS client, widgets)

```
┌─────────────────────────────────────────┐
│    API Gateway (Port 4000)              │
│    Apollo Router + Service Discovery     │
└─────────────────────────────────────────┘
              │
    ┌─────────┼─────────┐
    ▼         ▼         ▼
┌─────────┐ ┌──────┐ ┌──────┐
│Core API │ │Plugin│ │Plugin│
│  (3300) │ │ APIs │ │ APIs │
└─────────┘ └──────┘ └──────┘
```

## Quick Start

### Prerequisites

- **Node.js** 18+
- **pnpm** ≥ 8 (required)
- **MongoDB** 27017
- **Redis** 6379

### Installation

```bash
# Clone the repository
git clone https://github.com/erxes/erxes.git
cd erxes

# Install dependencies (must use pnpm)
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env and configure MONGO_URL, REDIS_HOST, etc.

# Start core services (Gateway + Core API)
pnpm dev:core-api

# Or start all APIs
pnpm dev:apis

# Start all UI plugins (in another terminal)
pnpm dev:uis
```

Access the application at `http://localhost:3001`

### Development with Nx

```bash
# Run specific service
pnpm nx serve sales_api
pnpm nx serve sales_ui

# Build specific project
pnpm nx build core-api

# Run tests
pnpm nx test sales_api

# Run only affected projects (smart rebuilds)
pnpm nx affected:build
pnpm nx affected:test
```

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Backend** | Node.js, TypeScript 5.7, Express, Apollo Server v4, tRPC v11 |
| **Database** | MongoDB, Mongoose, Redis, Elasticsearch |
| **Frontend** | React 18, Rspack, Module Federation, TailwindCSS 4, Jotai |
| **Build** | Nx 20.0, pnpm 9.12, Docker |
| **Apps** | Next.js 14-16, PWA support |

## 📚 Documentation

- **[Official Documentation](https://erxes.io/docs/introduction)** - Complete guides and API references
- **[Local Setup Guide](https://erxes.io/docs/local-setup)** - Detailed installation requirements
- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive codebase guide for AI assistants and developers
- **[Contributing Guide](https://erxes.io/docs/contribute)** - How to contribute to erxes
- **[Roadmap](https://erxes.io/roadmap)** - What's coming next
- **[Changelog](https://erxes.io/changelog)** - Release notes and updates

### For AI Assistants & Advanced Developers

See **[CLAUDE.md](./CLAUDE.md)** for:
- Detailed architecture and plugin system documentation
- Development workflows and patterns
- Code conventions and best practices
- Testing strategies
- CI/CD pipeline details
- Multi-tenancy and service communication patterns

We recommend always using the latest version of erxes to start your new projects. Enjoy 🎉

## Creating Custom Plugins

erxes uses a powerful plugin architecture that allows you to extend functionality:

```bash
# Generate a new plugin (both backend and frontend)
pnpm create-plugin

# Follow the prompts to create your plugin
# Plugin name: inventory
# Module name: products

# Enable your plugin in .env
ENABLED_PLUGINS=operation,sales,frontline,inventory

# Start developing
pnpm nx serve inventory_api
pnpm nx serve inventory_ui
```

Each plugin includes:
- **Backend**: GraphQL schema, tRPC endpoints, business logic, database models
- **Frontend**: Module Federation remote, React components, routing
- **Auto-generated**: Nx configuration, Docker setup, boilerplate code

Learn more in **[CLAUDE.md - Plugin System](./CLAUDE.md#plugin-system)**

## Become a partner


Offer your expertise to the world and introduce your community to erxes. 
Let’s start growing together. Join our **<a href="https://discord.com/invite/aaGzy3gQK5">Discord</a>**.

## Contributing 

Please read our **<a href="https://erxes.io/docs/contribute" >contributing guide<a>** before submitting a Pull Request to the project.

## Community support

For general help using erxes, please refer to the erxes documentation. For additional help, you can use one of these channels to ask a question:

- **<a href="https://discord.com/invite/aaGzy3gQK5" > Discord</a>** For live discussion with the community
- **<a href="https://github.com/erxes/erxes" > GitHub</a>** Bug reports, contributions
- **<a href="https://github.com/erxes/erxes/issues" > Feedback section</a>** Roadmap, feature requests & bugs

## Stay updated instantly on social media


- **<a href="https://www.linkedin.com/company/15233488/admin/dashboard/" > LinkedIn</a>** 
- **<a href="https://www.facebook.com/erxesHQ" > Facebook</a>**
- **<a href="https://www.instagram.com/erxeshq" > Instagram</a>** 
- **<a href="https://twitter.com/erxesHQ" > Twitter</a>** 

 
## License
See the <a href="https://github.com/erxes/erxes/blob/master/LICENSE.md" >**LICENSE**</a> file for licensing information.

## ⚡ Quick Start (5 minutes)

docker compose up -d
open http://localhost:3000



