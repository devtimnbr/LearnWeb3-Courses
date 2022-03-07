import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState, useRef, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();
  const [ens, setEns] = useState("");
  const [address, setAddress] = useState("");

  /**
   * Sets the ENS, if the current connected address has an associated ENS or else it sets
   * the address of the connected account
   */
  const setEnsOrAddress = async (address, web3Provider) => {
    const _ens = await web3Provider.lookupAddress(address);
    if (_ens) {
      setEns(_ens);
    } else {
      setAddress(address);
    }
  };

  const getSigner = async () => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new ethers.providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }

    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();
    await setEnsOrAddress(address, web3Provider);
    return signer;
  };

  const connectWallet = async () => {
    try {
      await getSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  // renders a button based on the state
  const renderButton = () => {
    if (walletConnected) {
      return <div>Wallet connected</div>;
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
        <title>ENS Dapp</title>
        <meta name="description" content="ENS-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to LearnWeb3 Punks {ens ? ens : address}!</h1>
          <div className={styles.description}>Its an NFT collection for LearnWeb3 Punks.</div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./learnweb3punks.png" />
        </div>
      </div>

      <footer className={styles.footer}>Made with &#10084; by LearnWeb3 Punks</footer>
    </div>
  );
}
