// Generated on 2025-09-15 10:20:56
/**
 * @module GeminiAPI
 * @description A module for interacting with the Gemini API.
 * @author Your Name (or Organization)
 * @version 1.0.0
 */

/**
 * Represents configuration options for the Gemini API.
 * @typedef {object} GeminiConfig
 * @property {string} apiKey - The API key for authentication.
 * @property {string} apiSecret - The API secret for authentication.
 * @property {string} [apiBaseUrl='https://api.gemini.com/v1'] - The base URL for the Gemini API.
 * @property {number} [timeout=10000] - Timeout in milliseconds for API requests.
 */

/**
 * @class GeminiAPI
 * @classdesc A class for interacting with the Gemini API.
 */
class GeminiAPI {
  /**
   * Creates a new GeminiAPI instance.
   * @param {GeminiConfig} config - Configuration options for the Gemini API.
   * @throws {Error} If API key or secret are missing.
   */
  constructor(config) {
    if (!config.apiKey) {
      throw new Error("API Key is required.");
    }
    if (!config.apiSecret) {
      throw new Error("API Secret is required.");
    }

    /**
     * @private
     * @type {string}
     */
    this.apiKey = config.apiKey;

    /**
     * @private
     * @type {string}
     */
    this.apiSecret = config.apiSecret;

    /**
     * @private
     * @type {string}
     */
    this.apiBaseUrl = config.apiBaseUrl || 'https://api.gemini.com/v1';

    /**
     * @private
     * @type {number}
     */
    this.timeout = config.timeout || 10000;
  }

  /**
   * Signs the API request using HMAC-SHA384.
   * @private
   * @param {string} payload - The payload to be signed.
   * @returns {string} The HMAC signature.
   */
  _signRequest(payload) {
    const crypto = require('crypto'); // Import crypto here, only when needed
    const hmac = crypto.createHmac('sha384', this.apiSecret);
    hmac.update(payload);
    return hmac.digest('hex');
  }

  /**
   * Makes an authenticated API request to the Gemini API.
   * @private
   * @async
   * @param {string} endpoint - The API endpoint to call.
   * @param {object} payload - The request payload.
   * @param {string} method - The HTTP method (GET, POST, etc.). Defaults to POST.
   * @returns {Promise<any>} The API response data.
   * @throws {Error} If the API request fails.
   */
  async _makeRequest(endpoint, payload, method = 'POST') {
    const url = `${this.apiBaseUrl}${endpoint}`;
    const nonce = Date.now();
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = this._signRequest(encodedPayload);

    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': 0, // Set to 0 for GET requests to avoid issues
      'X-GEMINI-APIKEY': this.apiKey,
      'X-GEMINI-PAYLOAD': encodedPayload,
      'X-GEMINI-SIGNATURE': signature,
      'X-GEMINI-NONCE': nonce,
    };

    const fetchOptions = {
      method,
      headers,
      timeout: this.timeout,
    };

    if (method !== 'GET') {
      fetchOptions.body = JSON.stringify(payload);
      headers['Content-Length'] = Buffer.byteLength(fetchOptions.body, 'utf8'); // Update Content-Length for POST/PUT
    } else {
        delete headers['Content-Type']; // Remove Content-Type for GET requests
    }

    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        let errorData = null;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          // If JSON parsing fails, use the text response
          errorData = await response.text();
        }

        throw new Error(`API request failed: ${response.status} - ${response.statusText}.  Details: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error during API request:", error);
      throw new Error(`API request failed: ${error.message}`);
    }
  }



  /**
   * Gets ticker information for a specific symbol.
   * @async
   * @param {string} symbol - The symbol to get ticker information for (e.g., 'BTCUSD').
   * @returns {Promise<any>} The ticker information.
   * @throws {Error} If the API request fails.
   */
  async getTicker(symbol) {
    try {
      return await this._makeRequest(`/ticker/${symbol}`, {}, 'GET');
    } catch (error) {
      console.error(`Failed to get ticker for ${symbol}:`, error);
      throw error; // Re-throw to allow the caller to handle the error.
    }
  }

   /**
   * Gets the order book for a specific symbol.
   * @async
   * @param {string} symbol - The symbol to get the order book for (e.g., 'BTCUSD').
   * @param {object} [options={}] - Optional parameters for the order book.
   * @param {number} [options.limit_bids] - Limit the number of bids returned.
   * @param {number} [options.limit_asks] - Limit the number of asks returned.
   * @param {boolean} [options.group] - Whether to group orders at the same price level.
   * @returns {Promise<any>} The order book data.
   * @throws {Error} If the API request fails.
   */
  async getOrderBook(symbol, options = {}) {
    const queryString = Object.entries(options)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const endpoint = `/book/${symbol}${queryString ? `?${queryString}` : ''}`;

    try {
      return await this._makeRequest(endpoint, {}, 'GET');
    } catch (error) {
      console.error(`Failed to get order book for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Gets the last trades for a specific symbol.
   * @async
   * @param {string} symbol - The symbol to get the trades for (e.g., 'BTCUSD').
   * @param {object} [options={}] - Optional parameters for the trades.
   * @param {number} [options.limit_trades] - Limit the number of trades returned.
   * @param {number} [options.since] - Only return trades since this timestamp.
   * @returns {Promise<any>} The trades data.
   * @throws {Error} If the API request fails.
   */
  async getTrades(symbol, options = {}) {
    const queryString = Object.entries(options)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const endpoint = `/trades/${symbol}${queryString ? `?${queryString}` : ''}`;

    try {
      return await this._makeRequest(endpoint, {}, 'GET');
    } catch (error) {
      console.error(`Failed to get trades for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Gets your available balances.
   * @async
   * @returns {Promise<any>} The account balances.
   * @throws {Error} If the API request fails.
   */
  async getBalances() {
    try {
      return await this._makeRequest('/balances', {});
    } catch (error) {
      console.error("Failed to get balances:", error);
      throw error;
    }
  }

  /**
   * Places a new order.
   * @async
   * @param {string} symbol - The symbol to trade (e.g., 'BTCUSD').
   * @param {string} side - 'buy' or 'sell'.
   * @param {string} amount - The amount to trade.
   