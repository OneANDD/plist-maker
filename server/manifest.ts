import type { Request } from "express";

export type PublishedManifestInput = {
  ipaUrl: string;
  iconUrl: string;
  bundleIdentifier: string;
  bundleVersion: string;
  appName: string;
  manifestName: string;
};

export function normalizedManifestName(value: string) {
  const cleaned = value.trim().replace(/\.plist$/i, "").replace(/[^a-zA-Z0-9._-]/g, "-");
  return cleaned || "manifest";
}

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

export function buildHostedManifest(fields: PublishedManifestInput) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>items</key>
  <array>
    <dict>
      <key>assets</key>
      <array>
        <dict>
          <key>kind</key>
          <string>software-package</string>
          <key>url</key>
          <string>${escapeXml(fields.ipaUrl.trim())}</string>
        </dict>
        <dict>
          <key>kind</key>
          <string>display-image</string>
          <key>url</key>
          <string>${escapeXml(fields.iconUrl.trim())}</string>
        </dict>
        <dict>
          <key>kind</key>
          <string>full-size-image</string>
          <key>url</key>
          <string>${escapeXml(fields.iconUrl.trim())}</string>
        </dict>
      </array>
      <key>metadata</key>
      <dict>
        <key>bundle-identifier</key>
        <string>${escapeXml(fields.bundleIdentifier.trim())}</string>
        <key>bundle-version</key>
        <string>${escapeXml(fields.bundleVersion.trim())}</string>
        <key>kind</key>
        <string>software</string>
        <key>title</key>
        <string>${escapeXml(fields.appName.trim())}</string>
      </dict>
    </dict>
  </array>
</dict>
</plist>`;
}

function firstHeaderValue(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.split(",")[0]?.trim();
}

export function httpsOriginFromRequest(req: Request) {
  const host = firstHeaderValue(req.headers["x-forwarded-host"]) ?? req.headers.host;
  if (!host || !/^[A-Za-z0-9.-]+(?::\d{1,5})?$/.test(host)) {
    throw new Error("Unable to create a public manifest address.");
  }
  return `https://${host}`;
}

export function createInstallationLink(manifestUrl: string) {
  return `itms-services://?action=download-manifest&url=${encodeURIComponent(manifestUrl)}`;
}
