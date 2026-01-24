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

- erxes instance with operation plugin enabled
- Discord account and server with admin permissions
- Node.js 18+ installed
- Basic knowledge of Discord bots

## Part 1: Set Up erxes Automation

### Step 1: Create a New Automation in erxes

1. **Navigate to Automations**
   - Go to your erxes dashboard
   - Click on **Automations** in the sidebar
   - Click **Create Automation**

2. **Configure Basic Settings**
   - **Name**: Discord Ticket Integration
   - **Description**: Automatically create triage tickets from Discord bot submissions
   - **Status**: Active

### Step 2: Configure Incoming Webhook Trigger

1. **Select Trigger Type**
   - Click **Add Trigger**
   - Select **Incoming Webhook**

2. **Configure Webhook Settings**
   - **Endpoint**: `discord-ticket` (this will be part of your webhook URL)
   - **HTTP Method**: `POST`

3. **Define Request Schema**

   Add the following fields to define the expected webhook payload:

   | Field Name | Type | Description | Required |
   |------------|------|-------------|----------|
   | `userName` | String | Discord username | Yes |
   | `userId` | String | Discord user ID | Yes |
   | `ticketTitle` | String | Title of the ticket | Yes |
   | `ticketDescription` | String | Detailed description | Yes |
   | `priority` | Number | Priority level (0-3) | No |
   | `channelName` | String | Discord channel name | No |
   | `timestamp` | String | Submission timestamp | No |

   **Example JSON Schema:**
   ```json
   {
     "userName": "string",
     "userId": "string",
     "ticketTitle": "string",
     "ticketDescription": "string",
     "priority": "number",
     "channelName": "string",
     "timestamp": "string"
   }
   ```

4. **Configure Security (Recommended)**

   Enable security features:
   - ✅ **Enable Security**
   - **Bearer Token**: Generate a random token (e.g., `discord-bot-secret-token-12345`)
   - **Secret for HMAC**: Generate another secret (e.g., `hmac-secret-key-xyz789`)
   - **Allowed IPs**: Leave empty for now (or add Discord's IP ranges if known)
   - ✅ **Prevent Replay Attacks**: Enable this

5. **Save Webhook Configuration**

   After saving, you'll receive:
   - **Webhook URL**: `https://your-erxes-domain.com/automation/{automation-id}/discord-ticket`
   - Copy this URL for later use

### Step 3: Add Create Triage Ticket Action

1. **Add Action**
   - Click **Add Action** in the automation flow
   - Select **Operation** → **Create triage ticket**

2. **Configure Triage Creation**

   Map webhook fields to triage ticket fields:

   | Triage Field | Value/Expression | Description |
   |--------------|------------------|-------------|
   | `name` | `{{ ticketTitle }}` | Uses webhook's ticketTitle |
   | `description` | ```Discord Ticket from @{{ userName }} ({{ userId }})\n\nChannel: {{ channelName }}\nSubmitted: {{ timestamp }}\n\n{{ ticketDescription }}``` | Formatted description with context |
   | `teamId` | Select your team | Choose the team to assign |
   | `priority` | `{{ priority }}` | Uses webhook's priority value |

   **Field Mapping Details:**
   - **Team**: Select your support/triage team from dropdown
   - **Priority**:
     - 0 = Low
     - 1 = Normal
     - 2 = High
     - 3 = Urgent

3. **Save Action**

4. **Activate Automation**
   - Toggle the automation to **Active**
   - Test the webhook endpoint (you'll get a test URL)

### Step 4: Note Your Configuration

Save these values for your Discord bot:

```
ERXES_WEBHOOK_URL=https://your-erxes-domain.com/automation/{automation-id}/discord-ticket
ERXES_BEARER_TOKEN=discord-bot-secret-token-12345
ERXES_HMAC_SECRET=hmac-secret-key-xyz789
```

---

## Part 2: Create Discord Bot

### Step 1: Register Discord Application

1. **Go to Discord Developer Portal**
   - Visit: https://discord.com/developers/applications
   - Click **New Application**
   - Name: `erxes Ticket Bot`

2. **Create Bot**
   - Click **Bot** in left sidebar
   - Click **Add Bot**
   - Copy the **Bot Token** (save it securely)

3. **Configure Bot Permissions**

   Under **Bot** → **Privileged Gateway Intents**, enable:
   - ✅ Message Content Intent
   - ✅ Server Members Intent

4. **Invite Bot to Server**
   - Go to **OAuth2** → **URL Generator**
   - Select scopes:
     - ✅ `bot`
     - ✅ `applications.commands`
   - Select bot permissions:
     - ✅ Send Messages
     - ✅ Use Slash Commands
   - Copy the generated URL and open in browser
   - Select your server and authorize

### Step 2: Set Up Discord Bot Project

See the `discord-bot/` directory for complete bot code.

**File Structure:**
```
discord-bot/
├── package.json
├── .env
├── index.js
├── commands/
│   └── ticket.js
└── utils/
    └── sendToErxes.js
```

### Step 3: Install Dependencies

```bash
cd discord-bot
npm install discord.js dotenv axios crypto
```

### Step 4: Configure Environment Variables

Create `.env` file:

```env
# Discord Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_application_client_id

# erxes Webhook Configuration
ERXES_WEBHOOK_URL=https://your-erxes-domain.com/automation/{automation-id}/discord-ticket
ERXES_BEARER_TOKEN=discord-bot-secret-token-12345
ERXES_HMAC_SECRET=hmac-secret-key-xyz789
```

### Step 5: Run the Bot

```bash
node index.js
```

You should see:
```
✅ Discord bot logged in as erxes Ticket Bot#1234
✅ Slash commands registered successfully
```

---

## Part 3: Using the Bot

### Create a Ticket from Discord

1. **In your Discord server**, use the slash command:

   ```
   /ticket
   ```

2. **Fill out the modal form:**
   - **Title**: Brief description of the issue
   - **Description**: Detailed explanation
   - **Priority**: Select from dropdown (Low, Normal, High, Urgent)

3. **Submit**

4. **Confirmation**
   - Bot replies: "✅ Ticket submitted successfully! Ticket ID: {number}"

### Verify in erxes

1. Go to **Operations** → **Triage**
2. You should see a new triage ticket with:
   - **Name**: Your ticket title
   - **Description**: Formatted with Discord context
   - **Team**: Assigned team
   - **Priority**: Selected priority
   - **Number**: Auto-generated ticket number

---

## Part 4: Advanced Configuration

### Custom Priority Mapping

Edit `discord-bot/commands/ticket.js`:

```javascript
const priorityMap = {
  'low': 0,
  'normal': 1,
  'high': 2,
  'urgent': 3,
  'critical': 4  // Add custom priority levels
};
```

### Add Additional Fields

**In erxes Webhook Schema**, add:
```json
{
  "attachmentUrls": "array",
  "category": "string",
  "impact": "string"
}
```

**In Discord Bot**, collect more data:
```javascript
// In commands/ticket.js
const categoryInput = new TextInputBuilder()
  .setCustomId('category')
  .setLabel('Category')
  .setStyle(TextInputStyle.Short)
  .setPlaceholder('e.g., Technical, Billing, General')
  .setRequired(false);
```

### Add Notification to Discord

After successful webhook, send confirmation to a specific channel:

```javascript
// In index.js, add after webhook success
const notificationChannel = client.channels.cache.get('YOUR_CHANNEL_ID');
if (notificationChannel) {
  await notificationChannel.send({
    embeds: [{
      title: '🎫 New Ticket Created',
      description: `**${ticketData.ticketTitle}**`,
      fields: [
        { name: 'Submitted by', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Priority', value: priorityLabel, inline: true },
        { name: 'Ticket Number', value: `#${responseData.number || 'N/A'}`, inline: true },
      ],
      color: 0x00ff00,
      timestamp: new Date(),
    }]
  });
}
```

### Error Handling & Retry Logic

The bot includes:
- ✅ Automatic retry (3 attempts with exponential backoff)
- ✅ HMAC signature validation
- ✅ Timestamp-based replay protection
- ✅ User-friendly error messages

### Rate Limiting

erxes webhooks have built-in rate limiting:
- **100 requests per minute** per webhook per IP
- Exceeding this returns `429 Too Many Requests`

---

## Part 5: Troubleshooting

### Common Issues

#### 1. **Webhook returns 401 Unauthorized**
- **Cause**: Incorrect bearer token or HMAC signature
- **Fix**:
  - Verify `ERXES_BEARER_TOKEN` matches automation config
  - Check `ERXES_HMAC_SECRET` is correct
  - Ensure timestamp is within 5 minutes

#### 2. **Webhook returns 400 Bad Request**
- **Cause**: Payload doesn't match schema
- **Fix**:
  - Check webhook schema in erxes automation
  - Ensure all required fields are sent
  - Verify field types (string vs number)

#### 3. **Triage ticket not created**
- **Cause**:
  - `teamId` is invalid or missing
  - User has no permission
- **Fix**:
  - Verify team exists in operation plugin
  - Check automation action configuration
  - Review erxes logs: `docker logs erxes-automations`

#### 4. **Bot doesn't respond to /ticket**
- **Cause**: Commands not registered
- **Fix**:
  ```bash
  # Re-run command registration
  node index.js
  ```

#### 5. **"Internal Server Error" from webhook**
- **Cause**: Automation or action configuration error
- **Fix**:
  - Check erxes automation logs
  - Verify operation plugin is running
  - Test webhook with Postman/curl first

### Testing Webhook Manually

Use `curl` to test the webhook:

```bash
# Generate HMAC signature
PAYLOAD='{"userName":"TestUser","userId":"123","ticketTitle":"Test","ticketDescription":"Testing","priority":1}'
TIMESTAMP=$(date +%s)
SECRET="hmac-secret-key-xyz789"

SIGNATURE=$(echo -n "${TIMESTAMP}.${PAYLOAD}" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')

curl -X POST "https://your-erxes-domain.com/automation/{automation-id}/discord-ticket" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer discord-bot-secret-token-12345" \
  -H "X-Erxes-Signature: sha256=${SIGNATURE}" \
  -H "X-Erxes-Timestamp: ${TIMESTAMP}" \
  -d "$PAYLOAD"
```

Expected response:
```json
{
  "status": "success",
  "executionId": "abc123..."
}
```

---

## Part 6: Security Best Practices

### 1. **Always Use HMAC Signatures**
- Prevents unauthorized webhook calls
- Validates payload integrity

### 2. **Enable Replay Attack Prevention**
- Rejects requests with old timestamps
- Prevents replay of captured requests

### 3. **Use Environment Variables**
- Never commit secrets to git
- Add `.env` to `.gitignore`

### 4. **Restrict IP Access (Optional)**
- If Discord publishes IP ranges, add to webhook allowlist
- Reduces attack surface

### 5. **Monitor Webhook Logs**
- Check erxes logs service for failed attempts
- Set up alerts for suspicious activity

### 6. **Rotate Secrets Periodically**
- Update bearer token and HMAC secret every 90 days
- Update both erxes automation and Discord bot `.env`

---

## Part 7: Monitoring & Analytics

### View Automation Executions

1. Go to **Automations** → **Discord Ticket Integration**
2. Click **Executions** tab
3. View:
   - Execution history
   - Success/failure rate
   - Payload data
   - Error messages

### Check Webhook Security Logs

Webhook security events are logged to erxes logs service:

```bash
# If using Docker
docker logs erxes-logs | grep webhook_security

# Check for failed attempts
docker logs erxes-logs | grep "webhook.*failed"
```

### Discord Bot Logging

The bot logs all activities to console:
```
[2026-01-24 10:30:45] Ticket submitted by User#1234
[2026-01-24 10:30:46] Webhook sent to erxes
[2026-01-24 10:30:47] ✅ Success: Ticket #42 created
```

---

## Appendix: Complete Code Reference

### erxes Automation Configuration Summary

**Trigger:**
- Type: Incoming Webhook
- Endpoint: `discord-ticket`
- Method: POST
- Security: Bearer Token + HMAC + Replay Prevention

**Action:**
- Type: Create Triage Ticket
- Module: Operation
- Fields: name, description, teamId, priority

### Discord Bot Dependencies

```json
{
  "dependencies": {
    "discord.js": "^14.14.1",
    "dotenv": "^16.3.1",
    "axios": "^1.6.2",
    "crypto": "built-in"
  }
}
```

---

## Support

- **erxes Documentation**: https://erxes.io/docs
- **Discord.js Guide**: https://discordjs.guide
- **Issues**: Open issue on erxes GitHub repository

---

**Last Updated**: 2026-01-24
**Version**: 1.0.0
**Author**: erxes Team
