// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// Exchange needs to mint and create LP tokens
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
    address public cryptoDevTokenAddress;

    constructor(address _CryptoDevToken) ERC20("CryptoDev LP Token", "CDLP") {
        require(_CryptoDevToken != address(0), "Token address passed is a null address");
        cryptoDevTokenAddress = _CryptoDevToken;
    }

    // returns balance of lp tokens
    function getReserve() public view returns (uint) {
        return ERC20(cryptoDevTokenAddress).balanceOf(address(this));
    }

    /* 
    * @dev Adds liquidity to the exchange
    */
    function addLiquidity(uint _amount) public payable returns (uint) {
        uint liquidity;
        uint ethBalance = address(this).balance;
        uint cryptoDevTokenReserve = getReserve();
        ERC20 cryptoDevToken = ERC20(cryptoDevTokenAddress);

        /* 
            If reserve empty, accept any supplied value because there is no ratio
        */
        if(cryptoDevTokenReserve == 0) {
            cryptoDevToken.transferFrom(msg.sender, address(this), _amount);
            liquidity = ethBalance;
            _mint(msg.sender, liquidity);
        } else {
            /* 
            * If the reserve is not empty, intake any user supplied value for
            * `Ether` and determine according to the ratio how many `Crypto Dev` tokens
            * need to be supplied to prevent any large price impacts because of the additional
            * liquidity
            */
            uint ethReserve = ethBalance - msg.value;
            // ratio should be maintained to prevent major price impacts
            uint cryptoDevTokensAmount = (msg.value * cryptoDevTokenReserve) / ethReserve;
            require(_amount >= cryptoDevTokensAmount, "Amount of tokens sent is less than the minimum tokens required");
            cryptoDevToken.transferFrom(msg.sender, address(this), cryptoDevTokensAmount);
            liquidity = (totalSupply() * msg.value) / ethReserve;
            _mint(msg.sender, liquidity);
        }
        return liquidity;
    }

    /**
    @dev Returns the amount Eth/Crypto Dev tokens that would be returned to the user in the swap
    @param _amount is amount of LP tokens
    */
    function removeLiquidity(uint _amount) public returns (uint, uint) {
        require(_amount > 0, "_amount should be greater than zero");
        uint ethReserve = address(this).balance;
        uint _totalSupply = totalSupply();

        uint ethAmount = (ethReserve * _amount) / _totalSupply;
        uint cryptoDevTokenAmount = (getReserve() * _amount) * _totalSupply;

        // Burn the sent LP tokens from the users wallet because they are sent to remove liquidity
        _burn(msg.sender, _amount);
        // Transfer ethAmount of eth from users wallet to contract
        payable(msg.sender).transfer(ethAmount);
        // Transfer cryptoDevTokenAmount of Crypo Dev tokens from users wallet to contract
        ERC20(cryptoDevTokenAddress).transfer(msg.sender, cryptoDevTokenAmount);
        return (ethAmount, cryptoDevTokenAmount);
    }

    /**
    @dev Returns the amount Eth/Crypto Dev tokens that would be returned to the user in the swap
    */
    function getAmountOfTokens(uint inputAmount, uint inputReserve, uint outputReserve) public pure returns (uint) {
        require(inputReserve > 0 && outputReserve > 0, "invalid reserves");
        // we charge a 1% fee
        uint inputAmountWithFee = inputAmount * 99;
        // Because we need to follow the concept of `XY = K` curve
        // We need to make sure (x + Δx)*(y - Δy) = (x)*(y)
        // so the final formulae is Δy = (y*Δx)/(x + Δx);
        // Δy in our case is `tokens to be recieved`
        // Δx = ((input amount)*99)/100, x = inputReserve, y = outputReserve
        // So by putting the values in the formulae you can get the numerator and denominator
        uint numerator = inputAmountWithFee * outputReserve;
        uint denominator = (inputReserve * 100) + inputAmountWithFee;
        return numerator / denominator;
    }

    /** 
    @dev Swaps Ether for CryptoDev Tokens
    @param _minTokens minimum output amount
    */
    function ethToCryptoDevToken(uint _minTokens) public payable {
        uint tokenReserve = getReserve();
        uint tokensBought = getAmountOfTokens(msg.value, address(this).balance - msg.value, tokenReserve);

        require(tokensBought >= _minTokens, "insufficient output amount");
        ERC20(cryptoDevTokenAddress).transfer(msg.sender, tokensBought);
    }

    /**
    @dev Swaps CryptoDev Tokens for ether
    @param _tokensSold amount of CryptoDev Tokens to be swapped for eth
    @param _minEth minimum output amount of eth tokens
    */
    function cryptoDevTokenToEth(uint _tokensSold, uint _minEth) public {
        uint tokenReserve = getReserve();
        uint ethBought = getAmountOfTokens(_tokensSold, tokenReserve, address(this).balance);

        require(ethBought >= _minEth, "insufficient output amount");
        ERC20(cryptoDevTokenAddress).transferFrom(msg.sender, address(this), _tokensSold);

        payable(msg.sender).transfer(ethBought);
    }
}