import axios from 'axios';
import crypto from 'crypto';

/**
 * Send ticket data to erxes webhook with security headers
 * @param {Object} ticketData - The ticket data to send
 * @returns {Promise<Object>} - The response from erxes
 */
export async function sendToErxes(ticketData) {
  const webhookUrl = process.env.ERXES_WEBHOOK_URL;
  const bearerToken = process.env.ERXES_BEARER_TOKEN;
  const hmacSecret = process.env.ERXES_HMAC_SECRET;

  // Validate configuration
  if (!webhookUrl || !bearerToken || !hmacSecret) {
    throw new Error('Missing erxes webhook configuration. Check your .env file.');
  }

  // Generate timestamp (in seconds)
  const timestamp = Math.floor(Date.now() / 1000);

  // Prepare payload
  const payload = JSON.stringify(ticketData);

  // Generate HMAC signature
  // Format: HMAC-SHA256(timestamp + payload)
  const signatureData = timestamp + payload;
  const signature = crypto
    .createHmac('sha256', hmacSecret)
    .update(signatureData)
    .digest('hex');

  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${bearerToken}`,
    'X-Webhook-Signature': signature,
    'X-Webhook-Timestamp': timestamp.toString(),
    'User-Agent': 'erxes-discord-bot/1.0',
  };

  try {
    console.log(`📤 Sending ticket to erxes: ${ticketData.title}`);

    // Send POST request to erxes webhook
    const response = await axios.post(webhookUrl, ticketData, {
      headers,
      timeout: 10000, // 10 second timeout
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors
    });

    // Check if request was successful
    if (response.status === 200 || response.status === 201) {
      console.log(`✅ Ticket created successfully:`, response.data);
      return response.data;
    } else if (response.status === 400) {
      throw new Error(`Invalid payload: ${response.data.message || 'Check your data'}`);
    } else if (response.status === 401) {
      throw new Error('Authentication failed. Check your bearer token and HMAC secret.');
    } else if (response.status === 404) {
      throw new Error('Webhook not found. Check your webhook URL and automation ID.');
    } else if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    } else {
      throw new Error(`Unexpected response: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    // Handle network errors
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to erxes. Is the server running?');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('Request timed out. Please try again.');
    } else if (axios.isAxiosError(error)) {
      // Axios-specific errors
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to send ticket to erxes'
      );
    } else {
      // Re-throw other errors
      throw error;
    }
  }
}

/**
 * Retry mechanism for failed webhook calls
 * @param {Object} ticketData - The ticket data to send
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @returns {Promise<Object>} - The response from erxes
 */
export async function sendToErxesWithRetry(ticketData, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await sendToErxes(ticketData);
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Attempt ${attempt}/${maxRetries} failed:`, error.message);

      // Don't retry on certain errors
      if (
        error.message.includes('Authentication failed') ||
        error.message.includes('Webhook not found') ||
        error.message.includes('Invalid payload')
      ) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`⏳ Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
