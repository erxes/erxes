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
- A team created in erxes Operations module

## Installation

1. Clone or copy this directory:
   ```bash
   cp -r discord-bot-example my-discord-bot
   cd my-discord-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your values:
   - `DISCORD_BOT_TOKEN` - From Discord Developer Portal
   - `DISCORD_CLIENT_ID` - From Discord Developer Portal
   - `ERXES_WEBHOOK_URL` - From erxes automation webhook
   - `ERXES_BEARER_TOKEN` - From erxes automation webhook security settings
   - `ERXES_HMAC_SECRET` - From erxes automation webhook security settings
   - `NOTIFICATION_CHANNEL_ID` (optional) - Discord channel ID for notifications

## Configuration

### Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to **Bot** section and create a bot
4. Copy the bot token
5. Enable these intents:
   - Server Members Intent
   - Message Content Intent
6. Go to **OAuth2** → **URL Generator**
7. Select scopes: `bot`, `applications.commands`
8. Select permissions: Send Messages, Use Slash Commands
9. Invite bot to your server

### erxes Automation Setup

See the main [Discord Bot Integration Guide](../DISCORD_BOT_INTEGRATION_GUIDE.md) for detailed instructions on setting up the erxes automation.

Quick summary:
1. Create automation in erxes
2. Add incoming webhook trigger
3. Configure security (Bearer token + HMAC secret)
4. Add "Create triage ticket" action
5. Copy webhook URL

## Usage

### Starting the Bot

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### Using the Bot in Discord

1. Type `/ticket` in any channel
2. Fill out the modal form:
   - **Title**: Brief description (required)
   - **Description**: Detailed explanation (required)
   - **Priority**: low, normal, high, or urgent (optional, default: normal)
3. Click Submit
4. Bot confirms ticket creation
5. Ticket appears in erxes Operations → Triage

## Project Structure

```
discord-bot-example/
├── commands/
│   └── ticket.js          # /ticket command and modal handler
├── utils/
│   └── sendToErxes.js     # Webhook sender with security
├── index.js               # Main bot entry point
├── package.json           # Dependencies
├── .env.example           # Environment variables template
└── README.md             # This file
```

## Security

This bot implements enterprise-grade security:

- **Bearer Token Authentication**: Validates authorized requests
- **HMAC-SHA256 Signatures**: Ensures payload integrity
- **Timestamp Verification**: Prevents replay attacks
- **Rate Limiting**: 100 requests/min per webhook
- **Input Validation**: Client and server-side validation
- **Secure Headers**: X-Content-Type-Options, X-Frame-Options, etc.

## Customization

### Custom Team Assignment

Edit `index.js` to assign tickets to different teams based on channel:

```javascript
const ticketData = {
  title,
  description,
  priority,
  teamId: getTeamIdByChannel(interaction.channelId),
  // ...
};

function getTeamIdByChannel(channelId) {
  const channelMap = {
    'TECH_CHANNEL_ID': 'TECH_TEAM_ID',
    'BILLING_CHANNEL_ID': 'BILLING_TEAM_ID',
  };
  return channelMap[channelId] || 'DEFAULT_TEAM_ID';
}
```

### Custom Priority Mapping

Edit `commands/ticket.js` to add more priority levels or change mappings:

```javascript
const priorityMap = {
  'low': 0,
  'normal': 1,
  'high': 2,
  'urgent': 3,
  'critical': 4,  // Add custom priority
};
```

### Custom Form Fields

Edit `commands/ticket.js` to add more fields to the modal:

```javascript
const categoryInput = new TextInputBuilder()
  .setCustomId('ticketCategory')
  .setLabel('Category')
  .setPlaceholder('technical, billing, general')
  .setStyle(TextInputStyle.Short)
  .setRequired(false);
```

## Troubleshooting

### Bot not responding to /ticket

**Solution**: Restart the bot to register commands:
```bash
npm start
```
Wait for "✅ Slash commands registered successfully!"

### "Webhook not found" error

**Solution**: Verify your `.env` settings:
- Check `ERXES_WEBHOOK_URL` is correct
- Ensure automation is Active in erxes
- Verify automation ID in URL

### "Authentication failed" error

**Solution**: Check security credentials:
- Verify `ERXES_BEARER_TOKEN` matches erxes
- Verify `ERXES_HMAC_SECRET` matches erxes
- Ensure no extra spaces in .env file

### "Invalid payload" error

**Solution**: Check the webhook schema in erxes:
- Ensure all required fields are being sent
- Verify field types match the schema
- Check for typos in field names

## Logging

The bot logs important events:

```
✅ Bot is ready! Logged in as MyBot#1234
✅ Slash commands registered successfully!
📤 Sending ticket to erxes: Login not working
✅ Ticket created successfully: {...}
```

Enable debug mode by adding to `.env`:
```env
DEBUG=true
```

## Monitoring

### Health Check

Check if bot is online:
```javascript
if (client.user) {
  console.log(`Bot is online: ${client.user.tag}`);
}
```

### Webhook Status

Test webhook manually:
```bash
curl -X POST https://your-erxes-domain.com/automation/AUTOMATION_ID/discord-ticket \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test ticket"}'
```

## Production Deployment

### Using PM2

1. Install PM2:
   ```bash
   npm install -g pm2
   ```

2. Start bot:
   ```bash
   pm2 start index.js --name erxes-discord-bot
   ```

3. Monitor:
   ```bash
   pm2 logs erxes-discord-bot
   pm2 monit
   ```

### Using Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
CMD ["node", "index.js"]
```

Build and run:
```bash
docker build -t erxes-discord-bot .
docker run -d --env-file .env erxes-discord-bot
```

### Using systemd

Create `/etc/systemd/system/erxes-discord-bot.service`:
```ini
[Unit]
Description=erxes Discord Ticket Bot
After=network.target

[Service]
Type=simple
User=nodejs
WorkingDirectory=/opt/erxes-discord-bot
ExecStart=/usr/bin/node index.js
Restart=always
EnvironmentFile=/opt/erxes-discord-bot/.env

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable erxes-discord-bot
sudo systemctl start erxes-discord-bot
```

## Contributing

Found a bug or want to add a feature? Open an issue or submit a pull request!

## License

MIT

## Support

- [erxes Documentation](https://erxes.io/docs)
- [erxes Discord](https://discord.com/invite/aaGzy3gQK5)
- [GitHub Issues](https://github.com/erxes/erxes/issues)

---

Made with ❤️ by the erxes team
