const xrpl = require("xrpl");

async function main() {
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  
  try {
    console.log("Connecting to XRPL Testnet...");
    await client.connect();
    console.log("Connected successfully");

    // Create a wallet from the seed
    const wallet = xrpl.Wallet.fromSeed("sEdS2yxZbrMdVvsyahEDMNNEBqeUe9w");
    console.log("Using address:", wallet.address);

    // Check account info
    const accountInfo = await client.request({
      command: "account_info",
      account: wallet.address,
      ledger_index: "validated"
    });
    console.log("Account Info:", JSON.stringify(accountInfo.result, null, 2));

    // Check trust lines
    const trustLines = await client.request({
      command: "account_lines",
      account: wallet.address,
      peer: "rNvCG24BCDsXFYM2FTzGQ7o8iXRXUdSuKr"
    });
    console.log("Trust lines:", JSON.stringify(trustLines.result, null, 2));

    // Prepare transaction
    const prepared = await client.autofill({
      "TransactionType": "Payment",
      "Account": wallet.address,
      "Destination": "rJM19kV37H7jeYyuun15gfpT6BJQbrAGE7",
      "Amount": {
        "currency": "CBN",
        "issuer": "rNvCG24BCDsXFYM2FTzGQ7o8iXRXUdSuKr",
        "value": "105"
      }
    });

    console.log("Prepared transaction:", JSON.stringify(prepared, null, 2));

    // Sign the transaction
    const signed = wallet.sign(prepared);
    console.log("Transaction signed. Hash:", signed.hash);

    // Submit the transaction
    console.log("Submitting transaction...");
    const submitResult = await client.submit(signed.tx_blob);
    console.log("Submit result:", JSON.stringify(submitResult, null, 2));

    if (submitResult.result.engine_result !== "tesSUCCESS") {
      console.log("Transaction submission failed:", submitResult.result.engine_result);
      return;
    }

    // Wait for validation
    console.log("Waiting for validation...");
    let attempts = 0;
    while (attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      const txResult = await client.request({
        command: "tx",
        transaction: signed.hash
      });
      
      if (txResult.result.validated) {
        console.log("Transaction validated!");
        console.log("Final transaction result:", JSON.stringify(txResult.result, null, 2));
        if (txResult.result.meta.TransactionResult === "tesSUCCESS") {
          console.log("Transaction successful!");
        } else {
          console.log("Transaction failed:", txResult.result.meta.TransactionResult);
        }
        return;
      }
      
      attempts++;
    }
    
    console.log("Transaction not validated after 10 attempts. It may still be in progress.");

  } catch (error) {
    console.error("An error occurred:", error);
    if (error.data) {
      console.error("Detailed error data:", JSON.stringify(error.data, null, 2));
    }
  } finally {
    client.disconnect();
    console.log("Disconnected from XRPL Testnet");
  }
}

main().catch(console.error);