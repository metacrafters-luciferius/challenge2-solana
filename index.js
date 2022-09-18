// Import Solana web3 functinalities
const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");

const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
      199, 3, 87, 88, 3, 32, 86, 58, 6, 127, 61,
      103, 85, 139, 212, 184, 129, 179, 6, 52, 165, 227,
      44, 143, 61, 122, 177, 182, 127, 68, 0, 169, 67,
      218, 155, 150, 25, 175, 106, 240, 213, 204, 24, 122,
      129, 108, 203, 51, 7, 8, 49, 215, 30, 168, 51,
      141, 152, 83, 142, 245, 203, 236, 197, 118,
    ],
);

// Get the wallet balance from a given private key
const printWalletBalances = async (connection, from, to) => {
  try {
    // Make a wallet (keypair) from privateKey and get its balance
    let walletBalance = await connection.getBalance(
        new PublicKey(from.publicKey),
    );
    let balance = parseInt(walletBalance) / LAMPORTS_PER_SOL;
    console.log(`From wallet balance: ${balance} SOL`);

    walletBalance = await connection.getBalance(
        new PublicKey(to.publicKey),
    );
    balance = parseInt(walletBalance) / LAMPORTS_PER_SOL;
    console.log(`To wallet balance: ${balance} SOL`);
  } catch (err) {
    console.log(err);
  }
};

const transferSol = async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Get Keypair from Secret Key
  const from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

  // Other things to try:
  // 1) Form array from userSecretKey
  // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
  // 2) Make a new Keypair (starts with 0 SOL)
  // const from = Keypair.generate();

  // Generate another Keypair (account we'll be sending to)
  const to = Keypair.generate();

  printWalletBalances(connection, from, to);

  // Aidrop 2 SOL to Sender wallet
  console.log("Airdopping some SOL to Sender wallet!");
  const fromAirDropSignature = await connection.requestAirdrop(
      new PublicKey(from.publicKey),
      2 * LAMPORTS_PER_SOL,
  );

  // Latest blockhash (unique identifer of the block) of the cluster
  const latestBlockHash = await connection.getLatestBlockhash();

  // Confirm transaction using the last valid block height (refers to its time)
  // to check for transaction expiration
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: fromAirDropSignature,
  });

  console.log("Airdrop completed for the Sender account");

  printWalletBalances(connection, from, to);

  // Send money from "from" wallet and into "to" wallet
  const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to.publicKey,
        lamports: LAMPORTS_PER_SOL / 100,
      }),
  );

  // Sign transaction
  const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [from],
  );
  console.log("Signature is ", signature);

  printWalletBalances(connection, from, to);
};

transferSol();
