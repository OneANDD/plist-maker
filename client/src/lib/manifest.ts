/**
 * Manifest data rules for the Plist Maker app. The interface uses the Manifest Workshop
 * visual system; these helpers keep the generated Apple OTA plist deterministic and inspectable.
 */
export type ManifestFields = {
  ipaUrl: string;
  iconUrl: string;
  bundleIdentifier: string;
  bundleVersion: string;
  appName: string;
  manifestName: string;
  manifestUrl: string;
};

export function escapeXml(value: string) {
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

export function normalizedManifestName(value: string) {
  const cleaned = value.trim().replace(/\.plist$/i, "").replace(/[^a-zA-Z0-9._-]/g, "-");
  return cleaned || "manifest";
}

export function buildManifest(fields: ManifestFields) {
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

export function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function isIpaUrl(value: string) {
  return isHttpsUrl(value) && /\.ipa(?:[?#]|$)/i.test(value);
}

export function isImageUrl(value: string) {
  return isHttpsUrl(value) && /\.(?:png|jpe?g)(?:[?#]|$)/i.test(value);
}
