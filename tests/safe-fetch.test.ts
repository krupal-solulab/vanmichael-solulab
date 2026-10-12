import { describe, expect, it } from "vitest";
import { assertPublicUrl, FetchBlocked } from "../src/lib/safe-fetch";

describe("assertPublicUrl", () => {
  it.each([
    "http://127.0.0.1/",
    "http://10.1.2.3/",
    "http://169.254.169.254/latest/meta-data",
    "http://192.168.0.10/",
    "http://[::1]/",
    "https://localhost/",
    "ftp://example.org/",
    "https://user:pass@example.org/",
    "https://example.org:8443/",
  ])("rejects %s", async (url) => {
    await expect(assertPublicUrl(url)).rejects.toBeInstanceOf(FetchBlocked);
  });

  it("accepts a public IP literal", async () => {
    await expect(assertPublicUrl("https://8.8.8.8/")).resolves.toBeInstanceOf(URL);
  });
});
