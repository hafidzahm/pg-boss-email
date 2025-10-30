import { startBoss, boss } from "./boss.ts";

await startBoss();

console.log("pg-boss started successfully");

// Keep the process alive
process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  await boss.stop();
  process.exit(0);
});
