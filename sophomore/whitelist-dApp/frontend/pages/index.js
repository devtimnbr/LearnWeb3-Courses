import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import contractData from "../contractData";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  // create a ref to the web3 modal
  const web3ModalRef = useRef();

  // returns a signer or provider
  const getProviderOrSigner = async (needSigner = false) => {
    // open web3 modal and connect
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // check if user is connected to rinkeby
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }

    // return signer if needed
    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  // get number of whitelisted addresses
  const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const whitelistContract = new Contract(
        contractData.ADDRESS,
        contractData.ABI,
        provider
      );
      const _numberOfWhitelisted =
        await whitelistContract.numAddressesWhitelisted();

      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

  // Adds the current connected address to the whitelist
  const addAddressToWhitelist = async () => {
    try {
      // get signer because we need write access
      const signer = await getProviderOrSigner(true);
      console.log(signer);
      const whitelistcontract = new Contract(
        contractData.ADDRESS,
        contractData.ABI,
        signer
      );
      const tx = await whitelistcontract.addAddressToWhitelist();
      setLoading(true);
      // wait for tx to get mined
      await tx.wait();
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const checkIfAddressIsWhitelisted = async () => {
    try {
      // need signer cause we need access to read the address
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        contractData.ADDRESS,
        contractData.ABI,
        signer
      );
      const address = await signer.getAddress();
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      );
      setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);

      await checkIfAddressIsWhitelisted();
      await getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };

  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className={styles.description}>
            Thanks for joining the Whitelist!
          </div>
        );
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>;
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Whitelist
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
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
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}
