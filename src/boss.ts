import PgBoss from "pg-boss";
import "dotenv/config";

export const boss = new PgBoss({
  connectionString: process.env.DATABASE_URL!,
  application_name: "email-boss",
});

export async function startBoss() {
  boss.on("error", (e) => console.error("[pg-boss]", e));
  await boss.start();
  await boss.createQueue("email.send");
}
