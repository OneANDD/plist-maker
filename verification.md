# Verification Record

## Visual review

The completed interface uses the Manifest Workshop direction: an asymmetric left workflow rail, warm paper surfaces, a folded cobalt document mark, restrained cobalt for action and readiness, a vermilion binding rule, and a dominant code-paper manifest artifact. The desktop layout displays the entire three-stage workflow and the output preview without clipping. The XML tags and line-number preview are visibly rendered after the review refinement.

## Functional review

The automated reference-manifest test suite passes. It verifies the required OTA asset entries (`software-package`, `display-image`, and `full-size-image`), reference bundle metadata, XML escaping, URL rules, and manifest filename normalization. TypeScript checking and the production bundle also pass.

## Deployment boundary

The interface now publishes a unique `.plist` to built-in storage when the user chooses **Publish & create install link**. It derives the public HTTPS manifest address from the live site origin, then creates the encoded `itms-services://` link. The signed IPA and icon must still be available through public HTTPS URLs before the resulting link can install on an Apple device.

## Automatic-hosting verification

The full test suite passes with four tests across three files. It covers reference plist structure, blank-template values, secure filename normalization, encoded installation-link construction, HTTPS-origin generation, and the publishing procedure’s storage contract. TypeScript checking and the production build also pass. The rendered interface shows the replacement of the manual manifest-URL field with a **Publish & create install link** action, an inactive install-link state before publication, and the copy–paste–Safari installation instructions after publication.
