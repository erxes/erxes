# Quick Start: Discord Bot + erxes Integration

This is a condensed guide to get your Discord bot integrated with erxes in under 30 minutes.

## Prerequisites Checklist

- [ ] erxes instance running with operation plugin enabled
- [ ] Discord account with server admin permissions
- [ ] Node.js 18+ installed
- [ ] A team created in erxes Operations module

## Step 1: Create erxes Automation (10 minutes)

### 1.1 Create Automation

1. Open erxes → **Automations**
2. Click **+ Create Automation**
3. Name: `Discord Ticket Integration`
4. Click **Create**

### 1.2 Add Incoming Webhook Trigger

1. Click **Add Trigger**
2. Select **Incoming Webhook**
3. Configure:
   - Endpoint: `discord-ticket`
   - Method: `POST`
   - Bearer Token: Generate and **save** (you'll need this)
   - HMAC Secret: Generate and **save** (you'll need this)
4. **Copy the full webhook URL** (looks like: `https://your-domain.com/automation/ABC123/discord-ticket`)

### 1.3 Add Create Triage Action

1. Click **Add Action** after the webhook trigger
2. Select **Create triage ticket**
3. Configure:
   - Name: `{{trigger.body.title}}`
   - Description: `Discord ticket from @{{trigger.body.discordUsername}}\n\n{{trigger.body.description}}`
   - Team: Select your team
   - Priority: `{{trigger.body.priority}}`
4. Click **Save**
5. Set automation status to **Active**

### 1.4 Save Your Configuration

Write down these values (you'll need them for Step 2):
```
Webhook URL: _____________________________________
Bearer Token: _____________________________________
HMAC Secret: _____________________________________
Team ID: _____________________________________
```

## Step 2: Create Discord Bot (10 minutes)

### 2.1 Register Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Name: `erxes Ticket Bot`
4. Go to **Bot** section
5. Click **Add Bot**
6. **Copy Bot Token** and save it
7. Enable these intents:
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### 2.2 Get Application ID

1. Go to **General Information** tab
2. **Copy Application ID** and save it

### 2.3 Invite Bot to Your Server

1. Go to **OAuth2** → **URL Generator**
2. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select permissions:
   - ✅ Send Messages
   - ✅ Use Slash Commands
   - ✅ Read Messages/View Channels
4. Copy the generated URL
5. Open in browser and invite to your server

## Step 3: Setup Bot Code (5 minutes)

### 3.1 Copy Example Bot

```bash
cd /home/user/erxes
cp -r discord-bot-example my-discord-bot
cd my-discord-bot
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Configure Environment

```bash
cp .env.example .env
nano .env  # or use your favorite editor
```

Fill in your values:
```env
DISCORD_BOT_TOKEN=your_bot_token_from_step_2.1
DISCORD_CLIENT_ID=your_application_id_from_step_2.2

ERXES_WEBHOOK_URL=your_webhook_url_from_step_1.4
ERXES_BEARER_TOKEN=your_bearer_token_from_step_1.4
ERXES_HMAC_SECRET=your_hmac_secret_from_step_1.4
```

### 3.4 Start the Bot

```bash
npm start
```

You should see:
```
✅ Bot is ready! Logged in as erxes Ticket Bot#1234
✅ Slash commands registered successfully!
```

## Step 4: Test It! (5 minutes)

### 4.1 In Discord

1. Go to your Discord server
2. Type `/ticket` in any channel
3. Fill out the form:
   - Title: "Test ticket"
   - Description: "This is a test"
   - Priority: "normal"
4. Click Submit

### 4.2 In Discord (You Should See)

```
✅ Ticket created successfully!

📝 Title: Test ticket
🟡 Priority: normal
🎫 Execution ID: 507f1f77bcf86cd799439011

Your ticket has been sent to the support team!
```

### 4.3 In erxes

1. Go to Operations → Triage
2. You should see a new ticket:
   - Name: "Test ticket"
   - Description: "Discord ticket from @yourname\n\nThis is a test"
   - Priority: 1 (Normal)
   - Number: Auto-generated (e.g., #42)

## Troubleshooting

### Issue: Bot not responding to /ticket

**Solution**: Restart the bot and wait 30 seconds for commands to register.

### Issue: "Webhook not found" error

**Check**:
- Is the automation **Active**?
- Is the webhook URL correct in `.env`?
- Does the URL match the automation ID?

### Issue: "Authentication failed" error

**Check**:
- Is the bearer token correct in `.env`?
- Is the HMAC secret correct in `.env`?
- Are there any extra spaces in the `.env` file?

### Issue: "Team ID is required" error

**Solution**: In the erxes automation action, select a specific team from the dropdown instead of using the placeholder.

## What's Next?

### Customize Priority Levels

Edit `discord-bot-example/index.js` to change priority mappings:
```javascript
const priorityMap = {
  'low': 0,
  'normal': 1,
  'high': 2,
  'urgent': 3,
};
```

### Add Team Assignment by Channel

Edit `discord-bot-example/index.js`:
```javascript
let teamId;
if (interaction.channelId === 'YOUR_TECH_CHANNEL_ID') {
  teamId = 'YOUR_TECH_TEAM_ID';
} else {
  teamId = 'YOUR_DEFAULT_TEAM_ID';
}

const ticketData = {
  // ... other fields
  teamId,
};
```

### Enable Notification Channel

Add to `.env`:
```env
NOTIFICATION_CHANNEL_ID=your_channel_id_here
```

The bot will post ticket confirmations to this channel.

### Deploy to Production

See `discord-bot-example/README.md` for:
- PM2 deployment
- Docker deployment
- systemd service setup

## Full Documentation

For advanced features and troubleshooting:
- [Complete Integration Guide](DISCORD_BOT_INTEGRATION_GUIDE.md)
- [Bot Code Documentation](discord-bot-example/README.md)

## Support

- [erxes Docs](https://erxes.io/docs)
- [erxes Discord](https://discord.com/invite/aaGzy3gQK5)
- [GitHub Issues](https://github.com/erxes/erxes/issues)

---

**Total Time**: ~30 minutes

**Result**: Working Discord bot that creates triage tickets in erxes!
