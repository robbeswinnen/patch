# Community tools

These commands help the whole server understand what is going on.

## `/help`

Use:

```text
/help
```

Patch shows:

- The player tools
- The community tools
- The support server
- Developer handles
- Ping and uptime

It is the command desk. Small, useful, no clipboard required.

## `/tags`

Use:

```text
/tags
```

Patch explains public profile labels:

| Label | Meaning |
| --- | --- |
| Secure | No accepted community report or curated tag |
| Community report | Staff accepted a proof-backed report |
| Verified | Known and trusted by the Patch team |
| Developer | Critical Ops developer |
| Creator | Content creator |
| Competitive | Competitive player |
| Organizer | Hosts official tournaments or events |

To apply for a tag, join the support server and open a ticket.

[!button text="Open support server" icon="comment-discussion" variant="primary" target="blank"](https://discord.gg/QW7CZczhT4)

## `/report`

Use:

```text
/report player:<name-or-id> proof:<image-or-video>
```

Patch checks that the proof is an image or video, opens a short report form, and sends the report to staff.

>>> Attach proof
Screenshots and clips work. Patch accepts common image and video formats.

>>> Add context
Write a short reason and explain what happened. Staff see both your proof and your note.

>>> Staff reviews
Staff can approve or decline. You get a DM when the decision is saved.

>>> Public status updates
If staff accept the report, `/stats` and `/profile` can show a `Community report` status with the public reason.
>>>

!!!danger Report cooldown
After sending a report, there is a 10 minute cooldown. This keeps staff from getting buried under repeat taps.
!!!

## Staff-only tools

Patch also has a developer-only `/dev` command. Regular users do not need it.

| Tool | What it does |
| --- | --- |
| `/dev remove-report` | Removes an accepted public report from a player |
| `/dev tag` | Adds or removes curated public tags |
| `/dev report-blacklist` | Pauses or restores a user's ability to submit reports |

Staff tools are private replies and require the configured developer Discord user ID.
