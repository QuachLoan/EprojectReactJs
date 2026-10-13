import test from "node:test";
import assert from "node:assert/strict";
import { validateNewPassword, validateChangePassword, validateReset, secondsLeft } from "./passwordForm.js";

test("validateNewPassword: required, length, confirmation", () => {
    assert.deepEqual(validateNewPassword("abcdef", "abcdef"), {});
    assert.ok(validateNewPassword("", "").newPassword);
    assert.ok(validateNewPassword("abc", "abc").newPassword);
    assert.ok(validateNewPassword("abcdef", "").confirm);
    assert.ok(validateNewPassword("abcdef", "abcdeg").confirm);
});

test("validateChangePassword: current password required and the new one must differ", () => {
    assert.deepEqual(validateChangePassword({ currentPassword: "oldpass", newPassword: "newpass", confirm: "newpass" }), {});
    assert.ok(validateChangePassword({ currentPassword: "", newPassword: "newpass", confirm: "newpass" }).currentPassword);
    assert.ok(validateChangePassword({ currentPassword: "samepass", newPassword: "samepass", confirm: "samepass" }).newPassword);
    assert.ok(validateChangePassword({ currentPassword: "oldpass", newPassword: "newpass", confirm: "other" }).confirm);
});

test("validateReset: the code must be exactly 6 digits", () => {
    assert.deepEqual(validateReset({ otp: "123456", newPassword: "newpass", confirm: "newpass" }), {});
    for (const otp of ["", "12345", "1234567", "12345a", undefined]) assert.ok(validateReset({ otp, newPassword: "newpass", confirm: "newpass" }).otp, String(otp));
});

test("secondsLeft never goes below 0", () => {
    assert.equal(secondsLeft(10_500, 10_000), 1);
    assert.equal(secondsLeft(9_000, 10_000), 0);
});
