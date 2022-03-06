import { BigNumber, Contract } from "ethers";
import { ethers } from "ethers";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { NFT_COLLECTION_ABI, NFT_COLLECTION_ADDRESS, TOKEN_ABI, TOKEN_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";

export default function Home() {
  const zeroBn = BigNumber.from(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zeroBn);
  const [balanceOfTokens, setBalanceOfTokens] = useState(zeroBn);
  const [tokenAmount, setTokenAmount] = useState(zeroBn);
  const [tokensMinted, setTokensMinted] = useState(zeroBn);
  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new ethers.providers.Web3Provider(provider);

    // If user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };
  // checks the balance of tokens that can be claimed by the user
  const getTokensToBeClaimed = async () => {
    const provider = await getProviderOrSigner();
    const nftContract = new Contract(NFT_COLLECTION_ADDRESS, NFT_COLLECTION_ABI, provider);
    const tokenContract = new Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
    const signer = await getProviderOrSigner(true);
    const address = await signer.getAddress();
    const balance = await nftContract.balanceOf(address);
    if (balance === zeroBn) {
      setTokensToBeClaimed(zeroBn);
    } else {
      let amount = 0;
      for (let i = 0; i < balance; i++) {
        const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
        const claimed = await tokenContract.tokenIdsClaimed(tokenId);
        if (!claimed) {
          amount++;
        }
      }
      setTokensToBeClaimed(BigNumber.from(amount));
    }
    try {
    } catch (err) {
      console.error(err);
      setTokensToBeClaimed(zeroBn);
    }
  };

  // checks the balance of tokens held by an address
  const getBalanceOfTokens = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
      const signer = await getProviderOrSigner(true);
      const address = signer.getAddress();
      const balance = await tokenContract.balanceOf(address);
      setBalanceOfTokens(balance);
    } catch (err) {
      console.error(err);
      setBalanceOfTokens(zeroBn);
    }
  };

  // mint tokens
  const mintTokens = async (amount) => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
      // Each token is of `0.001 ether`. The value we need to send is `0.001 * amount`
      const value = 0.001 * amount;
      const tx = await tokenContract.mint(amount, {
        value: ethers.utils.parseEther(value.toString()),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Sucessfully minted Crypto Dev Tokens");
      await getBalanceOfTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (err) {
      console.error(err);
    }
  };

  // claim tokens
  const claimTokens = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
      const tx = await tokenContract.claim();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Sucessfully claimed Crypto Dev Tokens");
      await getBalanceOfTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (err) {
      console.error(err);
    }
  };

  // retrieves how many tokens have been minted till now out of total supply
  const getTotalTokensMinted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
      const tokensMinted = await tokenContract.totalSupply();
      setTokensMinted(tokensMinted);
    } catch (err) {
      console.error(err);
    }
  };

  // connects the metamask wallet
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getTotalTokensMinted();
      getBalanceOfTokens();
      getTokensToBeClaimed();
    }
  }, [walletConnected]);

  const renderButton = () => {
    // If we are currently waiting for something, return a loading button
    if (loading) {
      return (
        <div>
          <button className={styles.button}>Loading...</button>
        </div>
      );
    }
    // If tokens to be claimed are greater than 0, Return a claim button
    if (tokensToBeClaimed > 0) {
      return (
        <div>
          <div className={styles.description}>{tokensToBeClaimed * 10} Tokens can be claimed!</div>
          <button className={styles.button} onClick={claimTokens}>
            Claim Tokens
          </button>
        </div>
      );
    }
    // If user doesn't have any tokens to claim, show the mint button
    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder="Amount of Tokens"
            // BigNumber.from converts the `e.target.value` to a BigNumber
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
            className={styles.input}
          />
        </div>

        <button className={styles.button} disabled={!(tokenAmount > 0)} onClick={() => mintTokens(tokenAmount)}>
          Mint Tokens
        </button>
      </div>
    );
  };

  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="ICO-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs ICO!</h1>
          <div className={styles.description}>You can claim or mint Crypto Dev tokens here</div>
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                You have minted {ethers.utils.formatEther(balanceOfTokens)} Crypto Dev Tokens
              </div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                Overall {ethers.utils.formatEther(tokensMinted)}/10000 have been minted!!!
              </div>
              {renderButton()}
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          )}
        </div>
        <div>
          <img className={styles.image} src="./0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>Made with &#10084; by Crypto Devs</footer>
    </div>
  );
}
