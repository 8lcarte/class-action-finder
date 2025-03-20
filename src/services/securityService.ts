import { supabase } from '@/lib/supabase';

// Define PII fields that need special handling
const PII_FIELDS = [
  'name',
  'email',
  'address',
  'phone',
  'social_security_number',
  'date_of_birth',
  'credit_card_number',
  'bank_account_number'
];

// Define sensitive operations that should be logged
const SENSITIVE_OPERATIONS = [
  'user_login',
  'user_logout',
  'user_registration',
  'password_reset',
  'profile_update',
  'claim_submission',
  'document_upload',
  'data_export',
  'data_deletion',
  'privacy_settings_change',
  'admin_access'
];

/**
 * Encrypts PII data for storage
 * Note: In a real implementation, this would use a proper encryption library
 */
export function encryptPII(data: string): string {
  // This is a placeholder for actual encryption
  // In production, use a proper encryption library like crypto-js
  return `encrypted:${data}`;
}

/**
 * Decrypts PII data for use
 * Note: In a real implementation, this would use a proper decryption library
 */
export function decryptPII(encryptedData: string): string {
  // This is a placeholder for actual decryption
  // In production, use a proper encryption library like crypto-js
  if (encryptedData.startsWith('encrypted:')) {
    return encryptedData.substring(10);
  }
  return encryptedData;
}

/**
 * Logs sensitive operations for audit purposes
 */
export async function logAuditEvent(
  userId: string,
  operation: string,
  details: Record<string, any>,
  ipAddress?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert([
        {
          user_id: userId,
          operation,
          details,
          ip_address: ipAddress,
          timestamp: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Error logging audit event:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in logAuditEvent:', error);
    return false;
  }
}

/**
 * Scans object for PII and returns fields that contain PII
 */
export function scanForPII(data: Record<string, any>): string[] {
  const piiFound: string[] = [];

  // Check for known PII fields
  for (const field in data) {
    if (PII_FIELDS.includes(field.toLowerCase()) && data[field]) {
      piiFound.push(field);
    }
  }

  // Check for patterns that might indicate PII
  // This is a simplified version - real implementation would use regex patterns
  for (const field in data) {
    const value = String(data[field] || '');
    
    // Check for email pattern
    if (value.includes('@') && value.includes('.')) {
      if (!piiFound.includes(field)) piiFound.push(field);
    }
    
    // Check for phone number pattern (simplified)
    if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(value)) {
      if (!piiFound.includes(field)) piiFound.push(field);
    }
    
    // Check for SSN pattern (simplified)
    if (/\d{3}[-.\s]?\d{2}[-.\s]?\d{4}/.test(value)) {
      if (!piiFound.includes(field)) piiFound.push(field);
    }
  }

  return piiFound;
}

/**
 * Encrypts PII fields in an object
 */
export function encryptPIIFields(data: Record<string, any>, fieldsToEncrypt: string[]): Record<string, any> {
  const result = { ...data };
  
  for (const field of fieldsToEncrypt) {
    if (result[field]) {
      result[field] = encryptPII(String(result[field]));
    }
  }
  
  return result;
}

/**
 * Decrypts PII fields in an object
 */
export function decryptPIIFields(data: Record<string, any>, fieldsToDecrypt: string[]): Record<string, any> {
  const result = { ...data };
  
  for (const field of fieldsToDecrypt) {
    if (result[field] && typeof result[field] === 'string' && result[field].startsWith('encrypted:')) {
      result[field] = decryptPII(result[field]);
    }
  }
  
  return result;
}

/**
 * Minimizes data by removing unnecessary fields
 */
export function minimizeData(data: Record<string, any>, requiredFields: string[]): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const field of requiredFields) {
    if (data[field] !== undefined) {
      result[field] = data[field];
    }
  }
  
  return result;
}

/**
 * Anonymizes data for analytics by removing or hashing PII
 */
export function anonymizeData(data: Record<string, any>): Record<string, any> {
  const result = { ...data };
  const piiFields = scanForPII(data);
  
  for (const field of piiFields) {
    // For fields we want to completely remove
    if (['credit_card_number', 'bank_account_number', 'social_security_number'].includes(field.toLowerCase())) {
      delete result[field];
    } 
    // For fields we want to hash
    else if (['email', 'name', 'phone', 'address'].includes(field.toLowerCase())) {
      result[field] = `hashed:${field}:${Math.random().toString(36).substring(2, 10)}`;
    }
  }
  
  return result;
}

/**
 * Generates a data processing consent form based on user location
 */
export function generateConsentForm(userLocation: string): string {
  // Base consent text
  let consentText = `
    # Data Processing Consent

    We collect and process your personal information to provide our Class Action Lawsuit Finder services.
    
    ## Information We Collect
    - Contact information (name, email, phone)
    - Profile information you provide
    - Claims and lawsuit participation data
    - Usage data and analytics
    
    ## How We Use Your Information
    - To provide and improve our services
    - To match you with relevant lawsuits
    - To process your claims
    - To communicate with you about your account and claims
    
    ## Your Rights
    You have the right to:
    - Access your personal data
    - Correct inaccurate data
    - Request deletion of your data
    - Restrict or object to processing
    - Data portability
    
    ## Data Retention
    We retain your data for as long as necessary to provide our services and comply with legal obligations.
  `;
  
  // Add GDPR-specific language for EU users
  if (['EU', 'UK', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'DK', 'SE', 'NO', 'FI', 'PT', 'GR', 'AT'].includes(userLocation)) {
    consentText += `
      ## GDPR Compliance
      As a user in the European Economic Area, you are protected by the General Data Protection Regulation (GDPR).
      
      - We process your data based on your consent and our legitimate interests
      - You have the right to withdraw consent at any time
      - You have the right to lodge a complaint with a supervisory authority
      - We implement appropriate technical and organizational measures to protect your data
      
      Our Data Protection Officer can be contacted at dpo@classactionfinder.com
    `;
  }
  
  // Add CCPA-specific language for California users
  if (userLocation === 'CA') {
    consentText += `
      ## California Consumer Privacy Act (CCPA) Rights
      As a California resident, you have the following rights:
      
      - Right to know what personal information we collect
      - Right to access your personal information
      - Right to request deletion of your personal information
      - Right to opt-out of the sale of your personal information
      - Right to non-discrimination for exercising your rights
      
      To exercise your rights under the CCPA, please contact us at privacy@classactionfinder.com
    `;
  }
  
  return consentText;
}

/**
 * Handles data subject access requests (DSAR)
 */
export async function handleDataSubjectRequest(
  userId: string,
  requestType: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection'
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    switch (requestType) {
      case 'access':
        // Get all user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (userError) throw new Error(`Error fetching user data: ${userError.message}`);
        
        // Get user's claims
        const { data: claimsData, error: claimsError } = await supabase
          .from('claims')
          .select('*')
          .eq('user_id', userId);
          
        if (claimsError) throw new Error(`Error fetching claims data: ${claimsError.message}`);
        
        // Get user's saved searches
        const { data: searchesData, error: searchesError } = await supabase
          .from('saved_searches')
          .select('*')
          .eq('user_id', userId);
          
        if (searchesError) throw new Error(`Error fetching saved searches: ${searchesError.message}`);
        
        // Get user's notifications
        const { data: notificationsData, error: notificationsError } = await supabase
          .from('user_notifications')
          .select('*')
          .eq('user_id', userId);
          
        if (notificationsError) throw new Error(`Error fetching notifications: ${notificationsError.message}`);
        
        // Decrypt any encrypted PII fields
        const decryptedUserData = decryptPIIFields(userData, PII_FIELDS);
        
        return {
          success: true,
          data: {
            user: decryptedUserData,
            claims: claimsData,
            savedSearches: searchesData,
            notifications: notificationsData
          }
        };
        
      case 'erasure':
        // Delete user's data (in a real implementation, this would be more comprehensive)
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', userId);
          
        if (deleteError) throw new Error(`Error deleting user data: ${deleteError.message}`);
        
        return {
          success: true,
          message: 'User data has been deleted successfully.'
        };
        
      // Implement other request types as needed
      default:
        return {
          success: false,
          message: `Request type '${requestType}' not implemented yet.`
        };
    }
  } catch (error) {
    console.error('Error handling data subject request:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Rate limiting middleware
 */
export function rateLimit(
  identifier: string,
  maxRequests: number,
  timeWindowMs: number
): boolean {
  // In a real implementation, this would use Redis or a similar store
  // For now, we'll use a simple in-memory store
  const rateLimitStore: Record<string, { count: number; resetTime: number }> = {};
  
  const now = Date.now();
  
  // Initialize or reset if time window has passed
  if (!rateLimitStore[identifier] || now > rateLimitStore[identifier].resetTime) {
    rateLimitStore[identifier] = {
      count: 1,
      resetTime: now + timeWindowMs
    };
    return true;
  }
  
  // Increment count
  rateLimitStore[identifier].count += 1;
  
  // Check if limit exceeded
  if (rateLimitStore[identifier].count > maxRequests) {
    return false;
  }
  
  return true;
}

/**
 * Bot detection based on user behavior
 */
export function detectBot(
  requestFrequency: number,
  requestPattern: string[],
  userAgent: string
): { isBot: boolean; confidence: number; reason?: string } {
  let botScore = 0;
  let reason = '';
  
  // Check request frequency (requests per minute)
  if (requestFrequency > 60) {
    botScore += 0.4;
    reason += 'High request frequency. ';
  } else if (requestFrequency > 30) {
    botScore += 0.2;
    reason += 'Moderate request frequency. ';
  }
  
  // Check for suspicious patterns
  const uniquePatterns = new Set(requestPattern).size;
  const patternRatio = uniquePatterns / requestPattern.length;
  
  if (patternRatio < 0.1) {
    botScore += 0.3;
    reason += 'Repetitive request pattern. ';
  }
  
  // Check user agent
  const botUserAgents = ['bot', 'crawler', 'spider', 'headless'];
  if (botUserAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    botScore += 0.5;
    reason += 'Bot-like user agent. ';
  }
  
  return {
    isBot: botScore >= 0.5,
    confidence: botScore,
    reason: reason.trim()
  };
}

/**
 * Secure file validation
 */
export function validateSecureFile(
  fileName: string,
  fileSize: number,
  fileType: string
): { isValid: boolean; reason?: string } {
  // Check file size (max 10MB)
  if (fileSize > 10 * 1024 * 1024) {
    return { isValid: false, reason: 'File size exceeds maximum allowed (10MB).' };
  }
  
  // Check file type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(fileType)) {
    return { isValid: false, reason: 'File type not allowed. Allowed types: PDF, JPEG, PNG, DOC, DOCX.' };
  }
  
  // Check file extension
  const extension = fileName.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['pdf', 'jpeg', 'jpg', 'png', 'doc', 'docx'];
  if (!extension || !allowedExtensions.includes(extension)) {
    return { isValid: false, reason: 'File extension not allowed. Allowed extensions: .pdf, .jpeg, .jpg, .png, .doc, .docx.' };
  }
  
  // Check for suspicious double extensions
  if (fileName.split('.').length > 2) {
    return { isValid: false, reason: 'Multiple file extensions not allowed.' };
  }
  
  return { isValid: true };
}

/**
 * Generate secure session token
 */
export function generateSecureToken(length = 32): string {
  // In a real implementation, use a cryptographically secure random generator
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Create security headers for API responses
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.supabase.io;",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  };
}
