# How to Use erxes Automation Incoming Webhook

This guide explains how to configure and use the Incoming Webhook trigger in erxes Automations.

## What is an Incoming Webhook?

An **Incoming Webhook** is a trigger type in erxes Automations that allows external systems (like Discord bots, Zapier, custom applications, etc.) to send data to erxes and trigger automated workflows.

**Use Cases:**
- Receive tickets from external systems (Discord, Slack, etc.)
- Integrate with third-party services (payment processors, CRMs)
- Accept form submissions from external websites
- Trigger workflows from custom applications
- Create records from API calls

---

## Step-by-Step Configuration

### Step 1: Create a New Automation

1. **Navigate to Automations**
   - In erxes sidebar, click **Automations**
   - Click **+ Create Automation** button (top right)

2. **Basic Info**
   - **Name**: Give your automation a descriptive name (e.g., "Discord Ticket Webhook")
   - **Description**: Optional description of what this automation does
   - Click **Create** or **Save**

---

### Step 2: Add Incoming Webhook Trigger

1. **Click "Add Trigger"** or the **+** button in the automation builder

2. **Select "Incoming Webhook"** from the trigger list

3. **You'll see the Incoming Webhook configuration panel with these sections:**

---

### Step 3: Configure Webhook Endpoint

**Section: Request Configuration**

#### **Endpoint Name**
- **Field**: Endpoint
- **Value**: Enter a custom endpoint name (e.g., `discord-ticket`, `payment-notification`)
- **Result**: This becomes part of your webhook URL
- **Example**: If you enter `discord-ticket`, your URL will be:
  ```
  https://your-erxes.com/automation/{automation-id}/discord-ticket
  ```

#### **HTTP Method**
- **Options**: GET, POST, PUT, PATCH, DELETE
- **Recommended**: POST (most common for webhooks)
- **Select**: Choose the HTTP method your external system will use

---

### Step 4: Define Payload Schema

**Section: Schema / Body**

This defines what data structure your webhook expects to receive.

#### **Add Schema Fields**

Click **+ Add Field** for each field you want to receive:

**Example for Discord Ticket:**

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `userName` | String | ✓ | Discord username |
| `userId` | String | ✓ | Discord user ID |
| `ticketTitle` | String | ✓ | Title of the ticket |
| `ticketDescription` | String | ✓ | Detailed description |
| `priority` | Number | | Priority level (0-3) |
| `channelName` | String | | Discord channel name |
| `timestamp` | String | | Submission timestamp |

**How to add each field:**

1. Click **+ Add Field**
2. **Key**: Enter the field name (e.g., `userName`)
3. **Type**: Select data type from dropdown
   - `string` - Text values
   - `number` - Numeric values
   - `boolean` - true/false
   - `object` - Nested objects
   - `array` - Lists of items
4. **Description**: Optional description
5. **Required**: Toggle if field is mandatory

**Field Types:**

```
String   → Text: "John Doe", "test@example.com"
Number   → Numbers: 42, 3.14, 100
Boolean  → true or false
Object   → Nested data: { "name": "John", "age": 30 }
Array    → Lists: ["item1", "item2", "item3"]
```

---

### Step 5: Configure Security Settings

**Section: Security** (Click "Security" tab or expand security section)

#### **Enable Security** (Toggle ON)

Once enabled, you'll see these options:

#### **1. Headers (Custom Headers)**

Add custom headers that the webhook request must include:

**Click + Add Header:**
- **Key**: Header name (e.g., `X-Custom-Token`)
- **Value**: Expected value (e.g., `my-secret-value`)
- **Description**: Optional note

**Common headers:**
- `X-API-Key`: API authentication
- `X-Webhook-Source`: Identify the source
- `User-Agent`: Specific user agent

#### **2. Bearer Token**

- **Field**: Bearer Token
- **Value**: Enter a secret token (e.g., `discord-bot-secret-123`)
- **Usage**: External system sends this in `Authorization: Bearer {token}` header
- **Example**:
  ```
  Authorization: Bearer discord-bot-secret-123
  ```

**How to generate:**
```bash
# Option 1: Random string
openssl rand -hex 32

# Option 2: UUID
node -e "console.log(require('crypto').randomUUID())"

# Example output:
discord-bot-8f7a9e2b4c6d1234567890abcdef1234
```

#### **3. HMAC Secret (Signature Verification)**

- **Field**: Secret for HMAC
- **Value**: Enter a secret key (e.g., `hmac-secret-xyz789`)
- **Usage**: External system signs the payload with HMAC-SHA256
- **Purpose**: Ensures payload integrity and authenticity

**How HMAC works:**
```
1. External system creates signature:
   signature = HMAC-SHA256(secret, "timestamp.payload")

2. Sends signature in header:
   X-Erxes-Signature: sha256={signature}
   X-Erxes-Timestamp: {unix_timestamp}

3. erxes verifies signature matches
```

**How to generate secret:**
```bash
openssl rand -base64 32
# Example: hmac-Kx7mP9nQ2wE5vL8aZ3bY6cR4tU1sF0hG=
```

#### **4. Allowed IPs (IP Whitelist)**

- **Field**: Allowed IPs
- **Value**: Comma-separated IP addresses or CIDR ranges
- **Examples**:
  ```
  192.168.1.100
  192.168.1.0/24
  10.0.0.0/8, 172.16.0.0/12
  ```
- **Leave empty**: To allow all IPs (not recommended for production)

#### **5. Prevent Replay Attacks**

- **Toggle**: ON/OFF
- **Function**: Checks timestamp in requests
- **Validation**: Rejects requests older than 5 minutes
- **Requires**: External system to send `X-Erxes-Timestamp` header

---

### Step 6: View Webhook URL

After configuring the endpoint, erxes displays your **Webhook URL**:

```
https://your-erxes-domain.com/automation/{automation-id}/{endpoint}
```

**Example:**
```
https://app.erxes.io/automation/65f8a9b2c3d4e5f6a7b8c9d0/discord-ticket
```

**Copy this URL** - you'll need it for your external system!

---

### Step 7: Test the Webhook

**Option 1: Use erxes Test Feature**

If erxes provides a test button:
1. Click **Test Webhook** button
2. Enter sample JSON payload
3. Click **Send Test**
4. Check if automation triggers successfully

**Option 2: Use curl Command**

```bash
# Without security
curl -X POST "https://your-erxes.com/automation/ABC123/discord-ticket" \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "TestUser",
    "userId": "12345",
    "ticketTitle": "Test Ticket",
    "ticketDescription": "This is a test",
    "priority": 1
  }'

# With Bearer Token
curl -X POST "https://your-erxes.com/automation/ABC123/discord-ticket" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer discord-bot-secret-123" \
  -d '{
    "userName": "TestUser",
    "userId": "12345",
    "ticketTitle": "Test Ticket",
    "ticketDescription": "This is a test",
    "priority": 1
  }'

# With HMAC Signature (requires script - see below)
```

**Option 3: Use Postman**

1. Create new request
2. Method: POST
3. URL: Your webhook URL
4. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer {your-token}` (if using)
5. Body: Raw JSON
   ```json
   {
     "userName": "TestUser",
     "userId": "12345",
     "ticketTitle": "Test Ticket",
     "ticketDescription": "This is a test",
     "priority": 1
   }
   ```
6. Click **Send**

**Expected Response:**
```json
{
  "status": "success",
  "executionId": "65f8a9b2c3d4e5f6a7b8c9d0"
}
```

---

### Step 8: Add Actions to Automation

After the webhook trigger, add actions to process the data:

**Example: Create Triage Ticket**

1. Click **+ Add Action**
2. Select **Operation** → **Create triage ticket**
3. **Map webhook fields using placeholders:**
   - **Name**: `{{ ticketTitle }}`
   - **Description**: `{{ ticketDescription }}`
   - **Priority**: `{{ priority }}`
   - **Team**: Select from dropdown
4. Click **Save**

**Available Placeholders:**

Use double curly braces to reference webhook fields:
- `{{ fieldName }}` - Gets value from webhook payload
- `{{ userName }}` - Discord username
- `{{ ticketTitle }}` - Ticket title
- etc.

**Complex Expressions:**

You can combine fields:
```
Ticket from @{{ userName }} (ID: {{ userId }})

Submitted: {{ timestamp }}
Channel: {{ channelName }}

Description:
{{ ticketDescription }}
```

---

### Step 9: Activate the Automation

1. **Toggle Automation Status** to **Active** (usually a switch at the top)
2. **Save** the automation
3. The webhook is now live and ready to receive requests!

---

## Understanding Webhook Data Flow

```
External System (Discord Bot, Zapier, etc.)
    ↓
    Sends HTTP POST request
    ↓
erxes Webhook Endpoint
    ↓
    Validates:
    - Bearer Token (if configured)
    - HMAC Signature (if configured)
    - IP Address (if whitelist configured)
    - Timestamp (if replay prevention enabled)
    - Payload Schema (required fields)
    ↓
    If valid:
    ↓
Automation Triggered
    ↓
    Webhook data available as {{ fieldName }}
    ↓
Actions Execute
    ↓
    - Create record
    - Send notification
    - Update data
    - Call another webhook
    - etc.
    ↓
Response sent to external system
```

---

## Common Configuration Examples

### Example 1: Discord Bot Webhook

**Endpoint:** `discord-ticket`

**Method:** POST

**Schema:**
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

**Security:**
- Bearer Token: `discord-bot-abc123`
- HMAC Secret: `hmac-xyz789`
- Prevent Replay: ✓

**Action:** Create triage ticket

---

### Example 2: Payment Webhook

**Endpoint:** `payment-received`

**Method:** POST

**Schema:**
```json
{
  "transactionId": "string",
  "amount": "number",
  "currency": "string",
  "customerEmail": "string",
  "status": "string"
}
```

**Security:**
- HMAC Secret: (from payment provider)
- Custom Header: `X-Payment-Provider: stripe`

**Action:** Update customer record, send confirmation email

---

### Example 3: Form Submission

**Endpoint:** `contact-form`

**Method:** POST

**Schema:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "message": "string",
  "source": "string"
}
```

**Security:**
- Bearer Token: `website-form-token`
- Allowed IPs: `203.0.113.0/24` (your web server)

**Action:** Create customer, create ticket

---

## Security Best Practices

### 1. Always Use HTTPS
- erxes should be served over HTTPS
- Encrypts webhook data in transit

### 2. Enable All Security Features
- ✓ Bearer Token
- ✓ HMAC Signature
- ✓ Replay Prevention
- ✓ IP Whitelist (if possible)

### 3. Strong Secrets
```bash
# Good
discord-bot-8f7a9e2b4c6d1234567890abcdef1234

# Bad
my-secret
123456
discord-bot
```

### 4. Rotate Secrets Regularly
- Update bearer token every 90 days
- Update HMAC secret every 90 days
- Update both erxes and external system

### 5. Monitor Failed Attempts
- Check automation execution logs
- Alert on multiple failures
- Review webhook security logs

### 6. Validate Payload
- Define strict schema
- Mark fields as required
- Use specific data types

---

## Troubleshooting

### Webhook Returns 401 Unauthorized

**Causes:**
- Incorrect bearer token
- HMAC signature mismatch
- Missing Authorization header

**Solutions:**
1. Verify bearer token matches exactly
2. Check HMAC signature generation
3. Ensure timestamp is current (< 5 minutes old)
4. Check headers are sent correctly

---

### Webhook Returns 400 Bad Request

**Causes:**
- Payload doesn't match schema
- Missing required fields
- Wrong data types

**Solutions:**
1. Check schema definition in erxes
2. Verify all required fields are sent
3. Ensure field types match (string vs number)
4. Validate JSON is properly formatted

---

### Webhook Returns 429 Too Many Requests

**Cause:**
- Rate limit exceeded (100 req/min per webhook per IP)

**Solution:**
- Implement backoff and retry in external system
- Contact erxes admin to increase limits

---

### Automation Doesn't Trigger

**Causes:**
- Automation is inactive
- Webhook validation failed
- Action configuration error

**Solutions:**
1. Check automation is **Active**
2. Review execution logs in erxes
3. Test webhook with curl
4. Check action configuration

---

### Action Fails to Execute

**Causes:**
- Required field missing in action
- Invalid team ID or reference
- Permission issues

**Solutions:**
1. Review automation execution details
2. Check {{ placeholder }} values are populated
3. Verify team/user IDs exist
4. Check erxes service logs

---

## Advanced: HMAC Signature Example

### Node.js (Discord Bot Example)

```javascript
const crypto = require('crypto');
const axios = require('axios');

async function sendWebhook(payload) {
  const webhookUrl = process.env.ERXES_WEBHOOK_URL;
  const bearerToken = process.env.ERXES_BEARER_TOKEN;
  const hmacSecret = process.env.ERXES_HMAC_SECRET;

  // Generate timestamp
  const timestamp = Math.floor(Date.now() / 1000);

  // Convert payload to JSON
  const payloadJson = JSON.stringify(payload);

  // Create HMAC signature
  const signaturePayload = `${timestamp}.${payloadJson}`;
  const signature = crypto
    .createHmac('sha256', hmacSecret)
    .update(signaturePayload)
    .digest('hex');

  // Send request
  const response = await axios.post(webhookUrl, payload, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`,
      'X-Erxes-Signature': `sha256=${signature}`,
      'X-Erxes-Timestamp': timestamp.toString(),
    },
  });

  return response.data;
}
```

### Python Example

```python
import hmac
import hashlib
import time
import json
import requests

def send_webhook(payload):
    webhook_url = os.environ['ERXES_WEBHOOK_URL']
    bearer_token = os.environ['ERXES_BEARER_TOKEN']
    hmac_secret = os.environ['ERXES_HMAC_SECRET']

    # Generate timestamp
    timestamp = str(int(time.time()))

    # Convert payload to JSON
    payload_json = json.dumps(payload)

    # Create HMAC signature
    signature_payload = f"{timestamp}.{payload_json}"
    signature = hmac.new(
        hmac_secret.encode(),
        signature_payload.encode(),
        hashlib.sha256
    ).hexdigest()

    # Send request
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {bearer_token}',
        'X-Erxes-Signature': f'sha256={signature}',
        'X-Erxes-Timestamp': timestamp,
    }

    response = requests.post(webhook_url, json=payload, headers=headers)
    return response.json()
```

---

## Monitoring & Debugging

### View Execution History

1. Go to **Automations** → Your automation
2. Click **Executions** tab
3. View:
   - Execution timestamp
   - Status (success/failed)
   - Trigger data (webhook payload)
   - Action results
   - Error messages

### Check Webhook Logs

If webhook security fails, check logs:

```bash
# Docker
docker logs erxes-automations | grep webhook

# Look for:
# - 401 Unauthorized
# - HMAC validation failed
# - IP not whitelisted
# - Timestamp too old
```

### Debug Payload

Use browser console or Postman to inspect:
- Request headers
- Request body
- Response status
- Response body

---

## Summary Checklist

- [ ] Created automation
- [ ] Added incoming webhook trigger
- [ ] Configured endpoint name
- [ ] Selected HTTP method (POST)
- [ ] Defined payload schema
- [ ] Enabled security (bearer token + HMAC)
- [ ] Configured replay prevention
- [ ] Copied webhook URL
- [ ] Added action(s) to automation
- [ ] Mapped webhook fields using {{ placeholders }}
- [ ] Activated automation
- [ ] Tested webhook with curl/Postman
- [ ] Verified action executes correctly
- [ ] Configured external system to call webhook

---

## Need Help?

- **Documentation**: See `DISCORD_BOT_INTEGRATION_GUIDE.md` for full Discord example
- **Quick Start**: See `QUICKSTART_DISCORD_BOT.md`
- **Discord Bot Code**: See `discord-bot-example/` directory
- **erxes Docs**: https://erxes.io/docs

---

**Last Updated**: 2026-01-24
**Version**: 1.0.0
