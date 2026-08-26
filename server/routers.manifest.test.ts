import { describe, expect, it, vi } from "vitest";

const { mockStoragePut } = vi.hoisted(() => ({ mockStoragePut: vi.fn() }));

vi.mock("./storage", () => ({ storagePut: mockStoragePut }));

import { appRouter } from "./routers";

describe("manifest.publish", () => {
  it("stores a generated plist and returns the hosted HTTPS URL plus iOS installation link", async () => {
    mockStoragePut.mockResolvedValue({
      key: "manifests/my-app_a1b2c3d4.plist",
      url: "/manus-storage/manifests/my-app_a1b2c3d4.plist",
    });

    const caller = appRouter.createCaller({
      user: null,
      req: { headers: { host: "plistmaker.example" } },
      res: {},
    } as any);

    const result = await caller.manifest.publish({
      ipaUrl: "https://cdn.example.com/MyApp.ipa",
      iconUrl: "https://cdn.example.com/icon.png",
      bundleIdentifier: "com.example.myapp",
      bundleVersion: "1.0.0",
      appName: "My App",
      manifestName: "my-app",
    });

    expect(mockStoragePut).toHaveBeenCalledWith(
      "manifests/my-app.plist",
      expect.stringContaining("<string>com.example.myapp</string>"),
      "application/xml",
    );
    expect(result.manifestUrl).toBe("https://plistmaker.example/manus-storage/manifests/my-app_a1b2c3d4.plist");
    expect(result.installUrl).toContain("itms-services://?action=download-manifest&url=https%3A%2F%2Fplistmaker.example");
  });
});

describe("manifest.uploadIcon", () => {
  it("stores a validated icon and returns its public HTTPS address", async () => {
    mockStoragePut.mockResolvedValue({
      key: "icons/app-icon_1234abcd.png",
      url: "/manus-storage/icons/app-icon_1234abcd.png",
    });
    const caller = appRouter.createCaller({
      user: null,
      req: { headers: { host: "plistmaker.example" } },
      res: {},
    } as any);
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]).toString("base64");

    const result = await caller.manifest.uploadIcon({ contentBase64: png, mimeType: "image/png" });

    expect(mockStoragePut).toHaveBeenLastCalledWith("icons/app-icon.png", expect.any(Buffer), "image/png");
    expect(result).toEqual({
      filename: "app-icon.png",
      iconUrl: "https://plistmaker.example/manus-storage/icons/app-icon_1234abcd.png",
    });
  });
});
