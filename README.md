# CINC Growth Desk

A responsive internal account-based marketing workspace for CINC. The approved visual language is recorded in DESIGN.md.

## First release

- RealTrends team portfolio with brokerage + website-platform + independent FUB filters, enrichment queue, transparent pilot fit score, and city-level clustered map.
- Complete historical client roster and evidence-based match review; unique verified team overlap remains distinct from account counts and current subscription status.
- Workbook-aligned Top 100 hit lists, campaign membership and participation, resource approval and segmentation, event calendar, buying committee, relationship evidence, research drafts, signals, and assigned next actions.
- CSV/XLSX Salesforce report import with column mapping, match preview, stable-ID upserts, stale-snapshot protection, unresolved-record linking, and deduplicated pipeline/win metrics.
- Branded server-validated password login with secure cookies, source-independent runtime secrets, shared R2 persistence, and optimistic concurrency checks.

## Data and privacy

No customer data, report exports, workbook bytes, or secrets belong in this repository. Runtime datasets reside in private storage and are returned only after authentication. Source spreadsheets are not edited. The Site remains owner-private in addition to the password gate. Initial data is uploaded once through an authenticated bootstrap endpoint; its temporary ingest secret should be removed after initial load.

The August 2026 client roster is a historical baseline, not evidence of present customer status. Geography uses GeoNames city centroids and aliases; ambiguous names are flagged. OpenStreetMap supplies visible map tiles with attribution. Production tile capacity should be assessed before wider rollout.

## Development

`npm run build` embeds the public web code/assets into a Cloudflare Worker ES module. `npm test` checks authentication, persistence conflicts, deterministic matching, scoring, and report accounting. `npm run dev` runs a local-only QA harness with temporary authentication; it is not bundled into the deployed Worker. Local fixtures go in ignored `.local/`.

Runtime keys: `PASSWORD_HASH` (SHA-256 of the workspace password), `SESSION_SECRET` (random signing secret), `INGEST_SECRET` (temporary bootstrap key). Configure through hosting secrets. Never put values in Git.

## Current limits

No live Salesforce, advertising, enrichment, or model integration. No automated messages are sent. Research drafts are deterministic templates and are labeled as such. Shared-password access does not implement individual roles or trustworthy user-level auditing. Settings scores are a pilot hypothesis rather than a learned propensity model. Reports are latest-state incremental upserts, not deletion-sync or period cohort attribution. Initial workbook data is loaded once; ongoing team/client workbook synchronization is a subsequent integration.

## Third-party assets

Noto Sans and Lucide licenses are in web/assets. Leaflet 1.9.4 (BSD-2-Clause), Leaflet.markercluster 1.5.3 (MIT), and SheetJS CE 0.18.5 (Apache-2.0) are self-hosted. GeoNames (CC BY) is credited in the map. OSM data is credited in the map tile layer.
