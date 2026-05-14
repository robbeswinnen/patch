export const PLAYER_TAG_IDS = [
  "verified",
  "developer",
  "creator",
  "competitive",
  "organizer",
] as const;

export type PlayerTagId = (typeof PLAYER_TAG_IDS)[number];

export type PlayerTagIcon =
  | "badge-check"
  | "code-2"
  | "clapperboard"
  | "swords"
  | "calendar-days";

export type PublicStatusIcon = PlayerTagIcon | "shield-alert" | "shield-check";

export type PlayerTagDefinition = {
  id: PlayerTagId;
  label: string;
  description: string;
  color: string;
  embedColor: number;
  icon: PlayerTagIcon;
  priority: number;
};

export type PublicPlayerStatus =
  | {
      kind: "report";
      label: "Community report";
      reportReason: string;
      color: string;
      embedColor: number;
      icon: "shield-alert";
    }
  | {
      kind: "tags";
      label: string;
      tags: PlayerTagDefinition[];
      color: string;
      embedColor: number;
      icon: PlayerTagIcon;
    }
  | {
      kind: "secure";
      label: "Secure";
      color: string;
      embedColor: number;
      icon: "shield-check";
    };

export const SECURE_STATUS_COLOR = "#11d1d6";
export const REPORT_STATUS_COLOR = "#ff3b30";

export const PLAYER_TAG_DEFINITIONS: PlayerTagDefinition[] = [
  {
    id: "verified",
    label: "Verified",
    description: "Known and trusted by the Patch team.",
    color: "#f6c945",
    embedColor: 0xf6c945,
    icon: "badge-check",
    priority: 10,
  },
  {
    id: "developer",
    label: "Developer",
    description: "Critical Ops developer.",
    color: "#c084fc",
    embedColor: 0xc084fc,
    icon: "code-2",
    priority: 20,
  },
  {
    id: "creator",
    label: "Creator",
    description: "Content creator.",
    color: "#f472b6",
    embedColor: 0xf472b6,
    icon: "clapperboard",
    priority: 30,
  },
  {
    id: "competitive",
    label: "Competitive",
    description: "Competitive player.",
    color: "#65d66e",
    embedColor: 0x65d66e,
    icon: "swords",
    priority: 40,
  },
  {
    id: "organizer",
    label: "Organizer",
    description: "Hosts official tournaments or events.",
    color: "#f59e0b",
    embedColor: 0xf59e0b,
    icon: "calendar-days",
    priority: 50,
  },
];

export const PLAYER_TAG_BY_ID = Object.fromEntries(
  PLAYER_TAG_DEFINITIONS.map((tag) => [tag.id, tag])
) as Record<PlayerTagId, PlayerTagDefinition>;

export function parsePlayerTagId(value: string | undefined) {
  return PLAYER_TAG_IDS.find((tagId) => tagId === value);
}

export function normalizePlayerTagIds(tags: readonly string[] | undefined) {
  const unique = new Set<PlayerTagId>();
  for (const tag of tags || []) {
    const tagId = parsePlayerTagId(tag);
    if (tagId) {
      unique.add(tagId);
    }
  }

  return Array.from(unique).sort(
    (a, b) => PLAYER_TAG_BY_ID[a].priority - PLAYER_TAG_BY_ID[b].priority
  );
}

export function playerTagDefinitions(tags: readonly string[] | undefined) {
  return normalizePlayerTagIds(tags).map((tagId) => PLAYER_TAG_BY_ID[tagId]);
}

export function formatTagList(tags: readonly string[] | undefined) {
  const labels = playerTagDefinitions(tags).map((tag) => tag.label);
  return labels.length > 0 ? labels.join(", ") : "None";
}

export function publicStatusFor(
  report: { reason: string } | undefined,
  tags: readonly string[] | undefined
): PublicPlayerStatus {
  if (report) {
    return {
      kind: "report",
      label: "Community report",
      reportReason: report.reason,
      color: REPORT_STATUS_COLOR,
      embedColor: 0xff3b30,
      icon: "shield-alert",
    };
  }

  const definitions = playerTagDefinitions(tags);
  if (definitions.length > 0) {
    const primary = definitions[0];
    return {
      kind: "tags",
      label: definitions.map((tag) => tag.label).join(", "),
      tags: definitions,
      color: primary.color,
      embedColor: primary.embedColor,
      icon: primary.icon,
    };
  }

  return {
    kind: "secure",
    label: "Secure",
    color: SECURE_STATUS_COLOR,
    embedColor: 0x11d1d6,
    icon: "shield-check",
  };
}
