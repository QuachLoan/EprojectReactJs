import test from "node:test";
import assert from "node:assert/strict";
import { addInvitee, removeInvitee, inviteAll } from "./inviteSelection.js";

const members = [{ userId: { email: "Bob@x.test" } }];

test("addInvitee: adds a valid email once, case-insensitive", () => {
    let r = addInvitee([], { email: "Ann@X.test", username: "Ann" }, members);
    assert.equal(r.error, "");
    assert.deepEqual(r.selected.map((s) => s.email), ["ann@x.test"]);
    r = addInvitee(r.selected, { email: "ann@x.test" }, members);
    assert.match(r.error, /already selected/);
    assert.equal(r.selected.length, 1);
});

test("addInvitee: refuses existing members and non-emails", () => {
    assert.match(addInvitee([], { email: "bob@x.test" }, members).error, /already a member/);
    assert.ok(addInvitee([], { email: "not an email" }, members).error);
    assert.ok(addInvitee([], {}, members).error);
});

test("removeInvitee removes one person only", () => {
    const sel = [{ email: "a@x.test" }, { email: "b@x.test" }];
    assert.deepEqual(removeInvitee(sel, "A@x.test").map((s) => s.email), ["b@x.test"]);
});

test("inviteAll: one request per person, in order, partial failures are reported per person", async () => {
    const calls = [];
    const result = await inviteAll([{ email: "a@x.test" }, { email: "b@x.test" }, { email: "c@x.test" }], async (email) => {
        calls.push(email);
        if (email === "b@x.test") throw new Error("User not registered");
    });
    assert.deepEqual(calls, ["a@x.test", "b@x.test", "c@x.test"]);
    assert.deepEqual(result.succeeded, ["a@x.test", "c@x.test"]);
    assert.deepEqual(result.failed, [{ email: "b@x.test", message: "User not registered" }]);
});
