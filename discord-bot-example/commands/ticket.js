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
    .setTitle('Create Support Ticket');

  // Title input
  const titleInput = new TextInputBuilder()
    .setCustomId('ticketTitle')
    .setLabel('Ticket Title')
    .setPlaceholder('Brief description of the issue')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100);

  // Description input
  const descriptionInput = new TextInputBuilder()
    .setCustomId('ticketDescription')
    .setLabel('Detailed Description')
    .setPlaceholder('Provide as much detail as possible...')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000);

  // Priority input
  const priorityInput = new TextInputBuilder()
    .setCustomId('ticketPriority')
    .setLabel('Priority')
    .setPlaceholder('low, normal, high, or urgent')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setValue('normal')
    .setMaxLength(10);

  // Add inputs to action rows
  const titleRow = new ActionRowBuilder().addComponents(titleInput);
  const descriptionRow = new ActionRowBuilder().addComponents(descriptionInput);
  const priorityRow = new ActionRowBuilder().addComponents(priorityInput);

  // Add rows to modal
  modal.addComponents(titleRow, descriptionRow, priorityRow);

  // Show the modal
  await interaction.showModal(modal);
}
