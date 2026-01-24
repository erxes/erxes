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

1. Click **Add Trigger** → **Incoming Webhook**
2. Configure:
   - **Endpoint**: `discord-ticket`
   - **Method**: `POST`
3. **Add Schema Fields** (click + to add each):
   - `userName` → Type: String, Required: ✓
   - `userId` → Type: String, Required: ✓
   - `ticketTitle` → Type: String, Required: ✓
   - `ticketDescription` → Type: String, Required: ✓
   - `priority` → Type: Number
   - `channelName` → Type: String
   - `timestamp` → Type: String

### 1.3 Configure Security

1. Click **Security Settings** (toggle Enable Security)
2. **Bearer Token**: `discord-bot-token-123` (copy this!)
3. **HMAC Secret**: `hmac-secret-xyz-789` (copy this!)
4. ✓ **Prevent Replay Attacks**
5. Click **Save**

### 1.4 Copy Webhook URL

After saving, copy the webhook URL:
```
https://your-erxes.com/automation/[ID]/discord-ticket
```

### 1.5 Add Create Triage Action

1. Click **Add Action** → **Operation** → **Create triage ticket**
2. **Map fields**:
   - **Name**: `{{ ticketTitle }}`
   - **Description**:
     ```
     Discord Ticket from @{{ userName }} ({{ userId }})
     Channel: {{ channelName }}
     Submitted: {{ timestamp }}

     {{ ticketDescription }}
     ```
   - **Team**: Select your team from dropdown
   - **Priority**: `{{ priority }}`
3. Click **Save**
4. **Activate** the automation (toggle to Active)

✅ **Save these values for next step:**
- Webhook URL
- Bearer Token
- HMAC Secret

---

## Step 2: Create Discord Bot (10 minutes)

### 2.1 Create Discord Application

1. Go to https://discord.com/developers/applications
2. Click **New Application**
3. Name: `erxes Ticket Bot`
4. Click **Create**

### 2.2 Create Bot User

1. Click **Bot** in sidebar
2. Click **Add Bot** → Confirm
3. **Copy Bot Token** (click Reset Token if needed)
4. Under **Privileged Gateway Intents**, enable:
   - ✓ Message Content Intent
5. Click **Save Changes**

### 2.3 Get Application ID

1. Click **General Information** in sidebar
2. **Copy Application ID**

### 2.4 Invite Bot to Server

1. Click **OAuth2** → **URL Generator**
2. Select **Scopes**:
   - ✓ bot
   - ✓ applications.commands
3. Select **Bot Permissions**:
   - ✓ Send Messages
   - ✓ Use Slash Commands
4. **Copy** the generated URL
5. Open URL in browser
6. Select your server → **Authorize**

✅ **Save these values:**
- Bot Token
- Application ID

---

## Step 3: Setup Discord Bot Code (10 minutes)

### 3.1 Navigate to Bot Directory

```bash
cd discord-bot-example
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# From Step 2
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_application_id_here

# From Step 1
ERXES_WEBHOOK_URL=https://your-erxes.com/automation/[ID]/discord-ticket
ERXES_BEARER_TOKEN=discord-bot-token-123
ERXES_HMAC_SECRET=hmac-secret-xyz-789
```

### 3.4 Start the Bot

```bash
npm start
```

**Expected output:**
```
🚀 Starting erxes Discord Ticket Bot...
✅ Discord bot logged in as erxes Ticket Bot#1234
🔄 Registering slash commands...
✅ Slash commands registered successfully
```

✅ **Bot is now running!**

---

## Step 4: Test the Integration (5 minutes)

### 4.1 Submit a Test Ticket

1. Open Discord → Go to your server
2. Type `/ticket` in any channel
3. Fill out the form:
   - **Title**: `Test ticket from Discord`
   - **Description**: `This is a test to verify the integration works`
   - **Priority**: `normal`
4. Click **Submit**

### 4.2 Verify Confirmation

You should see:
```
✅ Ticket submitted successfully!

Title: Test ticket from Discord
Priority: Normal
Status: Your ticket has been sent to our support team.

You will receive updates on your ticket soon. Thank you!
```

### 4.3 Check erxes

1. Open erxes → **Operations** → **Triage**
2. You should see a new ticket:
   - **Name**: `Test ticket from Discord`
   - **Description**: Contains Discord context
   - **Team**: Your selected team
   - **Number**: Auto-generated (e.g., #1)

---

## Troubleshooting

### Bot doesn't respond to /ticket

**Solution**: Commands may take 1-2 minutes to register. Wait and try again.

If still not working:
```bash
# Stop bot (Ctrl+C) and restart
node index.js
```

### Webhook Error: 401 Unauthorized

**Check**:
- `ERXES_BEARER_TOKEN` matches Step 1.3
- `ERXES_HMAC_SECRET` matches Step 1.3

### Webhook Error: 400 Bad Request

**Check**:
- All required fields in Step 1.2 are added
- Field names match exactly (case-sensitive)

### No Ticket Created in erxes

**Check**:
- Automation is **Active** (toggle in erxes)
- Team is selected in action configuration
- Operation plugin is running: `docker ps | grep operation`

### Still Having Issues?

Check logs:

**Bot logs**: Already visible in terminal where you ran `npm start`

**erxes logs**:
```bash
# Automation service
docker logs erxes-automations

# Operation plugin
docker logs erxes-operation-api
```

---

## Next Steps

### Optional: Add Notification Channel

1. Create a channel in Discord for ticket notifications (e.g., `#ticket-notifications`)
2. Right-click channel → Copy ID (enable Developer Mode in Discord settings first)
3. Add to `.env`:
   ```env
   NOTIFICATION_CHANNEL_ID=123456789012345678
   ```
4. Restart bot

Now all ticket submissions will be posted to that channel!

### Customize the Bot

See full customization guide in [DISCORD_BOT_INTEGRATION_GUIDE.md](./DISCORD_BOT_INTEGRATION_GUIDE.md)

---

## Summary of What You Built

```
Discord User
    ↓ (uses /ticket command)
Discord Bot
    ↓ (sends webhook with HMAC signature)
erxes Automation
    ↓ (validates & triggers)
Operation Plugin
    ↓ (creates triage ticket)
Triage Ticket in erxes ✅
```

**Congratulations!** 🎉 Your Discord bot is now integrated with erxes!

---

## File Reference

All files are in `discord-bot-example/`:

- `index.js` - Main bot entry point
- `commands/ticket.js` - Ticket command handler
- `utils/sendToErxes.js` - Webhook sender with security
- `.env` - Your configuration (not committed to git)
- `README.md` - Full documentation

## Support

- Full guide: [DISCORD_BOT_INTEGRATION_GUIDE.md](./DISCORD_BOT_INTEGRATION_GUIDE.md)
- erxes docs: https://erxes.io/docs
- Discord.js guide: https://discordjs.guide

---

**Total Setup Time**: ~30 minutes
**Difficulty**: Beginner-Intermediate
**Last Updated**: 2026-01-24
