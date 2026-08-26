import { describe, expect, it } from "vitest";
import { buildHostedManifest, createInstallationLink, httpsOriginFromRequest, normalizedManifestName } from "./manifest";

const fields = {
  ipaUrl: "https://cdn.example.com/MyApp.ipa",
  iconUrl: "https://cdn.example.com/icon.png",
  bundleIdentifier: "com.example.myapp",
  bundleVersion: "1.0.0",
  appName: "My App",
  manifestName: "my-app",
};

describe("automatic manifest hosting helpers", () => {
  it("builds a reference-compatible plist and an encoded iOS installation link", () => {
    const manifest = buildHostedManifest(fields);
    const manifestUrl = "https://plistmaker.example/manus-storage/manifests/my-app_abcd1234.plist";

    expect(manifest).toContain('<string>software-package</string>');
    expect(manifest).toContain('<string>display-image</string>');
    expect(manifest).toContain('<string>full-size-image</string>');
    expect(manifest).toContain('<string>com.example.myapp</string>');
    expect(createInstallationLink(manifestUrl)).toBe(
      "itms-services://?action=download-manifest&url=https%3A%2F%2Fplistmaker.example%2Fmanus-storage%2Fmanifests%2Fmy-app_abcd1234.plist",
    );
  });

  it("uses HTTPS and a safe filename when deriving the hosted manifest address", () => {
    const request = { headers: { "x-forwarded-host": "plistmaker.example" } } as any;
    expect(httpsOriginFromRequest(request)).toBe("https://plistmaker.example");
    expect(normalizedManifestName(" My App.plist ")).toBe("My-App");
  });
});
