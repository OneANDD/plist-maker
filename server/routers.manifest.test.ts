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
