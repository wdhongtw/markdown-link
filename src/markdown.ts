/** Escape characters that would break out of Markdown link text. */
export function escapeLinkText(text: string): string {
    return text.replace(/[\\\[\]]/g, "\\$&");
}

/** Percent-encode characters that would break out of a Markdown link destination. */
export function escapeLinkDestination(url: string): string {
    // encodeURIComponent leaves parentheses alone, so handle them explicitly.
    return url.replace(/[\s()<>]/g, (c) => {
        if (c === "(") return "%28";
        if (c === ")") return "%29";
        return encodeURIComponent(c);
    });
}

/** Build a Markdown inline link. */
export function formatLink(text: string, url: string): string {
    return "[" + escapeLinkText(text) + "](" + escapeLinkDestination(url) + ")";
}
