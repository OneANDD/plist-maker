import { describe, expect, it } from "vitest";
import { buildManifest, isImageUrl, isIpaUrl, normalizedManifestName } from "./manifest";

const referenceValues = {
  ipaUrl: "https://github.com/OneANDD/Hi/releases/download/Hi/signed_T7k6v3qRLWiY.ipa",
  iconUrl: "https://github.com/OneANDD/Hi/releases/download/Hi/e34434c2-944e-478a-8e3b-79ee2baedb59.png",
  bundleIdentifier: "Hi.ham",
  bundleVersion: "5.0.2",
  appName: "Test",
  manifestName: "test",
  manifestUrl: "https://example.com/test.plist",
};

describe("Apple OTA plist creation", () => {
  it("recreates all required values from the supplied reference manifest", () => {
    const manifest = buildManifest(referenceValues);

    expect(manifest).toContain('<key>items</key>');
    expect(manifest).toContain('<string>software-package</string>');
    expect(manifest).toContain('<string>display-image</string>');
    expect(manifest).toContain('<string>full-size-image</string>');
    expect(manifest).toContain('<key>bundle-identifier</key>\n        <string>Hi.ham</string>');
    expect(manifest).toContain('<key>bundle-version</key>\n        <string>5.0.2</string>');
    expect(manifest).toContain('<key>title</key>\n        <string>Test</string>');
    expect(manifest).toContain(referenceValues.ipaUrl);
    expect(manifest.match(/<plist version="1.0">/g)).toHaveLength(1);
  });

  it("escapes XML values and enforces useful file address formats", () => {
    expect(buildManifest({ ...referenceValues, appName: 'A & B <"Test">' })).toContain("A &amp; B &lt;&quot;Test&quot;&gt;");
    expect(isIpaUrl("https://download.example.com/build.ipa?token=1")).toBe(true);
    expect(isIpaUrl("http://download.example.com/build.ipa")).toBe(false);
    expect(isImageUrl("https://cdn.example.com/icon.JPG")).toBe(true);
    expect(normalizedManifestName(" My App.plist ")).toBe("My-App");
  });
});
