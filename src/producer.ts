import "dotenv/config";
import z from "zod";
import { boss, startBoss } from "./boss";

const emailPayload = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

async function main() {
  await startBoss();
  const data = emailPayload.parse({
    to: "user@example.com",
    subject: "Welcome!",
    body: "Thanks for signing up",
  });

  const jobId = await boss.send("email.send", data, {
    startAfter: "5 seconds", //tunda 5 detil
    retryLimit: 5, // maksimal 5 kali
    retryBackoff: true, // jeda makin lama tiap gagal, 2s -> 4s -> 8s ...
    retryDelay: 2, // (opsional) starting delay = 2s, dalam detik
  });
  console.log("Enqueued job:", jobId);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(0);
});
