import test from "node:test";
import assert from "node:assert/strict";
import { checklistProgress } from "./checklist.js";

test("no checklist -> null (no fake 0% or 100%)", () => {
    assert.equal(checklistProgress([]), null);
    assert.equal(checklistProgress(undefined), null);
    assert.equal(checklistProgress(null), null);
});

test("none, some and all items completed", () => {
    assert.deepEqual(checklistProgress([{ completed: false }, { completed: false }]), { done: 0, total: 2, percent: 0 });
    assert.deepEqual(checklistProgress([{ completed: true }, { completed: false }, { completed: false }, { completed: true }, { completed: false }]), { done: 2, total: 5, percent: 40 });
    assert.deepEqual(checklistProgress([{ completed: true }]), { done: 1, total: 1, percent: 100 });
});

test("toggling an item changes the result", () => {
    const before = [{ completed: true }, { completed: false }];
    const after = before.map((i, idx) => (idx === 1 ? { ...i, completed: true } : i));
    assert.equal(checklistProgress(before).percent, 50);
    assert.equal(checklistProgress(after).percent, 100);
});
