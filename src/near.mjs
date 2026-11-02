import { readFileSync } from "node:fs";
import { Account, JsonRpcProvider, actions, nearToYocto, yoctoToNear } from "near-api-js";

// Real NEAR testnet sender (near-api-js v7). The key file (.testnet-key.json)
// is gitignored and must never be committed: it holds the agent account's
// full-access key (testnet only).
export async function connectTestnet(keyPath = ".testnet-key.json") {
  const { accountId, privateKey } = JSON.parse(readFileSync(keyPath, "utf8"));
  const provider = new JsonRpcProvider({ url: "https://rpc.testnet.near.org" });
  const account = new Account(accountId, provider, privateKey);
  return {
    accountId,
    async balanceNear() {
      const state = await account.getState();
      return Number(yoctoToNear(state.balance.available.toString(), 4));
    },
    async send(receiverId, amountNear) {
      const outcome = await account.signAndSendTransaction({
        receiverId,
        actions: [actions.transfer(nearToYocto(String(amountNear)))],
      });
      return outcome.transaction.hash;
    },
  };
}
