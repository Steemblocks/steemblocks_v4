# 🔗 SteemBlocks v4

> **A modern, responsive Steem blockchain explorer built with React**

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](https://github.com/steemblocks/steemblocks_v4)

##  Overview

SteemBlocks v4 is a comprehensive blockchain explorer for the Steem network, providing real-time insights into blocks, transactions, witnesses, and community data. Built with modern web technologies and optimized for both desktop and mobile experiences.

##  Features

###  Core Functionality
- **Real-time Block Monitoring** - Live block updates with 3-second refresh intervals
- **Transaction Explorer** - Detailed transaction analysis and history
- **Account Search** - Comprehensive account information and activity
- **Witness Tracking** - Complete witness list with rankings and performance metrics

###  Advanced Analytics  
- **Power Holders** - Track top STEEM Power holders and distributions
- **Power Down Lists** - Monitor power-down activities and schedules  
- **Account Rankings** - Analyze account performance and statistics
- **Community Data** - Explore community growth and engagement metrics
- **Content History** - Track content changes and version history

###  Technical Features
- **Mobile-First Design** - Fully responsive across all devices
- **Steem Keychain Integration** - Secure authentication and wallet connectivity
- **Real-time Data Sync** - Live updates from multiple Steem APIs
- **Performance Optimized** - Code splitting and lazy loading
- **Production Ready** - Debug-free builds with automated cleanup

###  Latest Additions
- **Witness Monitor** - Advanced witness activity tracking (coming soon)
- **Enhanced Mobile Navigation** - Improved mobile user experience
- **Responsive Block Tables** - Optimized mobile layouts for better usability

##  Quick Start

### Prerequisites
- Node.js 16.x or later
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/steemblocks/steemblocks_v4.git
cd steemblocks-v4

# Install dependencies
npm install

# Start development server
npm start
```

The app will open in your browser at `http://localhost:3000`

### Production Build

```bash
# Build for production (automatically removes debug logs)
npm run build

# Build with manual cleanup
npm run build:production

# Serve production build locally
npm install -g serve
serve -s build
```

##  Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Auth/            # Authentication components
│   ├── Common/          # Shared components (Loading, Links)
│   ├── Layout/          # Layout components
│   └── Navbar/          # Navigation components
├── Pages/               # Main application pages
│   ├── Home/            # Dashboard with latest blocks
│   ├── Blocks/          # Block explorer
│   ├── WithnessList/    # Witness rankings
│   ├── WitnessMonitor/  # Witness monitoring (new)
│   ├── AccountResult/   # Account details
│   ├── PowerHolders/    # Power distribution
│   └── [other pages]/
├── context/             # React Context providers
├── styles/              # Global styles and variables
├── utills/              # Utility functions
└── Routes/              # Application routing
```

##  Responsive Design

SteemBlocks v4 features a mobile-first design approach:

- **Desktop** (1024px+): Full feature layout with sidebars
- **Tablet** (768px-1024px): Condensed navigation and optimized spacing  
- **Mobile** (320px-768px): Vertical stacking, touch-optimized interfaces

## 🔌 API Integrations

- **Steem API** (`api.steemit.com`) - Core blockchain data
- **SteemYY** (`api.steemyy.com`) - Witness rankings and analytics
- **SteemWorld** - Enhanced account data
- **CoinGecko** - Price data and market information

##  Built With

- **React 18.2** - UI framework with hooks and functional components
- **React Router v6** - Navigation and routing
- **Axios** - HTTP client for API requests
- **React Icons** - Comprehensive icon library
- **CSS Modules** - Scoped styling with custom properties
- **Material-UI** - Additional UI components

##  Design System

- **CSS Custom Properties** - Consistent theming and dark mode support
- **Gradient Accents** - Modern visual hierarchy
- **Responsive Grid** - Flexible layouts across devices
- **Animation Framework** - Smooth transitions and micro-interactions

##  Security Features

- **Steem Keychain Integration** - Secure key management
- **No Private Key Storage** - Client-side security best practices
- **HTTPS Enforcement** - Secure data transmission
- **XSS Protection** - Input sanitization and validation

##  Deployment

### Netlify (Recommended)
```bash
# Build the project
npm run build

# Deploy to Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

### Other Platforms
- **Vercel**: Connect your GitHub repo for automatic deployments
- **GitHub Pages**: Use `gh-pages` package for static hosting
- **Firebase Hosting**: Use Firebase CLI for deployment

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines
- Follow React best practices and hooks patterns
- Maintain mobile-first responsive design
- Keep components modular and reusable
- Write clean, documented code
- Test on multiple devices and browsers

##  Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/steemblocks_v4/issues) page
2. Create a new issue with detailed information
3. Join the Steem community for blockchain-related questions

##  Acknowledgments

- **Steem Community** - For the amazing blockchain ecosystem
- **Steem Keychain Team** - For secure wallet integration
- **API Providers** - SteemYY, SteemWorld, and others for data access
- **Open Source Contributors** - For the tools and libraries that made this possible

---

**Built with  for the Steem community**

*Star ⭐ this repository if you find it useful!*# steemblocks_v4
