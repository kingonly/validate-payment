import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { decode as decodeBolt11 } from 'light-bolt11-decoder';
import BOLT12Decoder from 'bolt12-decoder';
import './App.css';
import { Buffer } from 'buffer';
import { Helmet } from 'react-helmet';

window.Buffer = Buffer; // This is important for bolt11 to work

function App() {
  const [invoice, setInvoice] = useState('');
  const [preimage, setPreimage] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentType, setPaymentType] = useState('bolt11');

  const validatePayment = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!invoice.trim() || !preimage.trim()) {
        throw new Error('Please provide both invoice and preimage');
      }

      let paymentHash;
      const trimmedInvoice = invoice.trim();
      
      // Auto-detect invoice type
      if (trimmedInvoice.startsWith('lnbc') || trimmedInvoice.startsWith('lntb')) {
        const decodedInvoice = decodeBolt11(invoice);
        paymentHash = decodedInvoice.sections.find(section => section.name === 'payment_hash')?.value;
      } else if (trimmedInvoice.startsWith('lni')) {
        const decodedInvoice = BOLT12Decoder.decode(invoice);
        paymentHash = decodedInvoice.paymentHash;  // Adjust based on actual BOLT12 structure
      } else {
        throw new Error('Invalid invoice format. Must start with "lnbc"/"lntb" (BOLT11) or "lni" (BOLT12)');
      }

      if (!paymentHash) {
        throw new Error(`Invalid ${paymentType.toUpperCase()}: payment hash not found`);
      }

      // Hash the preimage
      // Convert hex preimage to bytes first
      const preimageBytes = new Uint8Array(
        preimage.match(/.{1,2}/g)
          ?.map(byte => parseInt(byte, 16)) || []
      );
      const hashBuffer = await crypto.subtle.digest('SHA-256', preimageBytes);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Compare the hashes
      const isValid = hashHex === paymentHash;
      setValidationResult({
        success: isValid,
        message: isValid ? 'Payment successful! ✓' : 'Invalid preimage ✗'
      });
    } catch (error) {
      setValidationResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  }, [invoice, preimage, paymentType]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    const hasInvoice = params.has("invoice");
    const hasPreimage = params.has("preimage");
    
    if (hasInvoice) {
      setInvoice(params.get("invoice"));
    }

    if (hasPreimage) {
      setPreimage(params.get("preimage"));
    }

    if (hasInvoice && hasPreimage) {
      validatePayment();
    }
  }, [validatePayment]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      validatePayment();
    }
  };

  return (
    <div className="App">
      <Helmet>
        <title>Lightning Payment Validator</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
      </Helmet>
      
      <div className="App-header">
        <h1>
          <span className="logo">Lightning</span>
          Payment Validator
        </h1>
        <div className="form-container">
          <textarea
            placeholder="Enter Lightning Invoice"
            value={invoice}
            onChange={(e) => setInvoice(e.target.value.replace(/[\s\n]+/g, ''))}
            onKeyDown={handleKeyPress}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Enter Lightning Invoice Preimage"
            value={preimage}
            onChange={(e) => setPreimage(e.target.value.replace(/[\s\n]+/g, ''))}
            onKeyDown={handleKeyPress}
            className="input-field"
          />
          <button 
            onClick={validatePayment}
            disabled={isLoading}
            className="validate-button"
          >
            {isLoading ? 'Validating...' : 'Validate Payment'}
          </button>
          {validationResult && (
            <div className={`validation-result ${validationResult.success ? 'success' : 'error'}`}>
              {validationResult.message}
              {validationResult.success && (
                <p className="explanation">
                  The provided preimage cryptographically proves that the specified invoice has been successfully paid. Learn more {' '}
                <a
                  href="https://faq.blink.sv/blink-and-other-wallets/how-to-prove-that-a-lightning-invoice-was-paid"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  here
                </a>
                  .
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <footer className="footer">
        <p>
          <a href="https://github.com/kingonly/validate-payment" target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-github" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.54 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.83-.01-1.5-2.24.49-2.71-1.08-2.71-1.08-.36-.91-.88-1.15-.88-1.15-.72-.49.05-.48.05-.48.8.06 1.22.82 1.22.82.71 1.22 1.86.87 2.31.67.07-.51.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.58.82-2.14-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.56 7.56 0 0 1 8 2.5c.68 0 1.36.09 2 .26 1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.14 0 3.07-1.86 3.75-3.64 3.95.29.25.55.74.55 1.49 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38C13.71 14.54 16 11.54 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
