# Discord Bot Integration with erxes Webhook Automation

This guide will walk you through creating a Discord bot that sends customer tickets to erxes and automatically creates triage tickets in the operation plugin.

## Architecture Overview

```
Discord Server
    ↓
Discord Bot (receives /ticket command)
    ↓
Webhook POST → erxes Automation (Incoming Webhook Trigger)
    ↓
Create Triage Ticket Action (Operation Plugin)
    ↓
Triage Ticket Created in erxes
```

## Prerequisites

- erxes instance running with operation plugin enabled
- Discord account with server admin permissions
- Node.js 18+ installed
- A team created in erxes Operations module

## Part 1: Setting up erxes Automation

### Step 1: Create a New Automation

1. Open erxes and navigate to **Automations**
2. Click **+ Create Automation**
3. Name: `Discord Ticket Integration`
4. Status: Set to `Active`
5. Click **Create**

### Step 2: Add Incoming Webhook Trigger

1. Click **Add Trigger**
2. Select **Incoming Webhook** from the trigger types
3. Configure the webhook:
   - **Endpoint**: `discord-ticket` (or any path you prefer)
   - **Method**: `POST`
   - **Security Settings**:
     - **Bearer Token**: Generate a secure token (save this for your Discord bot)
     - **HMAC Secret**: Generate a secret key (save this for your Discord bot)
   - **Schema Validation** (optional but recommended):
     ```json
     {
       "type": "object",
       "required": ["title", "description", "teamId"],
       "properties": {
         "title": { "type": "string", "minLength": 1 },
         "description": { "type": "string" },
         "teamId": { "type": "string" },
         "priority": { "type": "number", "minimum": 0, "maximum": 3 },
         "discordUserId": { "type": "string" },
         "discordUsername": { "type": "string" }
       }
     }
     ```
4. **Copy the webhook URL** - You'll need this for your Discord bot:
   ```
   https://your-erxes-domain.com/automation/{automation-id}/discord-ticket
   ```

### Step 3: Add Create Triage Action

1. Click **Add Action** after the webhook trigger
2. Search for and select **Create triage ticket**
3. Configure the action:
   - **Name**: `{{trigger.body.title}}`
   - **Description**:
     ```
     Discord Ticket from @{{trigger.body.discordUsername}} (ID: {{trigger.body.discordUserId}})

     {{trigger.body.description}}
     ```
   - **Team ID**: Select your team from the dropdown (or use `{{trigger.body.teamId}}`)
   - **Priority**: `{{trigger.body.priority}}` (0=Low, 1=Normal, 2=High, 3=Urgent)

4. Click **Save**

### Step 4: Test Webhook (Optional)

You can test the webhook using curl:

```bash
curl -X POST \
  https://your-erxes-domain.com/automation/{automation-id}/discord-ticket \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: $(echo -n '{"title":"Test","description":"Test ticket","teamId":"YOUR_TEAM_ID","priority":1}' | openssl dgst -sha256 -hmac 'YOUR_HMAC_SECRET' | sed 's/^.* //')" \
  -d '{
    "title": "Test Ticket",
    "description": "This is a test ticket from Discord",
    "teamId": "YOUR_TEAM_ID",
    "priority": 1,
    "discordUserId": "123456789",
    "discordUsername": "testuser"
  }'
```

## Part 2: Creating the Discord Bot

### Step 1: Register Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Name: `erxes Ticket Bot`
4. Navigate to **Bot** section
5. Click **Add Bot**
6. **Copy the Bot Token** - You'll need this for your code
7. Enable these **Privileged Gateway Intents**:
   - Server Members Intent
   - Message Content Intent

### Step 2: Generate Bot Invite URL

1. Go to **OAuth2** → **URL Generator**
2. Select scopes:
   - `bot`
   - `applications.commands`
3. Select bot permissions:
   - Send Messages
   - Use Slash Commands
   - Read Messages/View Channels
4. Copy the generated URL and invite the bot to your server

### Step 3: Get Your Application ID

1. In the Discord Developer Portal, go to **General Information**
2. **Copy the Application ID** - You'll need this for your code

## Part 3: Setting up the Discord Bot Code

See the `discord-bot-example` directory for a complete, production-ready Discord bot implementation.

### Quick Start

1. Copy the example bot to your project:
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
   # Edit .env with your values
   ```

4. Run the bot:
   ```bash
   npm start
   ```

## Part 4: Using the Discord Bot

### User Experience

1. User types `/ticket` in any Discord channel
2. A modal form appears with fields:
   - **Title** (required)
   - **Description** (required)
   - **Priority** (dropdown: Low, Normal, High, Urgent)
3. User fills out the form and clicks Submit
4. Bot confirms ticket creation
5. Ticket appears in erxes Operations → Triage

### Example Interaction

```
User: /ticket

[Modal appears]
Title: Login not working
Description: I can't log into my account. Getting error 500.
Priority: High

[User clicks Submit]

Bot: ✅ Ticket created successfully!
     Ticket #42: Login not working
     Priority: High
     Status: Assigned to Support Team
```

## Part 5: Advanced Configuration

### Custom Team Assignment

You can modify the Discord bot to assign tickets to different teams based on:
- Discord channel
- Discord role
- Priority level
- Keywords in the title/description

Example in `commands/ticket.js`:

```javascript
// Determine team based on channel
let teamId;
if (interaction.channelId === 'TECH_SUPPORT_CHANNEL_ID') {
  teamId = 'TECH_TEAM_ID';
} else if (interaction.channelId === 'BILLING_CHANNEL_ID') {
  teamId = 'BILLING_TEAM_ID';
} else {
  teamId = process.env.DEFAULT_TEAM_ID;
}
```

### Multi-priority Support

The default implementation supports 4 priority levels:
- 0: Low
- 1: Normal
- 2: High
- 3: Urgent

You can customize these in the modal dropdown.

### Notification Channel

Set `NOTIFICATION_CHANNEL_ID` in `.env` to post ticket confirmations to a specific channel:

```env
NOTIFICATION_CHANNEL_ID=1234567890123456789
```

This will send a message like:
```
🎟️ New ticket created by @username
Title: Login not working
Priority: High
Ticket #42 in erxes
```

## Part 6: Troubleshooting

### Common Issues

#### 1. "Webhook not found" Error

**Cause**: The automation ID or endpoint doesn't match

**Solution**:
- Verify the webhook URL in your `.env`
- Ensure the automation is `Active`
- Check that the endpoint path matches exactly

#### 2. "Security validation failed" Error

**Cause**: Bearer token or HMAC signature is incorrect

**Solution**:
- Verify `ERXES_BEARER_TOKEN` in `.env`
- Verify `ERXES_HMAC_SECRET` in `.env`
- Check that the timestamp is within 5 minutes

#### 3. "Invalid payload" Error

**Cause**: The webhook body doesn't match the schema

**Solution**:
- Check the schema validation in the automation
- Ensure all required fields are being sent
- Verify data types match the schema

#### 4. "Team ID is required" Error

**Cause**: No team ID was provided

**Solution**:
- Set a default team ID in the Discord bot code
- Or provide team ID in the webhook payload

#### 5. Bot Not Responding to /ticket

**Cause**: Slash commands not registered

**Solution**:
```bash
node index.js
# Wait for "✅ Slash commands registered successfully!"
```

### Debugging

Enable debug logging by setting in `.env`:
```env
DEBUG=true
```

Check erxes automation logs:
1. Go to Automations
2. Click on your automation
3. View **Execution History**
4. Check for errors in failed executions

## Part 7: Security Best Practices

### 1. Use HTTPS

Always use HTTPS for your erxes instance to protect tokens in transit.

### 2. Rotate Secrets Regularly

Rotate your:
- Discord bot token (monthly)
- Bearer tokens (quarterly)
- HMAC secrets (quarterly)

### 3. Rate Limiting

The webhook system includes rate limiting:
- 100 requests per minute per webhook
- Per IP address

If you need higher limits, contact your erxes admin.

### 4. Input Validation

Always validate user input on both sides:
- Discord bot validates before sending
- erxes validates with schema

### 5. Error Messages

Never expose sensitive information in error messages:
- ✅ "Webhook processing failed"
- ❌ "Invalid bearer token: abc123..."

## Part 8: Monitoring & Analytics

### Webhook Analytics

Track webhook performance in erxes:
1. Go to Automations
2. Click on your automation
3. View **Execution History**

Metrics available:
- Total executions
- Success rate
- Average execution time
- Failed executions with details

### Discord Bot Monitoring

Monitor your bot with:
- Discord bot status
- Webhook response times
- Error rates
- Ticket creation success rate

Consider using services like:
- [UptimeRobot](https://uptimerobot.com/) - Bot uptime monitoring
- [Sentry](https://sentry.io/) - Error tracking
- [LogDNA](https://logdna.com/) - Log management

## Appendix: Complete Example

### Example Webhook Payload

```json
{
  "title": "Cannot access dashboard",
  "description": "I'm getting a 403 error when trying to access the admin dashboard.",
  "teamId": "65f8a9b2c3d4e5f6a7b8c9d0",
  "priority": 2,
  "discordUserId": "987654321098765432",
  "discordUsername": "john_doe"
}
```

### Example erxes Triage Ticket

After processing, this creates a triage ticket:

```
Ticket #123
Name: Cannot access dashboard
Description:
  Discord Ticket from @john_doe (ID: 987654321098765432)

  I'm getting a 403 error when trying to access the admin dashboard.

Team: Support Team
Priority: 2 (High)
Created By: automation
Status: Open
```

### Example Automation Flow

```
1. Incoming Webhook Trigger
   ├─ Endpoint: /discord-ticket
   ├─ Method: POST
   ├─ Security: Bearer + HMAC
   └─ Payload validated

2. Create Triage Action
   ├─ Name: {{trigger.body.title}}
   ├─ Description: {{trigger.body.description}}
   ├─ Team: {{trigger.body.teamId}}
   └─ Priority: {{trigger.body.priority}}

3. Result
   └─ Triage ticket created in erxes
```

## Support

If you need help:

1. Check the [erxes Documentation](https://erxes.io/docs)
2. Join the [erxes Discord](https://discord.com/invite/aaGzy3gQK5)
3. Create an issue on [GitHub](https://github.com/erxes/erxes/issues)

## Credits

Created by the erxes team with ❤️

License: MIT
