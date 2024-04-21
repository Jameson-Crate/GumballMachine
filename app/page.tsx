"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createPublicClient,
  createWalletClient,
  http,
  getContract,
  custom,
} from "viem";
import { sepolia } from "viem/chains";
import "viem/window";

// Import your contract's ABI
import GumballContract from "../contracts/gumball.sol/GumballMachine.json";

export default function Home() {
  const contractAddress = "0xC687C3371867b002b794B4EEB8A59b17a071131b"; // Replace with your contract's address
  const gumballABI = GumballContract.abi; // Extract the ABI from the imported JSON file

  const [contract, setContract] = useState(null);
  const [result, setResult] = useState(null);
  const [gumballs, setGumballs] = useState(BigInt("0"));
  const [message, setMessage] = useState("");

  useEffect(() => {
    const openContract = async () => {
      try {
        const [address] = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });

        const walletClient = createWalletClient({
          account: address,
          chain: sepolia,
          transport: custom((window as any).ethereum!),
        });

        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http(),
        });

        if (contract == null)
          // Set contract
          var inner: any = getContract({
            address: contractAddress,
            abi: gumballABI,
            client: { public: publicClient, wallet: walletClient },
          }) as any;
        setContract(inner);

        // Getting # of gumballs
        console.log("Calling getNumberGumballs");
        const result: any = await (inner as any).read.getNumberGumballs();
        setResult(result);
      } catch (error) {
        console.error("Error getting address:", error);
      }
    };

    openContract();
  }, []);

  return (
    <div className="grid justify-center content-center gap-1">
      <h1 className="mt-10">
        Number of Gumballs: {result ? Number(result) : "Loading..."}
      </h1>
      <Button
        className="mt-3"
        variant="outline"
        onClick={async () => {
          if (contract != null) {
            await (contract as any).write.getGumball();
            setMessage("Removing a gumball.");
          }
        }}
      >
        Get Gumball
      </Button>
      <Input
        type="number"
        className="mt-3"
        value={gumballs.toString()}
        onInput={(event) => setGumballs(BigInt((event.target as HTMLInputElement).value))}
      />
      <Button variant="outline" onClick={async () => {
        if (contract != null) {
          console.log("Calling addGumballs");
          var deposit: BigInt = gumballs as any;
          await (contract as any).write.addFreshGumballs([deposit]);
          setMessage("Adding gumballs to the machine.");
        };
        setGumballs(BigInt("0"));
      }}>
        Add Gumballs
      </Button>
      <h2 className="mt-3 text-red-600 text-center">{message}</h2>
    </div>
  );
}
