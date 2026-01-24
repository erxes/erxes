import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { ticketCommand, handleTicketModal } from './commands/ticket.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'DISCORD_BOT_TOKEN',
  'DISCORD_CLIENT_ID',
  'ERXES_WEBHOOK_URL',
  'ERXES_BEARER_TOKEN',
  'ERXES_HMAC_SECRET',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    console.error('Please check your .env file. See .env.example for reference.');
    process.exit(1);
  }
}

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

// Register slash commands
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

async function registerCommands() {
  try {
    console.log('🔄 Registering slash commands...');

    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: [ticketCommand] }
    );

    console.log('✅ Slash commands registered successfully!');
  } catch (error) {
    console.error('❌ Error registering slash commands:', error);
  }
}

// Event: Bot is ready
client.once('ready', async () => {
  console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);

  // Register slash commands
  await registerCommands();
});

// Event: Interaction (slash command or modal)
client.on('interactionCreate', async (interaction) => {
  try {
    // Handle slash command
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'ticket') {
        await handleTicketModal(interaction);
      }
    }

    // Handle modal submission
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'ticketModal') {
        await handleTicketSubmit(interaction);
      }
    }
  } catch (error) {
    console.error('Error handling interaction:', error);

    // Try to reply with error message
    const errorMessage = {
      content: '❌ An error occurred while processing your request. Please try again.',
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

// Import the submit handler after sendToErxes is available
import { sendToErxes } from './utils/sendToErxes.js';

async function handleTicketSubmit(interaction) {
  // Defer reply to show "thinking" state
  await interaction.deferReply({ ephemeral: true });

  // Get form data
  const title = interaction.fields.getTextInputValue('ticketTitle');
  const description = interaction.fields.getTextInputValue('ticketDescription');
  const priorityValue = interaction.fields.getTextInputValue('ticketPriority');

  // Parse priority
  const priorityMap = {
    'low': 0,
    'normal': 1,
    'high': 2,
    'urgent': 3,
  };
  const priority = priorityMap[priorityValue.toLowerCase()] ?? 1;

  // Prepare ticket data
  const ticketData = {
    title,
    description,
    priority,
    discordUserId: interaction.user.id,
    discordUsername: interaction.user.username,
    discordChannelId: interaction.channelId,
    // You can add teamId here or let erxes automation handle it
    // teamId: 'YOUR_DEFAULT_TEAM_ID',
  };

  try {
    // Send to erxes
    const response = await sendToErxes(ticketData);

    // Success response
    const priorityEmoji = ['🟢', '🟡', '🟠', '🔴'][priority];
    await interaction.editReply({
      content: `✅ **Ticket created successfully!**\n\n` +
        `📝 **Title:** ${title}\n` +
        `${priorityEmoji} **Priority:** ${priorityValue}\n` +
        `🎫 **Execution ID:** ${response.executionId}\n\n` +
        `Your ticket has been sent to the support team. They will get back to you soon!`,
      ephemeral: true,
    });

    // Optional: Send notification to a specific channel
    if (process.env.NOTIFICATION_CHANNEL_ID) {
      try {
        const channel = await client.channels.fetch(process.env.NOTIFICATION_CHANNEL_ID);
        if (channel.isTextBased()) {
          await channel.send(
            `🎟️ **New ticket created by <@${interaction.user.id}>**\n` +
            `📝 **Title:** ${title}\n` +
            `${priorityEmoji} **Priority:** ${priorityValue}\n` +
            `📅 **Time:** ${new Date().toLocaleString()}`
          );
        }
      } catch (err) {
        console.error('Failed to send notification:', err);
      }
    }
  } catch (error) {
    console.error('Failed to create ticket:', error);
    await interaction.editReply({
      content: `❌ **Failed to create ticket**\n\n` +
        `${error.message}\n\n` +
        `Please try again or contact an administrator.`,
      ephemeral: true,
    });
  }
}

// Login to Discord
client.login(process.env.DISCORD_BOT_TOKEN);
