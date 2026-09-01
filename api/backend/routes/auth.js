// backend/routes/auth.js
const express = require('express');
const router = express.Router();

// Store encrypted key in backend (database, env var, or secure vault)
const ENCRYPTED_JFR_KEY = {
    "iv": "a4EroL5JUEgVloj1",
    "salt": "PtvozUTEvgxEqQUpQY3yyA==",
    "ciphertext": "ne2yiSgFCpDpDbjMmcW4wlNoFo2ogXbhH2sPHFup9SvlfRpay7PtKJnq1SJLdg2Pt9NHtDwf/+vncciJoKhzmxW53NuQA6X+BrTtXAhlMTI="
};

// Public endpoint - serves encrypted key (safe because it's encrypted)
router.get('/encrypted-key', (req, res) => {
    res.json({
        success: true,
        jfrKey: ENCRYPTED_JFR_KEY
    });
});

module.exports = router;
