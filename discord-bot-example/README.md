# erxes Discord Ticket Bot

A Discord bot that allows users to submit support tickets directly from Discord, which are automatically created as triage tickets in erxes via webhook automation.

## Features

- ✅ Slash command `/ticket` for easy ticket submission
- ✅ Interactive modal form for ticket details
- ✅ Priority levels (Low, Normal, High, Urgent)
- ✅ Secure HMAC-SHA256 signature verification
- ✅ Automatic retry with exponential backoff
- ✅ Replay attack prevention with timestamps
- ✅ User-friendly error messages
- ✅ Optional Discord channel notifications
- ✅ Complete logging for debugging

## Prerequisites

- Node.js 18 or higher
- Discord account with server admin permissions
- erxes instance with operation plugin enabled
- erxes automation configured with incoming webhook

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and fill in your configuration:

```env
# Discord Bot Token from https://discord.com/developers/applications
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here

# erxes Webhook URL and credentials
ERXES_WEBHOOK_URL=https://your-erxes.com/automation/xxx/discord-ticket
ERXES_BEARER_TOKEN=your_bearer_token
ERXES_HMAC_SECRET=your_hmac_secret

# Optional: Channel ID for ticket notifications
# NOTIFICATION_CHANNEL_ID=123456789012345678
```

### 3. Run the Bot

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

You should see:

```
🚀 Starting erxes Discord Ticket Bot...
✅ Discord bot logged in as YourBot#1234
🔄 Registering slash commands...
✅ Slash commands registered successfully
```

## Usage

### Submit a Ticket

1. In your Discord server, type `/ticket`
2. Fill out the modal form:
   - **Ticket Title**: Brief description
   - **Detailed Description**: Full explanation of the issue
   - **Priority**: low, normal, high, or urgent
3. Click **Submit**
4. You'll receive a confirmation message

### View Tickets in erxes

1. Log in to erxes
2. Go to **Operations** → **Triage**
3. Your Discord ticket will appear with:
   - Title from Discord
   - Description with Discord context (username, channel, timestamp)
   - Assigned team
   - Priority level

## Project Structure

```
discord-bot-example/
├── index.js              # Main bot entry point
├── commands/
│   └── ticket.js         # Ticket slash command and modal handler
├── utils/
│   └── sendToErxes.js    # Webhook sender with HMAC security
├── package.json          # Dependencies
├── .env.example          # Environment variable template
└── README.md             # This file
```

## Configuration

### Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to **Bot** tab and create a bot
4. Copy the bot token to `.env`
5. Enable these intents under **Bot** → **Privileged Gateway Intents**:
   - Message Content Intent
   - Server Members Intent
6. Go to **OAuth2** → **URL Generator**
   - Scopes: `bot`, `applications.commands`
   - Permissions: Send Messages, Use Slash Commands
   - Copy the URL and invite bot to your server

### erxes Automation Setup

See the main [DISCORD_BOT_INTEGRATION_GUIDE.md](../DISCORD_BOT_INTEGRATION_GUIDE.md) for detailed instructions.

**Quick summary:**
1. Create automation in erxes
2. Add **Incoming Webhook** trigger
3. Configure endpoint as `discord-ticket`
4. Define webhook schema (userName, userId, ticketTitle, etc.)
5. Enable security (Bearer token + HMAC)
6. Add **Create Triage Ticket** action
7. Map webhook fields to triage fields
8. Copy webhook URL, bearer token, and HMAC secret to `.env`

## Security

This bot implements multiple security layers:

### 1. Bearer Token Authentication
- Every request includes `Authorization: Bearer <token>` header
- Validates the bot is authorized to call the webhook

### 2. HMAC Signature Verification
- Each request is signed with HMAC-SHA256
- Format: `HMAC(secret, "timestamp.payload")`
- Sent in `X-Erxes-Signature` header
- erxes verifies signature to ensure payload integrity

### 3. Timestamp-Based Replay Prevention
- Timestamp sent in `X-Erxes-Timestamp` header
- erxes rejects requests with timestamps older than 5 minutes
- Prevents replay attacks

### 4. Environment Variable Protection
- All secrets stored in `.env` (not committed to git)
- `.gitignore` includes `.env`

## Troubleshooting

### Bot doesn't respond to /ticket

**Solution:**
```bash
# Re-register commands
node index.js
```

### Webhook returns 401 Unauthorized

**Check:**
- `ERXES_BEARER_TOKEN` matches erxes automation config
- `ERXES_HMAC_SECRET` is correct
- System clock is synchronized (for timestamp validation)

### Webhook returns 400 Bad Request

**Check:**
- Webhook schema in erxes matches payload structure
- All required fields are sent
- Field types match (string vs number)

### Triage ticket not created in erxes

**Check:**
- `teamId` is valid in erxes
- Operation plugin is running
- Automation is active
- Review erxes logs: `docker logs erxes-automations`

### "No response from erxes server"

**Check:**
- `ERXES_WEBHOOK_URL` is correct and accessible
- erxes is running
- Network allows outbound connections to erxes

## Customization

### Add More Form Fields

Edit `commands/ticket.js`:

```javascript
const categoryInput = new TextInputBuilder()
  .setCustomId('category')
  .setLabel('Category')
  .setStyle(TextInputStyle.Short)
  .setPlaceholder('e.g., Technical, Billing')
  .setRequired(false);

const fourthRow = new ActionRowBuilder().addComponents(categoryInput);
modal.addComponents(firstRow, secondRow, thirdRow, fourthRow);
```

Update webhook payload:

```javascript
const ticketData = {
  // ... existing fields
  category: interaction.fields.getTextInputValue('category'),
};
```

Update erxes webhook schema to include `category` field.

### Change Priority Options

Edit `commands/ticket.js`:

```javascript
const priorityMap = {
  'trivial': 0,
  'low': 1,
  'medium': 2,
  'high': 3,
  'critical': 4,
};
```

### Enable Notification Channel

Set `NOTIFICATION_CHANNEL_ID` in `.env`:

```env
NOTIFICATION_CHANNEL_ID=123456789012345678
```

Get channel ID:
1. Enable Developer Mode in Discord settings
2. Right-click the channel → Copy ID

## Development

### Testing Locally

```bash
npm run dev
```

### Testing Webhook Manually

Use `curl`:

```bash
node -e "
const crypto = require('crypto');
const payload = JSON.stringify({
  userName: 'TestUser',
  userId: '123',
  ticketTitle: 'Test Ticket',
  ticketDescription: 'Testing webhook',
  priority: 1
});
const timestamp = Math.floor(Date.now() / 1000);
const signature = crypto.createHmac('sha256', 'YOUR_HMAC_SECRET')
  .update(\`\${timestamp}.\${payload}\`)
  .digest('hex');
console.log(\`curl -X POST 'YOUR_WEBHOOK_URL' -H 'Content-Type: application/json' -H 'Authorization: Bearer YOUR_BEARER_TOKEN' -H 'X-Erxes-Signature: sha256=\${signature}' -H 'X-Erxes-Timestamp: \${timestamp}' -d '\${payload}'\`);
"
```

## Logging

The bot logs all activities to console:

```
[2026-01-24T10:30:45.123Z] Ticket submitted by User#1234 (987654321)
Title: Cannot login to dashboard
Priority: high (2)
[Attempt 1/3] Sending webhook to erxes...
✅ Webhook sent successfully: { status: 'success', executionId: 'abc123' }
[2026-01-24T10:30:46.456Z] ✅ Ticket sent to erxes successfully
```

## License

MIT License - See LICENSE file for details

## Support

- **erxes Documentation**: https://erxes.io/docs
- **Discord.js Guide**: https://discordjs.guide
- **Issues**: Open an issue on the erxes GitHub repository

## Credits

Built with:
- [Discord.js](https://discord.js.org/) - Discord API library
- [Axios](https://axios-http.com/) - HTTP client
- [erxes](https://erxes.io/) - XOS platform
