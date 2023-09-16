function delay(t, val) {
    return new Promise((resolve) => setTimeout(resolve, t, val));
}

async function displayBadge(tab) {
    // Display badge text
    chrome.action.setBadgeText({
        text: "Done",
        tabId: tab.id,
    });

    await delay(1500, null);
    chrome.action.setBadgeText({
        text: "",
        tabId: tab.id,
    });
}

async function tabToMarkdownLint(tab) {
    /**
     * @type string
     */
    let title = tab.title;

    /**
     * @type Config
     */
    const config = await chrome.storage.sync.get();
    for (const rule of config.rules) {
        regexUrl = new RegExp(rule.url);
        if (!regexUrl.test(tab.url)) continue;

        regexSearch = new RegExp(rule.search);
        if (!regexSearch.test(title)) continue;

        title = title.replace(regexSearch, rule.replace);
        break;
    }

    var link = "[" + title + "](" + tab.url + ")";

    navigator.clipboard.writeText(link);
}

// Listen for click event
chrome.action.onClicked.addListener(function (tab) {
    displayBadge(tab);
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: tabToMarkdownLint,
        args: [tab],
    });
});
