const xrpl = require("xrpl");

// Example credentials
const wallet = xrpl.Wallet.fromSeed("sEdTonpXf2gpQ7X2eVnCn8afUYzfXuz") //this is the private key of rJM19kV37H7jeYyuun15gfpT6BJQbrAGE7

console.log(wallet.address) // this is the derived public key 


// Wrap code in an async function so we can use await
async function main() {

    // Define the network client
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
    await client.connect()
  
    // Prepare transaction -------------------------------------------------------
    const prepared = await client.autofill({
    "TransactionType": "TrustSet",  // this is the transaction type
    "Account": "rJM19kV37H7jeYyuun15gfpT6BJQbrAGE7",
    "LimitAmount": {
      "currency": "CBN",
      "issuer": "rNvCG24BCDsXFYM2FTzGQ7o8iXRXUdSuKr", //the private key of this issuer is sEdS2yxZbrMdVvsyahEDMNNEBqeUe9w
      "value": "1000000"
    }
  })


  const max_ledger = prepared.LastLedgerSequence
  console.log("Prepared transaction instructions:", prepared)
  console.log("Transaction cost:", xrpl.dropsToXrp(prepared.Fee), "XRP")
  console.log("Transaction expires after ledger:", max_ledger)

  // Sign prepared instructions ------------------------------------------------
  const signed = wallet.sign(prepared)
  console.log("Identifying hash:", signed.hash)
  console.log("Signed blob:", signed.tx_blob)
  // Submit signed blob --------------------------------------------------------

  try {
    const submit_result = await client.submitAndWait(signed.tx_blob)
    // submitAndWait() doesn't return until the transaction has a final result.
    // Raises XrplError if the transaction doesn't get confirmed by the network.
    // Does not handle disaster recovery.
    console.log("Transaction result:", submit_result)
  } catch(err) {
    console.log("Error submitting transaction:", err)
  }

  // Disconnect when done (If you omit this, Node.js won't end the process)
  client.disconnect()}
  
  

main()