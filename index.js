import { CloudWatchLogsClient, FilterLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";
import fs from "fs";

// ---------- CONFIGURE ----------
const REGION = "ap-south-1";
const LOG_GROUP_NAME = "/ecs/consumer-tsk"; // your log group name
const OUTPUT_FILE = "./cloudwatch-logs.txt";

// THis is for 15th Oct 2025, 12:00 PM to 12:40 PM IST
// const START_TIME = "2025-10-15T12:00:29.611+05:30";
// const END_TIME = "2025-10-15T12:40:29.611+05:30";


const START_TIME = "2025-10-14T12:00:29.611+05:30";
const END_TIME =  "2025-10-15T12:00:29.611+05:30";
// --------------------------------

const client = new CloudWatchLogsClient({ region: REGION });

async function getLogs() {
  const startTime = new Date(START_TIME).getTime();
  const endTime = new Date(END_TIME).getTime();

  const allLines = [];
  let nextToken;

  try {
    console.log(`📜 Fetching logs from ${LOG_GROUP_NAME}...`);
    console.log(`🕒 Time range: ${START_TIME} → ${END_TIME}`);

    do {
      const command = new FilterLogEventsCommand({
        logGroupName: LOG_GROUP_NAME,
        startTime,
        endTime,
        filterPattern: "", // optional, e.g. "ERROR"
        nextToken,
        limit: 10000,
      });

      const response = await client.send(command);

      if (response.events && response.events.length) {
        response.events.forEach((event) => {
          const line = `[${new Date(event.timestamp).toISOString()}] ${event.message.trim()}`;
          allLines.push(line);
        });
        console.log(`Fetched ${response.events.length} logs... total: ${allLines.length}`);
      }

      nextToken = response.nextToken;
    } while (nextToken);

    // Join all lines with newline and save
    fs.writeFileSync(OUTPUT_FILE, allLines.join("\n"));
    console.log(`✅ Saved ${allLines.length} log lines to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error("❌ Error fetching logs:", error);
  }
}

getLogs();
