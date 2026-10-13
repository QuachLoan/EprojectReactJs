import test from "node:test";
import assert from "node:assert/strict";
import { buildMilestoneLine, milestoneDateError, dayStamp } from "./milestoneLine.js";

const notes = [
    { _id: "n3", date: "2026-03-31", content: "Release" },
    { _id: "n1", date: "2026-03-01", content: "Kick-off" },
    { _id: "n2", date: "2026-03-16", content: "  Demo  " },
    { _id: "x", date: "2026-02-01", content: "before" },
    { _id: "y", date: "2026-05-01", content: "after" },
    { _id: "bad", date: "nonsense", content: "ignored" },
];

test("start/end come from the project; milestones are ordered by date and placed proportionally", () => {
    const line = buildMilestoneLine("2026-03-01T00:00:00.000Z", "2026-03-31", notes);
    assert.equal(line.ok, true);
    assert.equal(line.startKey, "2026-03-01");
    assert.equal(line.endKey, "2026-03-31");
    assert.deepEqual(line.markers.map((m) => [m.number, m.date, m.content]), [[1, "2026-03-01", "Kick-off"], [2, "2026-03-16", "Demo"], [3, "2026-03-31", "Release"]]);
    assert.deepEqual(line.markers.map((m) => Math.round(m.percent)), [0, 50, 100]);
    assert.equal(line.outside, 2);
    assert.equal(line.totalDays, 30);
});

test("no start / no end / reversed dates give a reason, never made-up dates", () => {
    assert.equal(buildMilestoneLine(null, "2026-03-31", []).ok, false);
    assert.equal(buildMilestoneLine("2026-03-01", undefined, []).ok, false);
    assert.match(buildMilestoneLine("2026-04-01", "2026-03-01", []).reason, /before/);
});

test("empty and one-day projects", () => {
    assert.deepEqual(buildMilestoneLine("2026-03-01", "2026-03-31", []).markers, []);
    assert.equal(buildMilestoneLine("2026-03-01", "2026-03-01", [{ _id: "a", date: "2026-03-01", content: "x" }]).markers[0].percent, 50);
});

test("milestones on the same day keep their creation order", () => {
    const line = buildMilestoneLine("2026-03-01", "2026-03-31", [{ _id: "a", date: "2026-03-05", content: "first" }, { _id: "b", date: "2026-03-05", content: "second" }]);
    assert.deepEqual(line.markers.map((m) => m.content), ["first", "second"]);
});

test("milestoneDateError: inside the project dates only", () => {
    assert.equal(milestoneDateError("2026-03-10", "2026-03-01", "2026-03-31"), "");
    assert.match(milestoneDateError("2026-02-10", "2026-03-01", "2026-03-31"), /before/);
    assert.match(milestoneDateError("2026-04-10", "2026-03-01", "2026-03-31"), /after/);
    assert.ok(milestoneDateError("", "2026-03-01", "2026-03-31"));
    assert.equal(typeof dayStamp("2026-03-10"), "number");
});
