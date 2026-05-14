---
label: Reports
icon: issue-opened
order: 50
description: How reports move from proof to staff decision.
image: ../static/patch-card-preview.svg
---

# Reports and staff review

Reports are for moments where something looks off and you have proof. Patch helps you hand it to staff in a tidy little bundle.

## What users do

>>> Run the command

```text
/report player:<name-or-id> proof:<image-or-video>
```

>>> Fill the form
Patch asks for a short reason and a longer "what happened" note.

Good reports are specific: who, what, when, and why the proof matters.

>>> Wait for staff
Patch sends the report to the configured staff channel. Staff can approve or decline.

>>> Read the DM
Patch DMs you when staff save the decision.
>>>

!!!tip Good proof
Short clips and clear screenshots are better than dramatic paragraphs. The proof is the cake; the note is the label on the box.
!!!

## What staff sees

Staff receives an embed with:

- Reported player name and ID
- Reporter mention
- Proof link and file type
- Short reason
- Details from the form
- Current ranked context when Patch can fetch it
- Approve and decline buttons

## What happens after review

| Decision | Reporter gets | Public effect |
| --- | --- | --- |
| Accepted | A DM saying the report checked out | Player can show `Community report` on `/stats` and `/profile` |
| Declined | A DM saying no action this time | No public report label is added |

## Ban watcher

Patch keeps an eye on accepted reports. On the hourly scheduled run, it checks a limited batch of accepted reports. If a reported player later appears banned in public data, Patch DMs the reporter so the loop closes neatly.

!!!info Quiet limits
Patch avoids checking the same accepted report too often and caps checks per run. That keeps the Worker calm and the report desk tidy.
!!!
