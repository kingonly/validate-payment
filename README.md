# ⚡ Lightning Payment Validator

A simple web application that validates Lightning Network payments by verifying payment preimages against their corresponding invoices.

## 🌐 Live Demo

Visit the live application at: [https://validate-payment.vercel.app](https://validate-payment.vercel.app)

## 🚀 Features

- Supports both BOLT11 and BOLT12 invoice formats
- Automatic invoice format detection
- Real-time validation feedback
- Clean and simple user interface
- URL parameter support for easy sharing

## 🛠️ Technologies Used

- React.js
- light-bolt11-decoder
- bolt12-decoder
- Web Crypto API
- Vercel (deployment)

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
https://validate-payment.vercel.app/?invoice=<INVOICE>&preimage=<PREIMAGE>
```

Supports both BOLT11 and BOLT12 formats:
- BOLT11 invoices (starting with `lnbc` or `lntb`)
- BOLT12 invoices (starting with `lni`)

## 🤝 Contributing

We welcome contributions from the community! If you'd like to contribute to the project, please follow the steps below:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Commit your changes
5. Push your changes to your fork
6. Create a pull request

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/yourusername/validate-payment/blob/main/LICENSE) file for more information.
