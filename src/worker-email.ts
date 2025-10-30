import "dotenv/config";
import { boss, startBoss } from "./boss";

// simpan jumlah percobaan per job.id (sementara di memori)
const attempts = new Map<string, number>();

async function sendEmail(to: string, subject: string, body: string) {
  // MOCK pengiriman email — ganti nanti dengan SMTP/SendGrid
  console.log(
    `[mailer] send -> to ${to} subject="${subject}" body="${body.slice(
      0,
      40
    )}..."`
  );
}

async function main() {
  await startBoss();
  // Worker akan ambil job dari queue 'email.send'
  // Ambil 5 job per polling, lalu proses paralel
  //   await boss.work("email.send", { batchSize: 5 }, async (jobs) => {
  //     await Promise.all(
  //       jobs.map(async (job) => {
  //         const { to, subject, body } = job.data as {
  //           to: string;
  //           subject: string;
  //           body: string;
  //         };
  //         await sendEmail(to, subject, body);
  //         // resolve = completed; throw error = akan di-retry oleh pg-boss (sesuai opsi di producer)
  //       })
  //     );
  //   });

  // batch 1 saja biar gampang lihat alurnya
  await boss.work("email.send", async ([job]) => {
    const { to, subject, body } = job?.data as {
      to: string;
      subject: string;
      body: string;
    };
    const n = (attempts.get(job?.id as string) ?? 0) + 1;
    attempts.set(job?.id as string, n);

    if (n < 3) {
      console.log(`[mailer] simulate fail #${n} for job ${job?.id}`);
      throw new Error("temporary SMTP error");
    }

    console.log(`[mailer] success on attempt #${n} for job ${job?.id}`);
    await sendEmail(to, subject, body);
    // [mailer] simulate fail #1 for job ...
    // [mailer] simulate fail #2 for job ...
    // (wait sebentar karena backoff)
    // [mailer] success on attempt #3 for job ...
    // [mailer] send -> to=...
  });
}

// jalankan
// Terminal A: npx tsx src/worker-email.ts
// Terminal B: npx tsx src/producer.ts
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
