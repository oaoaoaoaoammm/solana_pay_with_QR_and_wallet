import { Connection, PublicKey, Keypair, sendAndConfirmTransaction } from '@solana/web3.js';
import { encodeURL, createQR, findReference, FindReferenceError, validateTransfer, createTransfer } from '@solana/pay';
import BigNumber from 'bignumber.js';


let currentPaymentProcess = null; // Переменная для хранения текущего процесса создания платежа


async function create_payment() {
    // Variable to keep state of the payment status
    let paymentStatus = "";

    // Connecting to devnet for this example
    console.log('1. ✅ Establish connection to the network');
    const connection = new Connection("", 'confirmed');  // rpc 

    console.log('2. 🛍 Simulate a customer checkout \n');
    const recipient = new PublicKey(''); // recipient solana address
    const amount = new BigNumber(0.0005);  // amount to send 0.005 sol
    const reference = new Keypair().publicKey;
    const label = 'SSHR Payment';  // lable
    const message = 'Deposit 1 SOL';  // some message
    // you can add const memo = but idk for what so i deleted it

    console.log('3. 💰 Create a payment request link \n');
    const url = encodeURL({ recipient, amount, reference, label, message }); // but if you want to use memo, enter it here, don't forget
    console.log(url)
    

    // encode URL in QR code
    const qrCode = createQR(url, 200, 'black', 'white');
    // get a handle of the element
    const element = document.getElementById('qr-code');

        // Удаляем предыдущий QR-код (если он существует)
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }

    // append QR code to the element
    qrCode.append(element); 

    // Update payment status
    paymentStatus = 'pending';

    /**
     * Wait for payment to be confirmed
     *
     * When a customer approves the payment request in their wallet, this transaction exists on-chain.
     * You can use any references encoded into the payment link to find the exact transaction on-chain.
     * Important to note that we can only find the transaction when it's **confirmed**
     */
    console.log('\n5. Find the transaction');
    let signatureInfo;

    const { signature } = await new Promise((resolve, reject) => {
        /**
         * Retry until we find the transaction
         *
         * If a transaction with the given reference can't be found, the `findTransactionSignature`
         * function will throw an error. There are a few reasons why this could be a false negative:
         *
         * - Transaction is not yet confirmed
         * - Customer is yet to approve/complete the transaction
         *
         * You can implement a polling strategy to query for the transaction periodically.
         */
        const interval = setInterval(async () => {
            console.count('Checking for transaction...');
            try {
                signatureInfo = await findReference(connection, reference, { finality: 'confirmed' });
                console.log('\n 🖌  Signature found: ', signatureInfo.signature);
                clearInterval(interval);
                resolve(signatureInfo);
            } catch (error) {
                if (!(error instanceof FindReferenceError)) {
                    console.error(error);
                    clearInterval(interval);
                    reject(error);
                }
            }
        }, 4000);
    });

    // Update payment status
    paymentStatus = 'confirmed';

    /**
     * Validate transaction
     *
     * Once the `findTransactionSignature` function returns a signature,
     * it confirms that a transaction with reference to this order has been recorded on-chain.
     *
     * `validateTransactionSignature` allows you to validate that the transaction signature
     * found matches the transaction that you expected.
     */
    console.log('\n6. 🔗 Validate transaction \n');

    try {
        validateTransfer(connection, signature, { recipient, amount });

        // Update payment status
        paymentStatus = 'validated';
        console.log('✅ Payment validated');
        console.log('📦 Ship order to customer');
        currentPaymentProcess = null;
    } catch (error) {
        console.error('❌ Payment failed', error);
        currentPaymentProcess = null;
    }
}

export async function check_on_click_payment(){
    // Если уже есть активный процесс создания платежа, останавливаем его
    if (currentPaymentProcess !== null) {
        return
    }
    
    // Запускаем новый процесс создания платежа
    currentPaymentProcess = create_payment();
}