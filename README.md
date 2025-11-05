# ChainSaver - Decentralized Transaction Manager

A modern, blockchain-based transaction manager that helps users track their daily expenses, set monthly savings goals, and compete with others on a leaderboard. Built as a college project demonstrating decentralized application (dApp) development.

## 🌟 Features

- **Blockchain Integration**: All transactions stored securely on Ethereum blockchain
- **MetaMask Wallet Connection**: Seamless Web3 authentication and interaction
- **Transaction Management**: Log income and expenses with categorization
- **Savings Goals**: Set and track monthly savings targets with visual progress
- **Leaderboard System**: Compete with other users based on savings performance
- **Real-time Analytics**: Interactive charts and spending breakdowns
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Smart Contract**: Fully decentralized data storage with Solidity

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for modern, responsive styling
- **Context API** for state management
- **Ethers.js** for blockchain interactions
- **Lucide React** for beautiful icons

### Blockchain
- **Solidity** smart contracts
- **Hardhat** development environment
- **Local Ethereum** testnet for development
- **MetaMask** wallet integration

### Features Implemented

#### Core Functionality
- ✅ Wallet connection and authentication
- ✅ Transaction logging with blockchain simulation
- ✅ Monthly savings goal setting and tracking
- ✅ Savings score calculation
- ✅ User leaderboard with rankings
- ✅ Category-based expense tracking

#### UI/UX Features
- ✅ Professional, blockchain-themed design
- ✅ Responsive layout for all devices
- ✅ Interactive charts and visualizations
- ✅ Real-time progress indicators
- ✅ Color-coded transaction categories
- ✅ Smooth animations and transitions

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension (optional - works without it)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd chainsaver
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Smart Contract Development

1. Compile contracts
```bash
npm run compile
```

2. Start local Hardhat network
```bash
npm run node
```

3. Deploy contracts to local network
```bash
npm run deploy:local
```

4. Run contract tests
```bash
npm run test:contracts
```

## 📱 Usage Guide

### Getting Started
1. **Connect Wallet**: Click "Connect MetaMask" (or use demo mode)
2. **Set Goals**: Navigate to Dashboard and set your monthly savings goal
3. **Log Transactions**: Use the "Add Transaction" tab to record income/expenses
4. **Track Progress**: Monitor your savings score on the dashboard
5. **Compete**: Check the leaderboard to see how you rank against others

### Transaction Categories
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Travel
- Investment
- Freelance
- Salary
- Other

### Savings Score Calculation
Your savings score is calculated as:
```
(Actual Savings ÷ Monthly Goal) × 100
```

Where Actual Savings = Total Income - Total Expenses

## 🎨 Design Features

### Visual Elements
- **Modern gradient backgrounds** with blockchain-inspired colors
- **Card-based layouts** for better content organization
- **Interactive hover states** and micro-animations
- **Progress bars** and visual indicators for goals
- **Color-coded categories** for easy identification
- **Professional typography** with proper contrast ratios

### Responsive Design
- **Mobile-first approach** with breakpoints at 768px and 1024px
- **Flexible grid layouts** that adapt to screen size
- **Touch-friendly interface** elements
- **Optimized navigation** for different devices

## 🔧 Technical Details

### Smart Contract Features
```solidity
contract ChainSaver {
    struct Transaction {
        uint256 id;
        address user;
        uint256 amount;
        string category;
        string description;
        uint256 timestamp;
        bool isIncome;
    }
    
    struct SavingsGoal {
        uint256 monthlyTarget;
        uint256 currentMonth;
        uint256 totalSaved;
    }
    
    // Core functions
    function addTransaction(...) external;
    function setSavingsGoal(...) external;
    function calculateSavingsScore(...) external view returns (uint256);
    function getLeaderboard(...) external view returns (...);
}
```

### State Management
- **Wallet Context**: Manages MetaMask connection and account info
- **Transaction Context**: Handles all transaction and savings goal data
- **Local Storage**: Persists wallet connection state
- **Mock Data**: Provides realistic demo experience

## 🔐 Security Features

- **MetaMask Integration**: Secure wallet connection
- **Transaction Verification**: Blockchain-based data integrity
- **Input Validation**: Client and contract-level validation
- **Error Handling**: Comprehensive error management
- **Gas Optimization**: Efficient smart contract design

## 🎯 Educational Value

This project demonstrates:
- **Full-stack dApp development** with React and Solidity
- **Web3 integration** patterns and best practices
- **Smart contract design** and deployment
- **Modern UI/UX** design principles
- **Responsive web development** techniques
- **State management** in complex applications

## 🔮 Future Enhancements

- Integration with real DeFi protocols
- Multi-token support (ERC-20 tokens)
- Advanced analytics and reporting
- Social features and community challenges
- Mobile app development
- Integration with popular expense tracking APIs

## 🤝 Contributing

This is a college project, but suggestions and improvements are welcome! Please feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is created for educational purposes. See LICENSE file for details.

## 👥 Team

ChainSaver was built as a comprehensive demonstration of modern dApp development, showcasing both frontend and blockchain development skills.

---

**Built with ❤️ for the decentralized future**