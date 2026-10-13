import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Budget is gone from the frontend screens and payloads", async () => {
    for (const file of ["pages/Project/Project.jsx", "pages/Project/ProjectSetting.jsx", "pages/Dashboard/KPI/KPI.jsx", "pages/Dashboard/portfolio/PortfolioOverview.jsx", "utils/portfolioStats.js"]) {
        const src = await read(file);
        assert.doesNotMatch(src, /costPerPoint|totalBudget|Budget burn|Total Budget|buildFinancePayload|projectFinance/, file);
        assert.doesNotMatch(src, /label[^\n]*>Budget</, file);
    }
});

test("Backlog table shows Status instead of Points and keeps every task", async () => {
    const src = await read("pages/Project/ProjectList.jsx");
    assert.match(src, />Status<\/th>/);
    assert.doesNotMatch(src, />Points<\/th>/);
    // no task is dropped from the list after Push to Board
    assert.doesNotMatch(src, /prev\.filter\(t => \(t\._id \|\| t\.id\) !== taskId\)/);
});
