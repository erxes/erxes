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

  // Convert payload to JSON string
  const payload = JSON.stringify(ticketData);

  // Generate HMAC signature
  // Format: HMAC-SHA256(timestamp.payload)
  const signaturePayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', hmacSecret)
    .update(signaturePayload)
    .digest('hex');

  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${bearerToken}`,
    'X-Erxes-Signature': `sha256=${signature}`,
    'X-Erxes-Timestamp': timestamp.toString(),
    'User-Agent': 'erxes-discord-bot/1.0.0',
  };

  // Retry configuration
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  // Attempt to send webhook with retries
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Attempt ${attempt}/${maxRetries}] Sending webhook to erxes...`);

      const response = await axios.post(webhookUrl, ticketData, {
        headers,
        timeout: 10000, // 10 second timeout
        validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      });

      // Check response status
      if (response.status === 200 || response.status === 202) {
        console.log('✅ Webhook sent successfully:', response.data);
        return response.data;
      } else if (response.status === 401) {
        throw new Error('Unauthorized: Invalid bearer token or HMAC signature');
      } else if (response.status === 400) {
        throw new Error(`Bad Request: ${response.data?.message || 'Invalid payload format'}`);
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`Webhook failed with status ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        if (error.response) {
          // Server responded with error status
          throw new Error(
            `erxes webhook error (${error.response.status}): ${
              error.response.data?.message || error.response.statusText
            }`
          );
        } else if (error.request) {
          // Request was made but no response
          throw new Error('No response from erxes server. Please check if erxes is accessible.');
        } else {
          // Something else went wrong
          throw new Error(`Failed to send webhook: ${error.message}`);
        }
      }

      // Wait before retrying (exponential backoff)
      const delay = retryDelay * Math.pow(2, attempt - 1);
      console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
      await sleep(delay);
    }
  }
}

/**
 * Sleep utility for retry delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verify HMAC signature (for testing/validation)
 * @param {string} payload - The JSON payload
 * @param {string} timestamp - The timestamp
 * @param {string} signature - The signature to verify
 * @param {string} secret - The HMAC secret
 * @returns {boolean} - True if signature is valid
 */
export function verifySignature(payload, timestamp, signature, secret) {
  const signaturePayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signaturePayload)
    .digest('hex');

  // Remove 'sha256=' prefix if present
  const cleanSignature = signature.replace('sha256=', '');

  return crypto.timingSafeEqual(
    Buffer.from(cleanSignature),
    Buffer.from(expectedSignature)
  );
}
