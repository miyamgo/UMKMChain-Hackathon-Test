require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/lp4IXHZUYLSHRkXogpiUr",
      accounts: ["88c758fd080c8483069bbef9b5eaf9ffd5875877ee690e64e894b4203a2e5f81"] // JANGAN COMMIT KE GIT!
    }
  }
};