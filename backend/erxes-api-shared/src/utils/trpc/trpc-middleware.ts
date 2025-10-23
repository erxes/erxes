import { Request, Response, NextFunction } from 'express';
import { getHmacKey, createSignatureVerificationMiddleware } from './trpc-security';

export interface TRPCSecurityConfig {
  maxAgeSeconds?: number;
  skipPaths?: string[];
}

/**
 * Create tRPC security middleware with configurable options
 */
export function createTRPCSecurityMiddleware(config: TRPCSecurityConfig = {}) {
  const {
    maxAgeSeconds = 60,
    skipPaths = [],
  } = config;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip security for certain paths (only relevant for /trpc sub-paths)
    if (skipPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Check if HMAC key is configured
    const hmacKey = getHmacKey();
    if (!hmacKey) {
      console.warn('HMAC_KEY not configured for tRPC security. Skipping verification.');
      return next();
    }

    // Apply signature verification - MANDATORY when HMAC_KEY is present
    const verificationMiddleware = createSignatureVerificationMiddleware(maxAgeSeconds);
    return verificationMiddleware(req, res, next);
  };
}



/**
 * Middleware to log tRPC security events
 */
export function createTRPCSecurityLoggingMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data: any) {
      const serviceId = req.header('x-service-id');
      const timestamp = req.header('x-timestamp');
      
      if (req.path.startsWith('/trpc') && serviceId) {
        console.log(`[tRPC Security] ${req.method} ${req.path} - Service: ${serviceId}, Timestamp: ${timestamp}, Status: ${res.statusCode}`);
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
}

/**
 * Default tRPC security configuration
 */
export const defaultTRPCSecurityConfig: TRPCSecurityConfig = {
  maxAgeSeconds: parseInt(process.env.TRPC_SECURITY_MAX_AGE || '60'),
  skipPaths: [],
};
