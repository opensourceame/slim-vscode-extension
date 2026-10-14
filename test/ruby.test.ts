// test the Ruby scanner used to lint - and = lines

import * as assert from "assert";
import { scanRuby } from "../src/slim.ruby";

describe("scanRuby", () => {
    it("finds unclosed strings", () => {
        assert.strictEqual(scanRuby('"unterminated').quote, '"');
        assert.strictEqual(scanRuby("name = 'unterminated").quote, "'");
    });

    it("ignores quotes inside other strings and escaped quotes", () => {
        assert.deepStrictEqual(scanRuby(`t("it's here")`), { quote: null, bracket: null });
        assert.deepStrictEqual(scanRuby(`'say "hi"'`), { quote: null, bracket: null });
        assert.deepStrictEqual(scanRuby(`"a \\" b" + 'it\\'s'`), { quote: null, bracket: null });
    });

    it("handles interpolation", () => {
        assert.deepStrictEqual(scanRuby('"#{name ? "yes" : "no"}"'), { quote: null, bracket: null });
        assert.strictEqual(scanRuby('"#{name}').quote, '"');
        assert.deepStrictEqual(scanRuby("'#{not interpolated'"), { quote: null, bracket: null });
    });

    it("ignores comments", () => {
        assert.deepStrictEqual(scanRuby("foo # it's (fine"), { quote: null, bracket: null });
    });

    it("finds unclosed and unmatched brackets", () => {
        assert.strictEqual(scanRuby("link_to(name, path").bracket, "(");
        assert.strictEqual(scanRuby('{ key: "value"').bracket, "{");
        assert.strictEqual(scanRuby("[1, 2").bracket, "[");
        assert.strictEqual(scanRuby("foo)").bracket, "(");
    });

    it("ignores brackets inside strings", () => {
        assert.deepStrictEqual(scanRuby('t("(see note")'), { quote: null, bracket: null });
    });

    it("scans code continued across lines", () => {
        assert.deepStrictEqual(scanRuby('link_to "Profile",\n  user_path(current_user),\n  class: "btn"'), { quote: null, bracket: null });
        assert.strictEqual(scanRuby("another_method(param1,\n  param2,\n  param3").bracket, "(");
    });
});
