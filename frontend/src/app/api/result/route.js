import { NextResponse } from "next/server";
import { appendFile } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

const LOG_FILE = process.env.RESULT_LOG_PATH ?? "./.ecoimpact/results.log";

async function ensureLogDir(filepath) {
  const directory = dirname(filepath);
  await mkdir(directory, { recursive: true });
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const result = String(payload?.result ?? "");

    const logEntry = JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        result,
      },
      null,
      2,
    );

    const filepath = join(process.cwd(), LOG_FILE);
    await ensureLogDir(filepath);
    await appendFile(filepath, `${logEntry}\n`, "utf8");

    console.info("[EcoImpact] Result logged", { result });

    return NextResponse.json({ status: "logged" });
  } catch (error) {
    console.error("[EcoImpact] Failed to log result", error);
    return NextResponse.json(
      { error: "Failed to log result" },
      { status: 500 },
    );
  }
}
