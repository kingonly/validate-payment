import React from 'react';
import { useState } from 'react';
import bolt11 from 'bolt11';
import './App.css';
import { Buffer } from 'buffer';

window.Buffer = Buffer; // This is important for bolt11 to work

function App() {
  const [invoice, setInvoice] = useState('');
  const [preimage, setPreimage] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const validatePayment = async () => {
    try {
      setIsLoading(true);
      
      // Validate inputs
      if (!invoice.trim() || !preimage.trim()) {
        throw new Error('Please provide both invoice and preimage');
      }

      // Decode the BOLT11 invoice
      const decodedInvoice = bolt11.decode(invoice);
      const paymentHash = decodedInvoice.tags.find(tag => tag.tagName === 'payment_hash')?.data;
      
      if (!paymentHash) {
        throw new Error('Invalid invoice: payment hash not found');
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
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      validatePayment();
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>⚡ Lightning Payment Validator</h1>
        <div className="form-container">
          <textarea
            placeholder="Enter BOLT11 Invoice"
            value={invoice}
            onChange={(e) => setInvoice(e.target.value.replace(/[\s\n]+/g, ''))}
            onKeyDown={handleKeyPress}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Enter Payment Preimage"
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
      </header>
    </div>
  );
}

export default App;
