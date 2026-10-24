import { test } from "node:test";
import * as assert from "node:assert/strict";

import { escapeLinkDestination, escapeLinkText, formatLink } from "../src/markdown.ts";

test("plain text is unchanged", () => {
    assert.equal(escapeLinkText("Example Domain"), "Example Domain");
});

test("brackets in text are escaped", () => {
    assert.equal(escapeLinkText("[WIP] Fix [bug]"), "\\[WIP\\] Fix \\[bug\\]");
});

test("backslash in text is escaped", () => {
    assert.equal(escapeLinkText("C:\\Users"), "C:\\\\Users");
});

test("trailing backslash cannot escape the closing bracket", () => {
    assert.equal(formatLink("foo\\", "https://example.com"), "[foo\\\\](https://example.com)");
});

test("plain URL is unchanged", () => {
    const url = "https://example.com/path?q=1&r=2#frag";
    assert.equal(escapeLinkDestination(url), url);
});

test("parentheses in URL are percent-encoded", () => {
    assert.equal(
        escapeLinkDestination("https://en.wikipedia.org/wiki/Foo_(bar)"),
        "https://en.wikipedia.org/wiki/Foo_%28bar%29",
    );
});

test("whitespace in URL is percent-encoded", () => {
    assert.equal(escapeLinkDestination("file:///a b\tc"), "file:///a%20b%09c");
    assert.equal(escapeLinkDestination("x\u00a0y"), "x%C2%A0y");
});

test("angle brackets in URL are percent-encoded", () => {
    assert.equal(escapeLinkDestination("https://example.com/<a>"), "https://example.com/%3Ca%3E");
});

test("existing percent-encoding is preserved", () => {
    const url = "https://example.com/a%20b";
    assert.equal(escapeLinkDestination(url), url);
});

test("formatLink escapes both text and URL", () => {
    assert.equal(
        formatLink("Foo (bar) [disambiguation]", "https://en.wikipedia.org/wiki/Foo_(bar)"),
        "[Foo (bar) \\[disambiguation\\]](https://en.wikipedia.org/wiki/Foo_%28bar%29)",
    );
});
