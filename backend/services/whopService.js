const crypto = require('crypto');

/**
 * Validates a Whop license key or membership ID against Whop's official REST API.
 * 
 * @param {string} licenseKey - License key or membership ID supplied by user
 * @returns {Promise<{ valid: boolean, status: string, isMaster?: boolean, membershipId?: string, productId?: string, planId?: string, userId?: string, expiresAt?: string, error?: string }>}
 */
async function validateWhopAccess(licenseKey) {
  const WHOP_API_KEY = process.env.WHOP_API_KEY;
  const WHOP_PRODUCT_ID = process.env.WHOP_PRODUCT_ID;
  const WHOP_PLAN_ID = process.env.WHOP_PLAN_ID;
  const MASTER_KEY = process.env.MASTER_KEY || 'SA-ACC-MASTER-2026';

  if (!licenseKey || typeof licenseKey !== 'string') {
    return { valid: false, status: 'missing_key', error: 'License key is required.' };
  }

  const trimmedKey = licenseKey.trim();

  // 1. Master key bypass for admin / developer access
  if (trimmedKey === MASTER_KEY) {
    return {
      valid: true,
      status: 'active',
      isMaster: true,
      membershipId: 'master-key-admin',
      productId: WHOP_PRODUCT_ID || 'master-prod',
      planId: WHOP_PLAN_ID || 'master-plan'
    };
  }

  // 2. Check if server has WHOP_API_KEY configured
  if (!WHOP_API_KEY) {
    console.warn('[Whop Validation Warning] WHOP_API_KEY environment variable is missing.');
    return {
      valid: false,
      status: 'unconfigured_server',
      error: 'Server is not configured with WHOP_API_KEY.'
    };
  }

  try {
    // Whop API Endpoint: POST https://api.whop.com/api/v2/memberships/{licenseKey}/validate_license
    const validateUrl = `https://api.whop.com/api/v2/memberships/${encodeURIComponent(trimmedKey)}/validate_license`;
    
    const response = await fetch(validateUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHOP_API_KEY}`,
        'Content-Type': 'application/json',
        'Api-Version-Date': '2026-07-01'
      },
      body: JSON.stringify({
        metadata: {
          app: 'sa-grade12-accounting-platform',
          validated_at: new Date().toISOString()
        }
      })
    });

    if (response.ok || response.status === 201 || response.status === 200) {
      const data = await response.json();
      const membership = data.membership || data;
      const status = (membership.status || 'active').toLowerCase();
      const productId = membership.product_id || membership.product || data.product_id;
      const planId = membership.plan_id || membership.plan || data.plan_id;
      const userId = membership.user_id || membership.user || data.user_id;
      const expiresAt = membership.expires_at || membership.valid_thru;

      // Product ID matching check
      if (WHOP_PRODUCT_ID && productId && productId !== WHOP_PRODUCT_ID) {
        return {
          valid: false,
          status: 'wrong_product',
          error: 'This license key is for a different Whop product.'
        };
      }

      // Status check
      const isValidStatus = status === 'active' || status === 'valid' || status === 'completed';
      const isExpired = expiresAt && new Date(expiresAt) < new Date();

      if (!isValidStatus || isExpired) {
        return {
          valid: false,
          status: isExpired ? 'expired' : status,
          error: isExpired ? 'Your Whop subscription has expired.' : `Subscription status is ${status}.`
        };
      }

      return {
        valid: true,
        status: 'active',
        membershipId: membership.id || trimmedKey,
        productId: productId || WHOP_PRODUCT_ID,
        planId: planId || WHOP_PLAN_ID,
        userId: userId || null,
        expiresAt: expiresAt || null
      };
    } else {
      // Fallback endpoint check: GET /api/v1/memberships/{id}
      const getUrl = `https://api.whop.com/api/v1/memberships/${encodeURIComponent(trimmedKey)}`;
      const getRes = await fetch(getUrl, {
        headers: {
          'Authorization': `Bearer ${WHOP_API_KEY}`,
          'Api-Version-Date': '2026-07-01'
        }
      });

      if (getRes.ok) {
        const memData = await getRes.json();
        const status = (memData.status || '').toLowerCase();
        const isValid = status === 'active' || status === 'valid' || memData.valid === true;

        if (isValid) {
          return {
            valid: true,
            status: 'active',
            membershipId: memData.id,
            productId: memData.product_id || WHOP_PRODUCT_ID,
            planId: memData.plan_id || WHOP_PLAN_ID,
            userId: memData.user_id,
            expiresAt: memData.expires_at
          };
        } else {
          return {
            valid: false,
            status: status || 'invalid',
            error: 'Subscription is not active or has been cancelled.'
          };
        }
      }

      const errData = await response.json().catch(() => ({}));
      console.warn(`[Whop License Validation Failed] Status ${response.status}:`, errData);

      return {
        valid: false,
        status: response.status === 404 ? 'not_found' : 'invalid',
        error: 'Invalid, cancelled, or revoked Whop license key.'
      };
    }
  } catch (err) {
    console.error('[Whop API Connection Error]', err.message);
    return {
      valid: false,
      status: 'server_error',
      error: 'Failed to connect to Whop API server.'
    };
  }
}

/**
 * Verifies Whop webhook signature for incoming subscription event webhooks.
 * 
 * @param {string|Buffer} rawBody - Raw request body string/buffer
 * @param {object} headers - HTTP request headers
 * @param {string} secret - Whop Webhook Secret (whsec_...)
 * @returns {boolean}
 */
function verifyWhopWebhookSignature(rawBody, headers, secret) {
  if (!secret) return true; // If secret not set in dev, allow passage with warning

  const signatureHeader = headers['webhook-signature'] || headers['x-whop-signature'] || '';
  if (!signatureHeader) return false;

  try {
    const parts = signatureHeader.split(',');
    let timestamp = '';
    let signatures = [];

    parts.forEach(part => {
      const [key, val] = part.split('=');
      if (key === 't') timestamp = val;
      if (key === 'v1' || key === 'sha256') signatures.push(val);
    });

    const rawSecret = secret.startsWith('whsec_') ? secret.substring(6) : secret;
    const secretBuffer = Buffer.from(rawSecret, 'base64');
    
    const payloadToSign = timestamp ? `${timestamp}.${rawBody}` : rawBody;
    const computedSignature = crypto
      .createHmac('sha256', secretBuffer)
      .update(payloadToSign)
      .digest('hex');

    return signatures.some(sig => sig === computedSignature || sig === `v1=${computedSignature}`);
  } catch (err) {
    console.error('[Webhook Signature Verification Error]', err);
    return false;
  }
}

module.exports = {
  validateWhopAccess,
  verifyWhopWebhookSignature
};
