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
        message: isValid ? 'Payment verified! ✓' : 'Invalid preimage ✗'
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
