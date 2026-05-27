#!/usr/bin/env node
/**
 * .agents/bin/erxes-wish.mjs
 * Production-ready, interactive, robust CLI for erxes AI Native development.
 * Inspired by modern premium CLI experiences.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const AGENTS_DIR = path.join(REPO_ROOT, '.agents');

// ANSI Color helper functions for beautiful console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

const paint = (color, text) => `${colors[color] || ''}${text}${colors.reset}`;

function showHelp() {
  console.log(`
${paint('cyan', paint('bright', 'erxes AI Native Development CLI'))}
${paint('dim', 'The production-ready orchestrator for developer wishes')}

${paint('bright', 'Usage:')}
  pnpm erxes-wish [wish text] [options]

${paint('bright', 'Options:')}
  --plugin [name]  Bootstrap a fresh new plugin dynamically (interactive walkthrough)
  --settings       Force the action to be a post-scaffold settings build (spawns sub-agents)
  --fix            Force the action to be a bug fix / repair request
  --skill <name>   Force a specific skill playbook (e.g., 'add-deal-field')
  --interactive    Force interactive walkthrough mode
  --help, -h       Show this beautiful help message

${paint('bright', 'Examples:')}
  pnpm erxes-wish --plugin loyalty
  pnpm erxes-wish --settings "storebranch settings page is empty"
  pnpm erxes-wish "fix the deal color calculation in sales"
  pnpm erxes-wish "add confidenceScore to deals" --skill add-deal-field
  pnpm erxes-wish --interactive
`);
}

let activeRl = null;
function askQuestion(query) {
  if (!activeRl) {
    activeRl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }
  return new Promise((resolve) => activeRl.question(query, (ans) => {
    resolve(ans.trim());
  }));
}

function closeRl() {
  if (activeRl) {
    activeRl.close();
    activeRl = null;
  }
}

function detectFixAction(wishText) {
  const lower = wishText.toLowerCase();
  // Word-boundary matching to prevent false positives (e.g. 'tissue' matching 'issue').
  // Removed ambiguous keywords: 'correct', 'prevent', 'solve', 'resolve' — these are
  // often used in feature wishes ("add correction validation", "prevent duplicates").
  const fixKeywords = ['fix', 'bug', 'issue', 'error', 'broken', 'fail', 'crash', 'repair', 'patch', 'regression', 'doesn\'t work', 'not working', 'wrong'];
  return fixKeywords.some(kw => {
    const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    return regex.test(lower);
  });
}

function detectSettingsAction(wishText) {
  const lower = wishText.toLowerCase();
  const settingsKeywords = [
    'settings empty', 'settings page empty', 'stub settings',
    'wire buttons', 'wire crud', 'dead button',
    'build settings', 'populate settings', 'post-scaffold settings',
    'add button does nothing', 'button does nothing',
    'settings page is empty', 'empty settings'
  ];
  return settingsKeywords.some(kw => lower.includes(kw));
}

function detectOccupiedPorts() {
  const backendPorts = [];
  const frontendPorts = [];

  const backendPluginsDir = path.join(REPO_ROOT, 'backend/plugins');
  if (fs.existsSync(backendPluginsDir)) {
    const dirs = fs.readdirSync(backendPluginsDir);
    for (const d of dirs) {
      const mainPath = path.join(backendPluginsDir, d, 'src/main.ts');
      if (fs.existsSync(mainPath)) {
        const content = fs.readFileSync(mainPath, 'utf8');
        const match = content.match(/port:\s*(\d+)/);
        if (match) {
          backendPorts.push({ plugin: d, port: parseInt(match[1], 10) });
        }
      }
    }
  }

  const frontendPluginsDir = path.join(REPO_ROOT, 'frontend/plugins');
  if (fs.existsSync(frontendPluginsDir)) {
    const dirs = fs.readdirSync(frontendPluginsDir);
    for (const d of dirs) {
      const projectJsonPath = path.join(frontendPluginsDir, d, 'project.json');
      if (fs.existsSync(projectJsonPath)) {
        try {
          const content = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8'));
          const port = content.targets?.serve?.options?.port || content.targets?.build?.options?.port;
          if (port) {
            frontendPorts.push({ plugin: d, port: parseInt(port, 10) });
          }
        } catch (e) {
          // ignore parsing error
        }
      }
    }
  }

  // Sort by port number
  backendPorts.sort((a, b) => a.port - b.port);
  frontendPorts.sort((a, b) => a.port - b.port);

  return { backendPorts, frontendPorts };
}

async function runPluginWizard(pluginName) {
  console.log(`\n${paint('cyan', paint('bright', '=== erxes AI Native Plugin Generator ==='))}`);
  console.log(`${paint('dim', 'Bootstrapping a fresh plugin using the create-plugin.md playbook...\n')}`);

  let name = pluginName;
  if (!name) {
    name = await askQuestion(`${paint('bright', 'What is the name of your new plugin? (e.g., booking, loyalty, crm): ')}`);
  }
  
  if (!name) {
    console.log(paint('red', 'Error: Plugin name cannot be empty.'));
    closeRl();
    process.exit(1);
  }

  // Sanitize the plugin name
  name = name.toLowerCase().replace(/[^a-z0-9_-]+/g, '');

  const description = await askQuestion(`${paint('bright', 'Briefly describe the purpose of this plugin: ')}`);
  const entity = await askQuestion(`${paint('bright', 'What is the primary entity/model name (singular)? (e.g., voucher, tour): ')}`);

  if (!entity) {
    console.log(paint('red', 'Error: Primary entity name cannot be empty.'));
    closeRl();
    process.exit(1);
  }

  console.log(`\n${paint('bright', 'Scanning workspace to prevent port collision...')}`);
  const portsInfo = detectOccupiedPorts();
  
  console.log(`\n${paint('yellow', '=== Occupied Backend Ports ===')}`);
  if (portsInfo.backendPorts.length > 0) {
    portsInfo.backendPorts.forEach(p => {
      console.log(`  - ${paint('bright', p.plugin.padEnd(20))} : port ${paint('green', p.port)}`);
    });
  } else {
    console.log('  None');
  }

  console.log(`\n${paint('yellow', '=== Occupied Frontend Ports ===')}`);
  if (portsInfo.frontendPorts.length > 0) {
    portsInfo.frontendPorts.forEach(p => {
      console.log(`  - ${paint('bright', p.plugin.padEnd(20))} : port ${paint('green', p.port)}`);
    });
  } else {
    console.log('  None');
  }

  const maxBackendPort = Math.max(...portsInfo.backendPorts.map(p => p.port), 3300);
  const nextBackendPort = maxBackendPort + 1;
  const maxFrontendPort = Math.max(...portsInfo.frontendPorts.map(p => p.port), 3000);
  const nextFrontendPort = maxFrontendPort + 1;

  console.log(`\n${paint('bright', 'Recommended Free Ports:')}`);
  console.log(`  - Backend API:       ${paint('cyan', nextBackendPort.toString())}`);
  console.log(`  - Frontend Dev:      ${paint('cyan', nextFrontendPort.toString())}`);

  console.log(`\n${paint('bright', 'Generating task specifications...')}`);
  
  const complexity = 'large';
  const wishId = `${new Date().toISOString().slice(0, 10)}-create-plugin-${name}`;
  const wishDir = path.join(AGENTS_DIR, 'wishes', wishId);
  
  if (!fs.existsSync(wishDir)) {
    fs.mkdirSync(wishDir, { recursive: true });
  }

  // Create WISH.md
  const templatePath = path.join(AGENTS_DIR, 'templates/WISH.md');
  let wishContent = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, 'utf8') : '';
  wishContent = wishContent.replace(/<one-line title>/g, `Create fresh plugin: ${name}`);
  wishContent = wishContent.replace(/YYYY-MM-DD/g, new Date().toISOString().slice(0, 10));
  wishContent = wishContent.replace(/captured/g, 'routed');
  wishContent = wishContent.replace(/<verbatim.*>/g, `Create fresh new plugin "${name}" with entity "${entity}"`);
  wishContent = wishContent.replace(/skills\/<plugin>.*\.md/g, `skills/create-plugin.md`);
  fs.writeFileSync(path.join(wishDir, 'WISH.md'), wishContent, 'utf8');

  // Compile plugin brief
  const brief = compilePluginBrief(name, description, entity, wishId, complexity, portsInfo, nextBackendPort, nextFrontendPort);
  
  const outputFilePath = path.join(AGENTS_DIR, `wishes/${wishId}/prompt_briefing.txt`);
  fs.writeFileSync(outputFilePath, brief, 'utf8');
  
  console.log(`\n${paint('green', '✓')} Scaffolding brief compiled successfully at:`);
  console.log(paint('underscore', `file://${outputFilePath}`));
  console.log(`\n${paint('bright', 'Copy/paste this briefing into your AI tool to scaffold the plugin!')}`);
  closeRl();
}

function compilePluginBrief(pluginName, description, entity, wishId, complexity, portsInfo, nextBackendPort, nextFrontendPort) {
  const readAgentFile = (filename) => {
    const p = path.join(AGENTS_DIR, filename);
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  };

  const constitution = readAgentFile('SYSTEM-PROMPT.md');
  const workflow = readAgentFile('WORKFLOW.md');
  const slopChecklist = readAgentFile('SLOP-CHECKLIST.md');
  const lessons = readAgentFile('memory/lessons.md');
  const pluginSkill = readAgentFile('skills/create-plugin.md');

  const backendList = portsInfo.backendPorts.map(p => `  - ${p.plugin}: port ${p.port}`).join('\n') || '  None';
  const frontendList = portsInfo.frontendPorts.map(p => `  - ${p.plugin}: port ${p.port}`).join('\n') || '  None';

  return `
=========================================
ERXES AI DEVELOPMENT BRIEFING (NEW PLUGIN CREATION)
=========================================

You are working in the erxes monorepo.
Your task is to implement the following fresh plugin using the strict .agents scaffolding skill.

-----------------------------------------
THE PLUGIN GENERATOR REQUEST
-----------------------------------------
Plugin Name: ${pluginName}
Description: ${description}
Primary Entity: ${entity}

-----------------------------------------
WORKSPACE PORT CONFLICT SCAN & RECS (STRICT RULE 11)
-----------------------------------------
Occupied Backend Ports:
${backendList}

Occupied Frontend Ports:
${frontendList}

Allocated Unique Ports for this Scaffolding (DO NOT COLLIDE):
  - Backend API Port:  ${nextBackendPort}
  - Frontend Dev Port: ${nextFrontendPort}

-----------------------------------------
DETECTED ROUTING
-----------------------------------------
Plugin Scope: ${pluginName}
Wish ID: ${wishId}
Complexity Rating: ${complexity.toUpperCase()}

=========================================
1. CONSTITUTION (SYSTEM-PROMPT)
=========================================
${constitution}

=========================================
2. 7-PHASE WORKFLOW
=========================================
${workflow}

=========================================
3. CODESTYLE & ANTI-SLOP CHECKLIST
=========================================
${slopChecklist}

=========================================
4. RECENT LESSONS & SCAR TISSUE
=========================================
${lessons}

=========================================
5. SPECIALIZED PLUGIN SCAFFOLDING SKILL (create-plugin.md)
=========================================
${pluginSkill}
`;
}

async function runInteractive() {
  console.log(`\n${paint('cyan', paint('bright', '=== erxes AI Native Interactive Setup ==='))}`);
  console.log(`${paint('dim', 'Initializing interactive session using skills/start.md playbooks...\n')}`);
  
  const wishText = await askQuestion(`${paint('bright', 'What feature or task would you like to build? ')}`);
  
  if (!wishText) {
    console.log(paint('red', 'Error: Wish text cannot be empty.'));
    closeRl();
    process.exit(1);
  }
  
  const plugin = detectPluginScope(wishText);
  console.log(`\n${paint('green', '✓')} Detected scope: ${paint('bright', plugin)}`);
  
  // Start.md Step 2: Confirming Logic (Strictly under 30 words)
  const query = `Confirming: Do you want to build "${wishText}" inside the "${plugin}" plugin? (y/n): `;
  const confirmation = await askQuestion(paint('cyan', query));
  
  if (confirmation.toLowerCase() !== 'y' && confirmation.toLowerCase() !== 'yes') {
    console.log(paint('yellow', '\nAborted. Let\'s try again.'));
    closeRl();
    process.exit(0);
  }
  
  // Rate complexity
  console.log(`\n${paint('bright', 'Analyzing codebase & sizing task...')}`);
  const complexity = rateComplexity(wishText, plugin);
  console.log(`Sizing Score: ${paint('bgYellow', paint('black', ` ${complexity.toUpperCase()} `))}`);
  
  // Create wish on disk
  const wishId = createWishOnDisk(wishText, plugin, complexity, isFix);
  
  // Print appropriate instruction
  if (complexity === 'large') {
    console.log(`\n${paint('cyan', paint('bright', 'Initializing Supervisor Architecture (Hierarchical Centralized Orchestration)'))}`);
    console.log(`${paint('dim', 'Spawning specialized subagents for Backend, Frontend, and QA...')}`);
  }
  
  const isFix = detectFixAction(wishText);
  const brief = compileBrief(wishText, plugin, wishId, complexity, isFix);
  
  const outputFilePath = path.join(AGENTS_DIR, `wishes/${wishId}/prompt_briefing.txt`);
  fs.writeFileSync(outputFilePath, brief, 'utf8');
  
  console.log(`\n${paint('green', '✓')} Briefing file compiled successfully at:`);
  console.log(paint('underscore', `file://${outputFilePath}`));
  console.log(`\n${paint('bright', 'Copy/paste this file into your AI tool to instantly start coding!')}`);
  closeRl();
}

function detectPluginScope(wishText) {
  const lowerWish = wishText.toLowerCase();
  const pluginKeywords = {
    frontline: ['ticket', 'conversation', 'inbox', 'frontline', 'channel', 'messenger', 'knowledgebase', 'knowledge base'],
    operation: ['task', 'timeline', 'operation', 'project', 'milestone'],
    accounting: ['accounting', 'journal', 'ledger', 'account balance', 'chart of accounts', 'fiscal'],
    content: ['content', 'cms', 'article', 'blog', 'page builder'],
    insurance: ['insurance', 'policy', 'claim', 'premium', 'underwriting'],
    loyalty: ['loyalty', 'voucher', 'reward', 'spin wheel', 'loyalty program', 'score log'],
    mongolian: ['ebarimt', 'khanbank', 'qpay', 'xyp', 'mongolian'],
    payment: ['payment', 'invoice', 'transaction', 'checkout', 'payment method'],
    posclient: ['posclient', 'pos client', 'pos terminal', 'receipt'],
    tourism: ['tourism', 'tour', 'booking', 'destination', 'travel package'],
    sales: ['deal', 'board', 'pipeline', 'stage', 'sales', 'kanban', 'pos', 'ecommerce']
  };

  // Check static keyword map first (non-sales plugins take priority)
  for (const [pluginName, keywords] of Object.entries(pluginKeywords)) {
    if (pluginName === 'sales') continue;
    if (keywords.some(kw => lowerWish.includes(kw))) {
      return pluginName;
    }
  }

  // Dynamic detection: scan backend/plugins/ for custom plugins not in the keyword map.
  // This catches plugins created via create-plugin.md (e.g., storebranch, booking).
  const backendPluginsDir = path.join(REPO_ROOT, 'backend/plugins');
  if (fs.existsSync(backendPluginsDir)) {
    const pluginDirs = fs.readdirSync(backendPluginsDir)
      .filter(d => d.endsWith('_api'))
      .map(d => d.replace(/_api$/, ''));
    for (const pluginName of pluginDirs) {
      if (pluginKeywords[pluginName]) continue; // already checked
      if (lowerWish.includes(pluginName)) {
        return pluginName;
      }
    }
  }

  // Fallback: check sales keywords last
  if (pluginKeywords.sales.some(kw => lowerWish.includes(kw))) {
    return 'sales';
  }
  return 'sales';
}

function rateComplexity(wishText, plugin, isSettings = false) {
  if (isSettings) return 'large'; // settings build always spawns sub-agents
  const lower = wishText.toLowerCase();
  if (lower.includes('field') || lower.includes('typo') || lower.includes('comment')) {
    return 'small';
  }
  if (lower.includes('trpc') || lower.includes('federation') || lower.includes('module federation') || lower.includes('integrate') || lower.includes('automation')) {
    return 'large';
  }
  // Auto-detect settings wishes even without --settings flag
  if (detectSettingsAction(wishText)) {
    return 'large';
  }
  return 'medium';
}

function createWishOnDisk(wishText, plugin, complexity, isFix = false) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const prefix = isFix ? 'fix-' : '';
  const slug = wishText.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30).replace(/-$/, '');
  const wishId = `${dateStr}-${prefix}${slug}`;
  const wishDir = path.join(AGENTS_DIR, 'wishes', wishId);
  
  if (!fs.existsSync(wishDir)) {
    fs.mkdirSync(wishDir, { recursive: true });
  }
  
  // Fill WISH.md from templates
  const templatePath = path.join(AGENTS_DIR, 'templates/WISH.md');
  let content = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, 'utf8') : '';
  
  content = content.replace(/<one-line title>/g, wishText);
  content = content.replace(/YYYY-MM-DD/g, dateStr);
  content = content.replace(/captured/g, 'routed');
  content = content.replace(/<verbatim.*>/g, wishText);
  
  // Route to the correct skill based on action type
  const isSettings = detectSettingsAction(wishText) || false;
  if (isFix) {
    content = content.replace(/skills\/\<plugin\>.*\.md/g, `skills/fix-issue.md`);
  } else if (isSettings) {
    content = content.replace(/skills\/\<plugin\>.*\.md/g, `skills/build-plugin-settings.md`);
  } else {
    content = content.replace(/skills\/\<plugin\>.*\.md/g, `skills/${plugin}/add-${plugin}-field.md`);
  }
  
  fs.writeFileSync(path.join(wishDir, 'WISH.md'), content, 'utf8');
  
  // For bug fixes, also scaffold BUG-SPEC.md from template
  if (isFix) {
    const bugSpecTemplate = path.join(AGENTS_DIR, 'templates/BUG-SPEC.md');
    if (fs.existsSync(bugSpecTemplate)) {
      let bugSpec = fs.readFileSync(bugSpecTemplate, 'utf8');
      bugSpec = bugSpec.replace(/<bug title>/g, wishText);
      fs.writeFileSync(path.join(wishDir, 'BUG-SPEC.md'), bugSpec, 'utf8');
    }
    
    const bugGroundTemplate = path.join(AGENTS_DIR, 'templates/BUG-GROUND.md');
    if (fs.existsSync(bugGroundTemplate)) {
      let bugGround = fs.readFileSync(bugGroundTemplate, 'utf8');
      bugGround = bugGround.replace(/<bug title>/g, wishText);
      fs.writeFileSync(path.join(wishDir, 'BUG-GROUND.md'), bugGround, 'utf8');
    }
  }
  
  return wishId;
}

function compileBrief(wishText, plugin, wishId, complexity, isFix, isSettings = false) {
  const readAgentFile = (filename) => {
    const p = path.join(AGENTS_DIR, filename);
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  };

  const constitution = readAgentFile('SYSTEM-PROMPT.md');
  const workflow = readAgentFile('WORKFLOW.md');
  const slopChecklist = readAgentFile('SLOP-CHECKLIST.md');
  const lessons = readAgentFile('memory/lessons.md');
  const masterSkill = readAgentFile('skills/start.md');
  const fixSkill = isFix ? readAgentFile('skills/fix-issue.md') : '';
  const settingsSkill = isSettings ? readAgentFile('skills/build-plugin-settings.md') : '';

  // Determine action description
  let actionDesc = 'implement the following customer-facing feature wish.';
  let actionType = 'CREATE / NEW FEATURE';
  let wishLabel = 'WISH';
  if (isFix) {
    actionDesc = 'FIX / RESOLVE the following plugin issue.';
    actionType = 'FIX / SELF-REPAIR';
    wishLabel = 'BUG REPORT / ISSUE';
  } else if (isSettings) {
    actionDesc = 'BUILD SETTINGS for the following scaffolded plugin. Use the Supervisor Model to spawn Backend + Frontend specialist sub-agents.';
    actionType = 'BUILD SETTINGS (POST-SCAFFOLD)';
    wishLabel = 'SETTINGS BUILD REQUEST';
  }

  // Build specialized skill section
  let specializedSection = '';
  if (isFix) {
    specializedSection = `
=========================================
6. SPECIALIZED BUG-FIXING PLAYBOOK (fix-issue.md)
=========================================
${fixSkill}
`;
  } else if (isSettings) {
    specializedSection = `
=========================================
6. SPECIALIZED SETTINGS BUILD PLAYBOOK (build-plugin-settings.md)
=========================================
This skill uses the SUPERVISOR MODEL — spawn 2 sub-agents:
  - Backend Specialist: review/harden scaffolded mutations, models, multi-tenancy
  - Frontend Specialist: build form component, wire Add/Edit/Delete buttons, populate Settings page

${settingsSkill}
`;
  }

  return `
=========================================
ERXES AI DEVELOPMENT BRIEFING
=========================================

You are working in the erxes monorepo.
Your task is to ${actionDesc}

-----------------------------------------
THE ${wishLabel}
-----------------------------------------
"${wishText}"

-----------------------------------------
DETECTED ROUTING
-----------------------------------------
Plugin Scope: ${plugin}
Action Type: ${actionType}
Wish ID: ${wishId}
Complexity Rating: ${complexity.toUpperCase()}

=========================================
1. CONSTITUTION (SYSTEM-PROMPT)
=========================================
${constitution}

=========================================
2. 7-PHASE WORKFLOW
=========================================
${workflow}

=========================================
3. CODESTYLE & ANTI-SLOP CHECKLIST
=========================================
${slopChecklist}

=========================================
4. RECENT LESSONS & SCAR TISSUE
=========================================
${lessons}

=========================================
5. MASTER ENTRYPOINT START PLAYBOOK
=========================================
${masterSkill}
${specializedSection}
`;
}

// CLI Logic
const args = process.argv.slice(2);
const hasPluginOption = args.includes('--plugin');
const hasSettingsOption = args.includes('--settings');
const forceInteractive = args.includes('--interactive');
const showHelpFlag = args.includes('--help') || args.includes('-h');

if (showHelpFlag) {
  showHelp();
  process.exit(0);
}

if (hasPluginOption) {
  const pluginOptionIndex = args.indexOf('--plugin');
  let specifiedPluginName = null;
  if (pluginOptionIndex !== -1 && pluginOptionIndex + 1 < args.length) {
    const nextArg = args[pluginOptionIndex + 1];
    if (!nextArg.startsWith('-')) {
      specifiedPluginName = nextArg;
    }
  }
  runPluginWizard(specifiedPluginName);
} else if (forceInteractive || args.length === 0) {
  runInteractive();
} else {
  // Classic non-interactive mode
  let wishText = '';
  let forcedSkill = null;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--skill') {
      forcedSkill = args[i + 1];
      i++;
    } else if (!args[i].startsWith('-')) {
      wishText = args[i];
    }
  }
  
  if (!wishText) {
    showHelp();
    process.exit(1);
  }
  
  const plugin = detectPluginScope(wishText);
  const isFix = args.includes('--fix') || detectFixAction(wishText);
  const isSettings = hasSettingsOption || (!isFix && detectSettingsAction(wishText));
  const complexity = rateComplexity(wishText, plugin, isSettings);
  const wishId = createWishOnDisk(wishText, plugin, complexity, isFix);
  const brief = compileBrief(wishText, plugin, wishId, complexity, isFix, isSettings);
  
  console.log(brief.trim());
}
