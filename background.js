async function displayBadge(tab) {
    // Display badge text
    chrome.action.setBadgeText({
        text: "Done",
        tabId: tab.id,
    });
    var clear_callback = function () {
        chrome.action.setBadgeText({
            text: "",
            tabId: tab.id,
        });
    };
    setTimeout(clear_callback, 1500);
}

async function tabToMarkdownLint(tab) {
    title = tab.title;
    chrome.storage.sync.get(null, (storage) => {
        for (index in storage.fieldsets) {
            regexUrl = new RegExp(storage.fieldsets[index].url, "gi");
            if (regexUrl.test(tab.url)) {
                regexSearch = new RegExp(storage.fieldsets[index].search, "gi");
                regexReplace = new RegExp(
                    storage.fieldsets[index].replace,
                    "i"
                );
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
    });
}

// Listen for click event
chrome.action.onClicked.addListener(function (tab) {
    regexExclude = new RegExp("^chrome://.*", "gi");
    if (!regexExclude.test(tab.url)) {
        displayBadge(tab);
        // Callback to wait for chrome to get the current tab and then pass the tab into the injection script for copying to clipboard
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: tabToMarkdownLint,
            args: [tab],
        });
    }
});
