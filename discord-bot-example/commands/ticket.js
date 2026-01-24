import {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from 'discord.js';
import { sendToErxes } from '../utils/sendToErxes.js';

// Define the /ticket slash command
export const ticketCommand = new SlashCommandBuilder()
  .setName('ticket')
  .setDescription('Submit a support ticket to erxes')
  .toJSON();

// Handle the /ticket command by showing a modal
export async function handleTicketModal(interaction) {
  // Create the modal
  const modal = new ModalBuilder()
    .setCustomId('ticketModal')
    .setTitle('Submit Support Ticket');

  // Ticket title input
  const titleInput = new TextInputBuilder()
    .setCustomId('ticketTitle')
    .setLabel('Ticket Title')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Brief description of the issue')
    .setRequired(true)
    .setMaxLength(200);

  // Ticket description input
  const descriptionInput = new TextInputBuilder()
    .setCustomId('ticketDescription')
    .setLabel('Detailed Description')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Provide detailed information about your issue...')
    .setRequired(true)
    .setMaxLength(2000);

  // Priority input (using short text with options)
  const priorityInput = new TextInputBuilder()
    .setCustomId('priority')
    .setLabel('Priority (low, normal, high, urgent)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g., normal')
    .setRequired(false)
    .setValue('normal')
    .setMaxLength(10);

  // Add inputs to action rows
  const firstRow = new ActionRowBuilder().addComponents(titleInput);
  const secondRow = new ActionRowBuilder().addComponents(descriptionInput);
  const thirdRow = new ActionRowBuilder().addComponents(priorityInput);

  // Add rows to the modal
  modal.addComponents(firstRow, secondRow, thirdRow);

  // Show the modal to the user
  await interaction.showModal(modal);
}

// Handle modal submission
export async function handleTicketSubmission(interaction) {
  // Defer reply to give us time to process
  await interaction.deferReply({ ephemeral: true });

  try {
    // Extract form data
    const ticketTitle = interaction.fields.getTextInputValue('ticketTitle');
    const ticketDescription = interaction.fields.getTextInputValue('ticketDescription');
    const priorityInput = interaction.fields.getTextInputValue('priority') || 'normal';

    // Map priority text to number
    const priorityMap = {
      'low': 0,
      'normal': 1,
      'high': 2,
      'urgent': 3,
    };

    const priority = priorityMap[priorityInput.toLowerCase()] ?? 1; // Default to normal

    // Get user and channel information
    const userName = interaction.user.username;
    const userId = interaction.user.id;
    const channelName = interaction.channel?.name || 'DM';

    // Prepare payload for erxes webhook
    const ticketData = {
      userName,
      userId,
      ticketTitle,
      ticketDescription,
      priority,
      channelName,
      timestamp: new Date().toISOString(),
    };

    console.log(`[${new Date().toISOString()}] Ticket submitted by ${userName} (${userId})`);
    console.log(`Title: ${ticketTitle}`);
    console.log(`Priority: ${priorityInput} (${priority})`);

    // Send to erxes webhook
    const response = await sendToErxes(ticketData);

    console.log(`[${new Date().toISOString()}] ✅ Ticket sent to erxes successfully`);

    // Get priority label for display
    const priorityLabels = {
      0: 'Low',
      1: 'Normal',
      2: 'High',
      3: 'Urgent',
    };

    // Success response
    await interaction.editReply({
      content: `✅ **Ticket submitted successfully!**\n\n` +
               `**Title:** ${ticketTitle}\n` +
               `**Priority:** ${priorityLabels[priority]}\n` +
               `**Status:** Your ticket has been sent to our support team.\n\n` +
               `You will receive updates on your ticket soon. Thank you!`,
      ephemeral: true,
    });

    // Optional: Send notification to a specific channel
    if (process.env.NOTIFICATION_CHANNEL_ID) {
      try {
        const notificationChannel = await interaction.client.channels.fetch(
          process.env.NOTIFICATION_CHANNEL_ID
        );

        if (notificationChannel) {
          await notificationChannel.send({
            embeds: [{
              title: '🎫 New Support Ticket',
              description: `**${ticketTitle}**`,
              fields: [
                { name: 'Submitted by', value: `<@${userId}>`, inline: true },
                { name: 'Priority', value: priorityLabels[priority], inline: true },
                { name: 'Channel', value: channelName, inline: true },
              ],
              color: priority >= 2 ? 0xff0000 : 0x00ff00, // Red for high/urgent, green for low/normal
              timestamp: new Date(),
            }]
          });
        }
      } catch (notifyError) {
        console.error('⚠️ Failed to send notification to channel:', notifyError.message);
        // Don't fail the ticket submission if notification fails
      }
    }

  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error processing ticket:`, error);

    // Error response
    await interaction.editReply({
      content: `❌ **Failed to submit ticket**\n\n` +
               `There was an error sending your ticket to our support system. ` +
               `Please try again later or contact an administrator.\n\n` +
               `**Error:** ${error.message}`,
      ephemeral: true,
    });
  }
}
