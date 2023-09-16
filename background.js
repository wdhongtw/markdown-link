// Function to get the current tab
async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

async function displayBadge(tab) {
    // Display badge text
    chrome.action.setBadgeText({
        text: 'Done',
        tabId: tab.id
    });
    var clear_callback = function () {
        chrome.action.setBadgeText({
            text: '',
            tabId: tab.id
        });
    };
    setTimeout(clear_callback, 1500);
}

async function tabToMarkdownLint(tab) {
    title = tab.title;
    chrome.storage.sync.get(null, (storage) => {
        for (index in storage.fieldsets) {
            regexUrl = new RegExp(storage.fieldsets[index].url, 'gi');
            if (regexUrl.test(tab.url)) {
                regexSearch = new RegExp(storage.fieldsets[index].search, 'gi');
                regexReplace = new RegExp(storage.fieldsets[index].replace, 'i');
                if (regexSearch.test(title)) {
                    title = title.replace(regexSearch, storage.fieldsets[index].replace);
                    // we don't stop in case there are several rules
                }
            }
        }

        var link = '[' + title + '](' + tab.url + ')';

        let input = document.createElement('textarea');
        document.body.appendChild(input);
        input.value = link;
        input.focus();
        input.select();
        document.execCommand('copy');
        input.remove();
    });

}

// Listen for click event
chrome.action.onClicked.addListener(function (tab) {
    regexExclude = new RegExp('^chrome://.*', 'gi');
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

// Listen for hotkey shortcut command
chrome.commands.onCommand.addListener((_execute_action) => {

    // Callback to wait for chrome to get the current tab and then pass the tab into the injection script for copying to clipboard
    getCurrentTab().then(function (tab) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: tabToMarkdownLint,
            args: [tab],
        });
    });

});
