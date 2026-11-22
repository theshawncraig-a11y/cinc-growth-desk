# CINC Growth Desk Design Baseline


## Typography and color

Use the locally hosted Noto Sans files and the existing Lucide icons. Keep the large, tightly spaced page title, smaller descriptive text, and tabular digits for counts and scores.

| Role | Color |
| --- | --- |
| Text | `#192a42` |
| Secondary text | `#515e6c` |
| Navigation rail | `#f5f4f0` |
| Main surface | `#ffffff` |
| Borders | `#dce2e7` |
| Selection accent | `#006383` |
| Primary action | `#19324b` |

Use accent color for selection and status. Favor thin dividers, modest corner radii, and a clear hierarchy between primary and secondary actions.

## Desktop and mobile

- Desktop uses a compact header, account tables, and the persistent bottom navigation requested by Shawn. Keep the Overview metrics in one strip above the priority team and campaign sections.
- Keep bottom navigation and the More menu visible at every screen width, including team profiles and editors. Reserve safe-area space and keep content above the dock. At phone widths, use touch-sized navigation controls. In Team accounts, show readable rows with labeled values and touch sized controls. Open the team playbook in a full-height panel.
- Keep brokerage and platform filters together. Use the Keller Williams + Ylopo sample flow as the reference for going from a filtered account list to a sales playbook.

## Interface copy

Name the action directly, such as “Find a team,” “Plan campaign,” or “Add resource.” Show the source or missing dependency for metrics. Label sample data and draft resources clearly.

## Implementation

Use `dist/workspace.css` for shared visual styles and `dist/sales-enablement.css` for responsive and interaction styles. Reuse these patterns for new work. Confirm intentional deviations from the approved visual direction with Shawn.
