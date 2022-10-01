import { _convertMsToSpendTime, _convertPercentageText, getMondayOfLastWeek } from "@/makeSummary/utils";

describe("getMondayOfLastWeek", () => {
  it("2022-09-26(月)", () => {
    expect(getMondayOfLastWeek(new Date("2022-09-26"))).toEqual(new Date("2022-09-19"));
  });
  it("2022-09-27(火)", () => {
    expect(getMondayOfLastWeek(new Date("2022-09-27"))).toEqual(new Date("2022-09-19"));
  });
  it("2022-10-01(土)", () => {
    expect(getMondayOfLastWeek(new Date("2022-10-01"))).toEqual(new Date("2022-09-19"));
  });
  it("2022-10-02(日)", () => {
    expect(getMondayOfLastWeek(new Date("2022-10-02"))).toEqual(new Date("2022-09-19"));
  });
  it("2022-10-03(月)", () => {
    expect(getMondayOfLastWeek(new Date("2022-10-03"))).toEqual(new Date("2022-09-26"));
  });
});

describe("_convertMsToSpendTime", () => {
  it("1,000ms", () => {
    expect(_convertMsToSpendTime(1000)).toEqual("00:00:01");
  });
  it("10,000ms", () => {
    expect(_convertMsToSpendTime(10000)).toEqual("00:00:10");
  });
  it("100,000ms", () => {
    expect(_convertMsToSpendTime(100000)).toEqual("00:01:40");
  });
  it("1,000,000ms", () => {
    expect(_convertMsToSpendTime(1000000)).toEqual("00:16:40");
  });
  it("10,000,000ms", () => {
    expect(_convertMsToSpendTime(10000000)).toEqual("02:46:40");
  });
  it("100,000,000ms", () => {
    expect(_convertMsToSpendTime(100000000)).toEqual("27:46:40");
  });
  it("1,000,000,000ms", () => {
    expect(_convertMsToSpendTime(1000000000)).toEqual("277:46:40");
  });
});

describe("_convertPercentageText", () => {
  it("1%", () => {
    expect(_convertPercentageText(1, 100)).toEqual("1%");
  });
  it("10%", () => {
    expect(_convertPercentageText(10, 100)).toEqual("10%");
  });
  it("100%", () => {
    expect(_convertPercentageText(100, 100)).toEqual("100%");
  });
});
