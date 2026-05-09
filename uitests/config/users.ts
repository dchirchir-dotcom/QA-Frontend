/**
 * Test User Credentials
 * 
 * These are default test users for development and production environments.
 * 
 * IMPORTANT: For security reasons:
 * - Never commit real passwords to version control
 * - Always use environment variables for sensitive data
 * - Keep credentials in .env file (add to .gitignore)
 * 
 * To override these credentials, set environment variables:
 * - ITIBARI_USERNAME=your_email@example.com
 * - ITIBARI_PASSWORD=your_password
 * 
 * Example:
 * ITIBARI_USERNAME=test@example.com ITIBARI_PASSWORD=secure_password npm test
 */

export const devUser = {
    // Override with ITIBARI_USERNAME env var
    username: process.env.ITIBARI_USERNAME || 'd.chirchir@itibari.io',
    // Override with ITIBARI_PASSWORD env var
    password: process.env.ITIBARI_PASSWORD || 'ebb0'
}

export const prodUser = {
    username: process.env.ITIBARI_USERNAME || 'd.chirchir@itibari.io',
    password: process.env.ITIBARI_PASSWORD || 'ebb0'
}