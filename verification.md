# Verification Record

## Visual review

The completed interface uses the Manifest Workshop direction: an asymmetric left workflow rail, warm paper surfaces, a folded cobalt document mark, restrained cobalt for action and readiness, a vermilion binding rule, and a dominant code-paper manifest artifact. The desktop layout displays the entire three-stage workflow and the output preview without clipping. The XML tags and line-number preview are visibly rendered after the review refinement.

## Functional review

The automated reference-manifest test suite passes. It verifies the required OTA asset entries (`software-package`, `display-image`, and `full-size-image`), reference bundle metadata, XML escaping, URL rules, and manifest filename normalization. TypeScript checking and the production bundle also pass.

## Deployment boundary

The interface now publishes a unique `.plist` to built-in storage when the user chooses **Publish & create install link**. It derives the public HTTPS manifest address from the live site origin, then creates the encoded `itms-services://` link. The signed IPA and icon must still be available through public HTTPS URLs before the resulting link can install on an Apple device.

## Automatic-hosting verification

The full test suite passes with four tests across three files. It covers reference plist structure, blank-template values, secure filename normalization, encoded installation-link construction, HTTPS-origin generation, and the publishing procedure’s storage contract. TypeScript checking and the production build also pass. The rendered interface shows the replacement of the manual manifest-URL field with a **Publish & create install link** action, an inactive install-link state before publication, and the copy–paste–Safari installation instructions after publication.

## GitHub Pages deployment

The initial Pages site used legacy branch publishing from the repository root and therefore rendered `README.md`. The project now contains a GitHub Actions Pages workflow that builds the frontend with the `/plist-maker/` base path and routes publishing requests to the live service. The first two workflow runs exposed pnpm setup errors; those were corrected. GitHub Actions run `33018327117` completed successfully with the build and deployment jobs both passing.

The subsequent route-specific Pages deployment also completed successfully, but visual verification showed that Wouter still selected the single-page fallback 404 component at `/plist-maker/`. The deployment artifact and static asset base are therefore working; the remaining correction is to make the application fallback render the home experience for GitHub Pages paths.

The final route-correction workflow, run `33018760067`, completed successfully from commit `d3a69d9822f3ab5e6904f5943c384660c1e3b860`. Immediately after that deployment, the Pages URL still loaded the older JavaScript bundle `index-BrZNARFQ.js`, which did not contain the route correction. This indicates GitHub Pages CDN propagation rather than a build failure; the deployed artifact needs a cache-busted URL check after propagation.

The cache-busted Pages URL rendered the full Plist Maker homepage, including the live-service asset URLs and automatic publishing controls. The plain URL continued to serve the older bundle even after a cache-bypassing reload, so the public root requires an explicit non-cached entry-point strategy rather than relying solely on propagation timing.

Subsequent plain-URL HTTP checks confirmed that GitHub Pages now serves the current entry document and references `assets/index-BWRkVmyV.js`. That current bundle contains the `/plist-maker/` route correction. The remaining stale 404 observed in the verification browser was its cached prior JavaScript bundle (`index-BrZNARFQ.js`), not the public GitHub Pages response.

A fresh verification browser session still loaded the stale `index-BrZNARFQ.js` bundle even though the GitHub main branch contains the corrected fallback routing. This requires checking browser-level persistence or replacing the stale entry document through a new Pages deployment identifier before the plain URL can be closed as verified.

After the GitHub Pages entry-document cache window expired, the plain URL `https://oneandd.github.io/plist-maker/` was verified directly in the browser without query parameters. It rendered the complete Plist Maker homepage, including its blank manifest workspace, automatic publish control, and hosted visual assets.

## Icon drag-and-drop upload

The passive icon preview panel has been replaced by a real PNG/JPG drop target. It supports clicking to browse or dropping an image directly, validates the selected image type and size before upload, securely stores the icon, and writes the returned public HTTPS URL into the icon field. Desktop and mobile screenshots confirm that the new uploader is visible and usable at both breakpoints. The upload validation unit tests and the router-level storage contract test cover valid PNG/JPG inputs, invalid/mismatched files, storage payload type, and returned hosted URL behavior.
