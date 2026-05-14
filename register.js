const fs = require("node:fs");
const path = require("node:path");

function loadDotEnv(file = ".env") {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    process.env[key] ||= value;
  }
}

loadDotEnv();

const applicationId = process.env.DISCORD_APPLICATION_ID;
const token = process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN;
const developerDiscordUserId = process.env.DEVELOPER_DISCORD_USER_ID;

const contexts = {
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const stringOption = {
  type: 3,
  required: true,
  min_length: 1,
  max_length: 64,
};

const attachmentOption = {
  type: 11,
  required: true,
};

const playerOption = {
  name: "player",
  description: "Critical Ops name or player ID.",
  ...stringOption,
};

const playerTagChoices = [
  { name: "Verified", value: "verified" },
  { name: "Developer", value: "developer" },
  { name: "Creator", value: "creator" },
  { name: "Competitive", value: "competitive" },
  { name: "Organizer", value: "organizer" },
  { name: "All tags", value: "all" },
];

const commands = [
  {
    name: "help",
    description: "Patch help, status, and community links.",
    type: 1,
    ...contexts,
  },
  {
    name: "stats",
    description: "Read a player's public stats in clean pages.",
    type: 1,
    options: [playerOption],
    ...contexts,
  },
  {
    name: "profile",
    description: "Generate a shareable player profile card.",
    type: 1,
    options: [playerOption],
    ...contexts,
  },
  {
    name: "compare",
    description: "Compare two players with current-season context.",
    type: 1,
    options: [
      { ...playerOption, name: "player1" },
      { ...playerOption, name: "player2" },
    ],
    ...contexts,
  },
  {
    name: "clan",
    description: "Look up a leaderboard clan by name or tag.",
    type: 1,
    options: [
      {
        name: "query",
        description: "Clan name or tag.",
        ...stringOption,
      },
    ],
    ...contexts,
  },
  {
    name: "track",
    description: "Track ranked changes and get weekly DM recaps.",
    type: 1,
    options: [playerOption],
    ...contexts,
  },
  {
    name: "tags",
    description: "Explain Patch account status tags.",
    type: 1,
    ...contexts,
  },
  {
    name: "report",
    description: "Send a player report to Patch staff for review.",
    type: 1,
    options: [
      playerOption,
      {
        name: "proof",
        description: "Image or video proof staff can review.",
        ...attachmentOption,
      },
    ],
    ...contexts,
  },
];

if (developerDiscordUserId) {
  commands.push({
    name: "dev",
    description: "Developer-only Patch tools.",
    type: 1,
    options: [
      {
        name: "remove-report",
        description: "Remove an accepted player report.",
        type: 1,
        options: [
          {
            ...playerOption,
          },
        ],
      },
      {
        name: "tag",
        description: "Assign or remove a public player tag.",
        type: 1,
        options: [
          {
            ...playerOption,
          },
          {
            name: "action",
            description: "Tag action.",
            type: 3,
            required: true,
            choices: [
              { name: "Add", value: "add" },
              { name: "Remove", value: "remove" },
            ],
          },
          {
            name: "tag",
            description: "Public tag to add or remove.",
            type: 3,
            required: true,
            choices: playerTagChoices,
          },
        ],
      },
      {
        name: "report-blacklist",
        description: "Add or remove a user from report submissions.",
        type: 1,
        options: [
          {
            name: "user",
            description: "Discord user ID to add or remove.",
            ...stringOption,
          },
          {
            name: "action",
            description: "Blacklist action.",
            type: 3,
            required: true,
            choices: [
              { name: "Add", value: "add" },
              { name: "Remove", value: "remove" },
            ],
          },
          {
            name: "reason",
            description: "Staff note for adding a blacklist entry.",
            type: 3,
            required: false,
            min_length: 3,
            max_length: 200,
          },
        ],
      },
    ],
    ...contexts,
  });
}

function requiredEnv(name, value) {
  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

async function main() {
  const route = `applications/${requiredEnv(
    "DISCORD_APPLICATION_ID",
    applicationId
  )}/commands`;
  const response = await fetch(`https://discord.com/api/v10/${route}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${requiredEnv("DISCORD_BOT_TOKEN or DISCORD_TOKEN", token)}`,
    },
    body: JSON.stringify(commands),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Failed to register commands:");
    console.error(data);
    process.exitCode = 1;
    return;
  }

  console.log("Commands registered:");
  console.log(data);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
