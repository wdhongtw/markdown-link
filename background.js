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
    title = tab.title;
    const storage = await chrome.storage.sync.get(null);
    for (index in storage.fieldsets) {
        regexUrl = new RegExp(storage.fieldsets[index].url, "gi");
        if (regexUrl.test(tab.url)) {
            regexSearch = new RegExp(storage.fieldsets[index].search, "gi");
            regexReplace = new RegExp(storage.fieldsets[index].replace, "i");
            if (regexSearch.test(title)) {
                title = title.replace(
                    regexSearch,
                    storage.fieldsets[index].replace
                );
                // we don't stop in case there are several rules
            }
        }
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
