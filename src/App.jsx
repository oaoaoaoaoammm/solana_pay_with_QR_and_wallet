import React, { useCallback } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    WalletProvider,
    useWallet,
} from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import {
    PhantomWalletAdapter
} from '@solana/wallet-adapter-wallets';
import '@solana/wallet-adapter-react-ui/styles.css';

const App = () => {
    const network = WalletAdapterNetwork.Mainnet; // Use Devnet for testing (idi nahuy)
    const wallets = [
        new PhantomWalletAdapter(),
    ];

    return (
        <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
                <WalletMultiButton />
                <PayWithSolanaButton />
            </WalletModalProvider>
        </WalletProvider>
    );
};

const PayWithSolanaButton = () => {
    const { publicKey, sendTransaction } = useWallet();
    const connection = new Connection("", 'confirmed'); // rpc again

    const onClick = useCallback(async () => {
        if (!publicKey) {
            console.error('Wallet not connected!');
            return;
        }

        const recipient = new PublicKey(''); // your recipient public key SOLANA!!!!!!
        const amount = 0.01 * LAMPORTS_PER_SOL; // again amount 0.01 SOL 

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: recipient,
                lamports: amount,
            })
        );

        try {
            const signature = await sendTransaction(transaction, connection);
            const latestBlockhash = await connection.getLatestBlockhash();

            // Updated confirmTransaction call with new signature
            await connection.confirmTransaction({
                signature,
            }, 'processed');

            console.log('Transaction successful with signature:', signature);
        } catch (error) {
            console.error('Transaction failed:', error);
        }
    }, [publicKey, sendTransaction, connection]);

    return (
        <button onClick={onClick} disabled={!publicKey}>
            Pay with Solana
        </button>
    );
};


export default App;

