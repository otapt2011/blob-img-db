// public/auth-module.js
var AuthModule = (function() {
    'use strict';

    // Configuration
    const CONFIG = {
        // Update this to your Vercel deployment URL or localhost
        backendUrl: typeof window !== 'undefined' && window.location.hostname === 'localhost'
            ? 'http://localhost:3000'
            : window.location.origin,
        encryptedKeyEndpoint: '/api/encrypted-key'
    };

    let cachedJfrKey = null;
    let jfrKeyPromise = null;

    /**
     * Fetch encrypted JFR key from backend
     * @returns {Promise<Object>} Encrypted JFR key object {iv, salt, ciphertext}
     */
    function fetchEncryptedKey() {
        // Return cached key if available
        if (cachedJfrKey) {
            return Promise.resolve(cachedJfrKey);
        }

        // Return existing promise if already fetching
        if (jfrKeyPromise) {
            return jfrKeyPromise;
        }

        // Create new fetch promise
        jfrKeyPromise = fetch(`${CONFIG.backendUrl}${CONFIG.encryptedKeyEndpoint}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: Failed to fetch encrypted key`);
                }
                return res.json();
            })
            .then(data => {
                if (!data.jfrKey) {
                    throw new Error('Invalid response: missing jfrKey');
                }
                cachedJfrKey = data.jfrKey;
                jfrKeyPromise = null;
                return cachedJfrKey;
            })
            .catch(err => {
                console.error('Error fetching encrypted key:', err);
                jfrKeyPromise = null;
                throw err;
            });

        return jfrKeyPromise;
    }

    /**
     * Clear cached key (useful for testing or key rotation)
     */
    function clearCache() {
        cachedJfrKey = null;
        jfrKeyPromise = null;
    }

    /**
     * Decrypt the JFR key with password
     * @param {string} password User's password
     * @returns {Promise<string>} Decrypted API key
     */
    async function unlockWithPassword(password) {
        try {
            // Fetch encrypted key from backend
            const jfrKey = await fetchEncryptedKey();

            // Decrypt using KeyEncryptor (already defined in your app.js)
            const decryptedKey = await KeyEncryptor.decrypt(jfrKey, password);

            return decryptedKey;
        } catch (err) {
            throw new Error(`Unlock failed: ${err.message}`);
        }
    }

    /**
     * Check if API key is stored in localStorage
     * @param {string} storageKey Storage key name
     * @returns {boolean}
     */
    function hasStoredKey(storageKey) {
        return !!localStorage.getItem(storageKey);
    }

    /**
     * Get stored API key from localStorage
     * @param {string} storageKey Storage key name
     * @returns {string|null}
     */
    function getStoredKey(storageKey) {
        return localStorage.getItem(storageKey);
    }

    /**
     * Store API key in localStorage
     * @param {string} storageKey Storage key name
     * @param {string} apiKey API key to store
     */
    function storeKey(storageKey, apiKey) {
        localStorage.setItem(storageKey, apiKey);
    }

    /**
     * Remove API key from localStorage
     * @param {string} storageKey Storage key name
     */
    function removeKey(storageKey) {
        localStorage.removeItem(storageKey);
    }

    return {
        fetchEncryptedKey,
        unlockWithPassword,
        hasStoredKey,
        getStoredKey,
        storeKey,
        removeKey,
        clearCache,
        config: CONFIG
    };
})();
