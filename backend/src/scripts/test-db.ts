import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ DATABASE_URL is missing in backend/.env");
    process.exit(1);
  }

  try {
    const sql = neon(url);
    const [row] = await sql`SELECT current_database() as db, current_user as user, now() as time`;
    console.log("✅ Connected to Neon successfully");
    console.log(`   Database: ${row.db}`);
    console.log(`   User:     ${row.user}`);
    console.log(`   Time:     ${row.time}`);
    process.exit(0);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("❌ Connection failed:", msg);
    if (msg.includes("password authentication failed")) {
      console.error("\nFix: In Neon Console → your project → Connect → copy a NEW connection string");
      console.error("     Paste it into backend/.env as DATABASE_URL, then run: npm run db:setup");
    }
    process.exit(1);
  }
}

main();
