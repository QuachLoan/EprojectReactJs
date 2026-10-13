import test from "node:test";
import assert from "node:assert/strict";
import { notificationKey, loadReadKeys, markRead, pruneReadKeys, unreadOf } from "./notificationRead.js";

const memoryStorage = () => {
    const data = new Map();
    return { getItem: (k) => (data.has(k) ? data.get(k) : null), setItem: (k, v) => data.set(k, v) };
};

test("notificationKey: task + due day; a moved due date is a new notification", () => {
    assert.equal(notificationKey("t1", "2026-03-04T10:00:00Z"), "t1:2026-03-04");
    assert.notEqual(notificationKey("t1", "2026-03-04"), notificationKey("t1", "2026-03-05"));
    assert.equal(notificationKey("t1", "nonsense"), "t1:no-date");
});

test("markRead is per user and persists; unreadOf hides the read ones", () => {
    const storage = memoryStorage();
    markRead("u1", ["a:1"], storage);
    assert.deepEqual([...loadReadKeys("u1", storage)], ["a:1"]);
    assert.deepEqual([...loadReadKeys("u2", storage)], []);
    const items = [{ notifKey: "a:1" }, { notifKey: "b:1" }];
    assert.deepEqual(unreadOf(items, loadReadKeys("u1", storage)), [{ notifKey: "b:1" }]);
    markRead("u1", items.map((i) => i.notifKey), storage); // "view all"
    assert.deepEqual(unreadOf(items, loadReadKeys("u1", storage)), []);
});

test("pruneReadKeys keeps only keys of current notifications", () => {
    const storage = memoryStorage();
    markRead("u1", ["old:1", "a:1"], storage);
    assert.deepEqual([...pruneReadKeys("u1", ["a:1", "b:1"], storage)], ["a:1"]);
});

test("a blocked or corrupt storage never throws and shows everything as unread", () => {
    const broken = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
    assert.deepEqual([...loadReadKeys("u1", broken)], []);
    assert.deepEqual([...markRead("u1", ["a:1"], broken)], ["a:1"]);
    assert.deepEqual([...loadReadKeys("u1", { getItem: () => "{bad json" })], []);
});
