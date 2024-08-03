function delay(t, val) {
    return new Promise((resolve) => setTimeout(resolve, t, val));
}

async function displayBadge(tab) {
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
    /** @type {string} */
    let title = tab.title;

    /** @type {Config} */
    const config = await chrome.storage.sync.get();
    for (const rule of config.rules) {
        regexUrl = new RegExp(rule.url);
        if (!regexUrl.test(tab.url)) continue;

        regexSearch = new RegExp(rule.search);
        if (!regexSearch.test(title)) continue;

        title = title.replace(regexSearch, rule.replace);
        break;
    }

    const link = "[" + title + "](" + tab.url + ")";

    // Avoid using navigator.clipboard, as it requires the document to be focused.
    function copyToClipboard(textToCopy) {
      const listener = (event) => {
        event.clipboardData.setData("text/plain", textToCopy);
        event.preventDefault();
      };

      document.addEventListener("copy", listener);
      document.execCommand("copy");
      document.removeEventListener("copy", listener);
    }
    copyToClipboard(link);
}

chrome.action.onClicked.addListener(function (tab) {
    displayBadge(tab);
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: tabToMarkdownLint,
        args: [tab],
    });
});

/**
 * @callback MigrateFunc
 * @param {Config} config
 * @return {Config}
 */

async function migration() {
    /** @type {MigrateFunc[]} */
    const steps = [
        (config) => {
            if (config.version !== undefined) {
                return config;
            }
            config.version = 1;
            config.rules = [];
            return config;
        },
    ];

    /** @type Config */
    const rawConfig = await chrome.storage.sync.get();
    const config = steps.reduce((config, step) => step(config), rawConfig);
    await chrome.storage.sync.set(config);
}

migration();
