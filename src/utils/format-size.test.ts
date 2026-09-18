import { formatSize } from "./format-size";

describe("formatSize", () => {
  it("formats bytes through terabytes", () => {
    expect(formatSize(0)).toBe("0 B");
    expect(formatSize(1024)).toBe("1 KB");
    expect(formatSize(1024 * 1024 * 1.8)).toBe("1.8 MB");
    expect(formatSize(1024 ** 3)).toBe("1 GB");
    expect(formatSize(1024 ** 4)).toBe("1 TB");
  });
});
