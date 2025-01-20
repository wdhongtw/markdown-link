import type { Config } from "./options";

function delay<T>(t: number, val: T): Promise<T> {
    return new Promise((resolve) => setTimeout(resolve, t, val));
}

async function displayBadge(tab: chrome.tabs.Tab) {
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

async function tabToMarkdownLint(tab: chrome.tabs.Tab) {
    let title: string = tab.title!;

    const config = await chrome.storage.sync.get() as Config;
    for (const rule of config.rules) {
        const regexUrl = new RegExp(rule.url);
        if (!regexUrl.test(tab.url!)) continue;

        const regexSearch = new RegExp(rule.search);
        if (!regexSearch.test(title)) continue;

        title = title.replace(regexSearch, rule.replace);
        break;
    }

    const link = "[" + title + "](" + tab.url + ")";

    navigator.clipboard.writeText(link);
}

chrome.action.onClicked.addListener(function (tab) {
    displayBadge(tab);
    chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func: tabToMarkdownLint as unknown as () => void,
        args: [tab],
    });
});

interface MigrateFunc {
    (config: Config): Config;
};

async function migration() {
    const steps: MigrateFunc[] = [
        (config) => {
            if (config.version !== undefined) {
                return config;
            }
            config.version = 1;
            config.rules = [];
            return config;
        },
    ];

    const rawConfig: Config = await chrome.storage.sync.get() as Config;
    const config = steps.reduce((config, step) => step(config), rawConfig);
    await chrome.storage.sync.set(config);
}

migration();
