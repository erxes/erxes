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
  
  black: '\x1b[3 black:m',
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
  --skill <name>   Force a specific skill playbook (e.g., 'add-deal-field')
  --interactive    Force interactive walkthrough mode
  --help, -h       Show this beautiful help message

${paint('bright', 'Examples:')}
  pnpm erxes-wish --plugin loyalty
  pnpm --silent erxes-wish "add riskLevel to deals"
  pnpm --silent erxes-wish "add confidenceScore to deals" --skill add-deal-field
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
  const brief = compilePluginBrief(name, description, entity, wishId, complexity);
  
  const outputFilePath = path.join(AGENTS_DIR, `wishes/${wishId}/prompt_briefing.txt`);
  fs.writeFileSync(outputFilePath, brief, 'utf8');
  
  console.log(`\n${paint('green', '✓')} Scaffolding brief compiled successfully at:`);
  console.log(paint('underscore', `file://${outputFilePath}`));
  console.log(`\n${paint('bright', 'Copy/paste this briefing into your AI tool to scaffold the plugin!')}`);
  closeRl();
}

function compilePluginBrief(pluginName, description, entity, wishId, complexity) {
  const readAgentFile = (filename) => {
    const p = path.join(AGENTS_DIR, filename);
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  };

  const constitution = readAgentFile('SYSTEM-PROMPT.md');
  const workflow = readAgentFile('WORKFLOW.md');
  const slopChecklist = readAgentFile('SLOP-CHECKLIST.md');
  const lessons = readAgentFile('memory/lessons.md');
  const pluginSkill = readAgentFile('skills/create-plugin.md');

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
  const wishId = createWishOnDisk(wishText, plugin, complexity);
  
  // Print appropriate instruction
  if (complexity === 'large') {
    console.log(`\n${paint('cyan', paint('bright', 'Initializing Supervisor Architecture (Hierarchical Centralized Orchestration)'))}`);
    console.log(`${paint('dim', 'Spawning specialized subagents for Backend, Frontend, and QA...')}`);
  }
  
  const brief = compileBrief(wishText, plugin, wishId, complexity);
  
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

  for (const [pluginName, keywords] of Object.entries(pluginKeywords)) {
    if (pluginName === 'sales') continue;
    if (keywords.some(kw => lowerWish.includes(kw))) {
      return pluginName;
    }
  }
  return 'sales';
}

function rateComplexity(wishText, plugin) {
  const lower = wishText.toLowerCase();
  if (lower.includes('field') || lower.includes('typo') || lower.includes('comment')) {
    return 'small';
  }
  if (lower.includes('trpc') || lower.includes('federation') || lower.includes('module federation') || lower.includes('integrate') || lower.includes('automation')) {
    return 'large';
  }
  return 'medium';
}

function createWishOnDisk(wishText, plugin, complexity) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const slug = wishText.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30).replace(/-$/, '');
  const wishId = `${dateStr}-${slug}`;
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
  content = content.replace(/skills\/<plugin>.*\.md/g, `skills/${plugin}/add-${plugin}-field.md`);
  
  fs.writeFileSync(path.join(wishDir, 'WISH.md'), content, 'utf8');
  return wishId;
}

function compileBrief(wishText, plugin, wishId, complexity) {
  const readAgentFile = (filename) => {
    const p = path.join(AGENTS_DIR, filename);
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  };

  const constitution = readAgentFile('SYSTEM-PROMPT.md');
  const workflow = readAgentFile('WORKFLOW.md');
  const slopChecklist = readAgentFile('SLOP-CHECKLIST.md');
  const lessons = readAgentFile('memory/lessons.md');
  const masterSkill = readAgentFile('skills/start.md');

  return `
=========================================
ERXES AI DEVELOPMENT BRIEFING
=========================================

You are working in the erxes monorepo.
Your task is to implement the following customer-facing feature wish.

-----------------------------------------
THE WISH
-----------------------------------------
"${wishText}"

-----------------------------------------
DETECTED ROUTING
-----------------------------------------
Plugin Scope: ${plugin}
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
`;
}

// CLI Logic
const args = process.argv.slice(2);
const hasPluginOption = args.includes('--plugin');
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
  const complexity = rateComplexity(wishText, plugin);
  const wishId = createWishOnDisk(wishText, plugin, complexity);
  const brief = compileBrief(wishText, plugin, wishId, complexity);
  
  console.log(brief.trim());
}
