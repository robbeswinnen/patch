---
label: Player Tools
icon: person
order: 80
description: Profile cards, stats, comparisons, clans, and weekly tracking.
image: ../static/patch-card-preview.svg
---

# Player tools

These commands are for the "show me the player thing" moments.

=== :icon-patch-card: `/profile`
Use:

```text
/profile player:<name-or-id>
```

Patch sends a clean PNG card. It can show player identity, ranked shape, public status, curated tags, accepted reports, and a visible banned marker when public data says the account is banned.

Best for: sharing a player read quickly without asking everyone to squint at a wall of numbers.
=== :icon-patch-shield: `/stats`
Use:

```text
/stats player:<name-or-id>
```

Patch starts with the overview page, then lets you switch pages:

| Page     | What it explains                                                |
| -------- | --------------------------------------------------------------- |
| Overview | IGN, ID, level, clan, ranked now, account status, public status |
| Season   | Current season ranked, casual, and custom stats                 |
| All-Time | Public seasonal totals added together                           |

The public status area can show `Secure`, `Community report`, or curated tags.
=== :icon-patch-card: `/compare`
Use:

```text
/compare player1:<name-or-id> player2:<name-or-id>
```

Patch compares current-season ranked data:

- MMR
- Ranked K/D
- Ranked KDA
- Ranked win rate
- Kills per match

It also names the overall edge. Friendly debate fuel, not a lifetime crown.
=== ` /clan`
Use:

```text
/clan query:<name-or-tag>
```

Patch checks the public clan leaderboard and builds two pages:

| Page                            | What it shows                                                |
| ------------------------------- | ------------------------------------------------------------ |
| Overview                        | Rank, player count, total rating, average rating, quick read |
| Performance                     | Kills, deaths, assists, K/D, wins, losses, W/L, win rate     |
| === :icon-patch-watch: `/track` |
| Use:                            |

```text
/track player:<name-or-id>
```

Patch adds the player to your private watchlist and sends a ranked recap every Sunday at 18:00 Europe/Brussels.

The recap tracks kills, deaths, rating/MMR, rank, and level changes. You can track up to 25 players.
===

!!!info Old menu?
If a page menu says it is old, just run the command again. Patch likes fresh buttons.
!!!
