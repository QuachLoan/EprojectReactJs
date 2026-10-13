import test from "node:test";
import assert from "node:assert/strict";
import { taskStatus, deleteBlockReason, sortBacklogTasks, isTodoColumnTitle } from "./backlog.js";

const columns = [{ _id: "c1", title: "Todo" }, { _id: "c2", title: "In Progress" }];

test("taskStatus: the column title of the board; no column = not on the board (never assumed Todo)", () => {
    assert.deepEqual(taskStatus({ columnId: "c2" }, columns), { onBoard: true, title: "In Progress" });
    assert.deepEqual(taskStatus({ columnId: { _id: "c1" } }, columns), { onBoard: true, title: "Todo" });
    assert.deepEqual(taskStatus({ columnId: null }, columns), { onBoard: false, title: null });
    assert.deepEqual(taskStatus({}, columns), { onBoard: false, title: null });
    assert.deepEqual(taskStatus({ columnId: "gone" }, columns), { onBoard: false, title: null });
});

test("deleteBlockReason: only Todo may be deleted", () => {
    assert.equal(deleteBlockReason({ onBoard: true, title: "Todo" }), "");
    assert.equal(deleteBlockReason({ onBoard: true, title: "To Do" }), "");
    assert.match(deleteBlockReason({ onBoard: true, title: "Done" }), /Done/);
    assert.ok(deleteBlockReason({ onBoard: false, title: null }));
    assert.equal(isTodoColumnTitle("Todos"), false);
});

test("sortBacklogTasks: by week, then creation time; pushed tasks stay in the list", () => {
    const sorted = sortBacklogTasks([
        { title: "c", week: 2, createdAt: "2026-01-01" },
        { title: "b", week: 1, createdAt: "2026-01-03" },
        { title: "a", week: 1, createdAt: "2026-01-02" },
        { title: "d" }, // no week = week 1
    ]);
    assert.deepEqual(sorted.map((t) => t.title), ["d", "a", "b", "c"]);
    assert.equal(sorted.length, 4);
});
