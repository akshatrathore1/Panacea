import hre from "hardhat";
import fs from "fs";

async function main() {
    console.log("Deploying SupplyChain contract...");

    // Get the ContractFactory and Signers here.
    const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
    const supplyChain = await SupplyChain.deploy();

    await supplyChain.waitForDeployment();

    const contractAddress = await supplyChain.getAddress();
    console.log("SupplyChain deployed to:", contractAddress);

    // Verify the contract on Etherscan (optional)
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("Waiting for block confirmations...");
        await supplyChain.deploymentTransaction().wait(6);

        console.log("Verifying contract...");
        try {
            await hre.run("verify:verify", {
                address: contractAddress,
                constructorArguments: [],
            });
        } catch (e) {
            console.log("Verification failed:", e.message);
        }
    }

    // Save contract address and ABI for frontend
    const contractData = {
        address: contractAddress,
        network: hre.network.name,
        chainId: hre.network.config.chainId
    };

    fs.writeFileSync(
        "./src/lib/contract-address.json",
        JSON.stringify(contractData, null, 2)
    );

    console.log("Contract data saved to src/lib/contract-address.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });