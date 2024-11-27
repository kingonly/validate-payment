# ⚡ Lightning Payment Validator

A simple web application that validates Lightning Network payments by verifying payment preimages against their corresponding invoices.

## 🌐 Live App

Check out the live application [here](https://validate-payment.com/).

## 🚀 Features

- Supports both BOLT11 and BOLT12 invoice formats
- Automatic invoice format detection
- Real-time validation feedback
- Clean and simple user interface
- URL parameter support for external use
## 🛠️ Technologies Used

- React.js
- light-bolt11-decoder
- bolt12-decoder

## 🏃‍♂️ Running Locally

1. Clone the repository:
```bash
git clone https://github.com/yourusername/validate-payment.git
```

2. Install dependencies:
```bash
cd validate-payment
npm install
```

3. Start the development server:
```bash
npm start
```

## 📝 Documentation

### URL Parameters
You can validate payments by passing parameters in the URL:
```
https://validate-payment.netlify.app/?invoice=<INVOICE>&preimage=<PREIMAGE>
```

Supports both BOLT11 and BOLT12 formats:
- BOLT11 invoices (starting with `lnbc` or `lntb`)
- BOLT12 invoices (starting with `lni`)

## 🤝 Contributing

We welcome contributions from the community.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/kingonly/validate-payment/blob/main/LICENSE) file for more information.
