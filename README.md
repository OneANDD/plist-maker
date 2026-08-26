# Plist Maker

Plist Maker is a client-side utility that starts with an empty Apple OTA installation manifest based on the XML structure in `Test.plist.xml`. It generates the `.plist` locally in the browser and constructs an `itms-services://` link once you enter the public HTTPS URL where that downloaded manifest will be hosted. The reference values are available only as an optional in-app example; they are never prefilled into the blank template.

## What it creates

The generated manifest includes the three Apple OTA asset entries shown in the supplied reference: `software-package`, `display-image`, and `full-size-image`. It asks for the signed IPA URL, a public PNG/JPG icon URL, bundle identifier, bundle version, app name, and a chosen manifest filename.

> The tool creates a manifest file only. It does not sign the IPA, upload icons, host the `.plist`, or make a build eligible to install on a device. Use an appropriately signed IPA and a public HTTPS host for the IPA, icon, and final manifest.

## Local development

```bash
pnpm install
pnpm dev
```

Run the manifest verification suite with:

```bash
pnpm test
```

Create a production bundle with:

```bash
pnpm build
```

## Installation-link handoff

1. Download the generated manifest, for example `test.plist`.
2. Upload it to a public HTTPS address such as `https://example.com/test.plist`.
3. Paste that exact public URL in **Public manifest URL**.
4. Copy the generated `itms-services://?action=download-manifest&url=…` link and open it in Safari on the intended Apple device.

## Project boundaries

No form data, IPA files, or staged icons are uploaded by the application. Selecting an image only creates a temporary browser preview; its public URL must be provided separately for the generated plist.
