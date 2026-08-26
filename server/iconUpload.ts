const MAX_ICON_BYTES = 3 * 1024 * 1024;
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export type IconUpload = {
  contentBase64: string;
  mimeType: "image/png" | "image/jpeg";
};

function hasPngSignature(bytes: Buffer) {
  return PNG_SIGNATURE.every((value, index) => bytes[index] === value);
}

function hasJpegSignature(bytes: Buffer) {
  return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

export function decodeIconUpload(input: IconUpload) {
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(input.contentBase64)) {
    throw new Error("The icon file data is not valid base64.");
  }

  const bytes = Buffer.from(input.contentBase64, "base64");
  if (bytes.length === 0 || bytes.length > MAX_ICON_BYTES) {
    throw new Error("Choose a PNG or JPG icon smaller than 3 MB.");
  }

  const isPng = hasPngSignature(bytes);
  const isJpeg = hasJpegSignature(bytes);
  if (!isPng && !isJpeg) {
    throw new Error("The selected file is not a valid PNG or JPG image.");
  }
  if ((input.mimeType === "image/png" && !isPng) || (input.mimeType === "image/jpeg" && !isJpeg)) {
    throw new Error("The image type does not match the selected file.");
  }

  return {
    bytes,
    extension: isPng ? "png" : "jpg",
    contentType: isPng ? "image/png" : "image/jpeg",
  };
}
