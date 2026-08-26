import { describe, expect, it } from "vitest";
import { decodeIconUpload } from "./iconUpload";

const pngBase64 = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]).toString("base64");
const jpegBase64 = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]).toString("base64");

describe("icon uploads", () => {
  it("accepts a PNG or JPG only when its declared type matches its image signature", () => {
    expect(decodeIconUpload({ contentBase64: pngBase64, mimeType: "image/png" })).toMatchObject({ extension: "png", contentType: "image/png" });
    expect(decodeIconUpload({ contentBase64: jpegBase64, mimeType: "image/jpeg" })).toMatchObject({ extension: "jpg", contentType: "image/jpeg" });
  });

  it("rejects a mismatched or non-image upload", () => {
    expect(() => decodeIconUpload({ contentBase64: pngBase64, mimeType: "image/jpeg" })).toThrow("does not match");
    expect(() => decodeIconUpload({ contentBase64: Buffer.from("not-an-image").toString("base64"), mimeType: "image/png" })).toThrow("not a valid PNG or JPG");
  });
});
