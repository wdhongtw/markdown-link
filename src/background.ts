/** Translation rule for the link text. */
export interface Rule {

    /** Regular expression to match the URL. */
    url: string;

    /** Regular expression to match the title. */
    search: string;

    /** Replacement pattern for the matched title. */
    replace: string;
};

/** A generic key type to bind some type to ordinary string key. */
export class ConfigKey<T> {

    /** Unique identifier of the key */
    public id: string;

    constructor(id: string) {
        this.id = id;
    }
}

/** Version of entire configuration state. */
export const keyVersion = new ConfigKey<number>("version");

/** Translation rules. */
export const keyRules = new ConfigKey<Rule[]>("rules");

/** Type-safe wrapper around extension storage. */
export class ConfigStore {

    /** Get a value from storage, with fallback value. */
    async get<T>(key: ConfigKey<T>, fallback: T): Promise<T> {
        // Specify key to to a partial query.
        const result = await chrome.storage.sync.get({ [key.id]: fallback });
        return result[key.id] as T;
    }

    /** Set a value in storage. */
    async set<T>(key: ConfigKey<T>, value: T) {
        // Set is always a partial update.
        await chrome.storage.sync.set({ [key.id]: value });
    }
};

function delay<T>(t: number, val: T): Promise<T> {
    return new Promise((resolve) => setTimeout(resolve, t, val));
}

async function displayBadge(tab: chrome.tabs.Tab): Promise<void> {
    await chrome.action.setBadgeText({
        text: "Done",
        tabId: tab.id,
    });

    await delay(1500, null);
    await chrome.action.setBadgeText({
        text: "",
        tabId: tab.id,
    });
}

async function generateLink(url: string, title: string): Promise<string> {
    const store = new ConfigStore();

    const rules = await store.get(keyRules, []);
    for (const rule of rules) {
        const regexUrl = new RegExp(rule.url);
        if (!regexUrl.test(url)) continue;

        const regexSearch = new RegExp(rule.search);
        if (!regexSearch.test(title)) continue;

        title = title.replace(regexSearch, rule.replace);
        break;
    }

    return "[" + title + "](" + url + ")";
}

chrome.action.onClicked.addListener(function (tab) {
    if (!tab.id || tab.id === chrome.tabs.TAB_ID_NONE) {
        return;
    }

    copyMarkdownLink(tab);
});

async function copyMarkdownLink(tab: chrome.tabs.Tab): Promise<void> {
    const link = await generateLink(tab.url!, tab.title!);

    // Execute script in the tab to copy the link to clipboard.
    // The function and argument must be serializable.
    await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func: (...rest): void => {
            // `func` required to be () => void, load argument manually.
            const link = (rest as unknown[])[0] as string;

            // Clipboard is only available in tabs, not in background script.
            navigator.clipboard.writeText(link);
        },
        args: [link],
    });

    await displayBadge(tab);
}

/** Configuration schema of the extension. */
interface Config {

    /** Version of the configuration. */
    version: number;

    /** Translation rules. */
    rules: Rule[];
}

interface MigrateFunc {
    (config: Config): Config;
};

async function migration() {
    const steps: MigrateFunc[] = [
        (config) => {
            if (config.version >= 1) {
                return config;
            }
            config.version = 1;
            config.rules = [];
            return config;
        },
    ];

    const store = new ConfigStore();
    const initial: Config = {
        version: await store.get(keyVersion, 0),
        rules: await store.get(keyRules, []),
    };
    const result = steps.reduce((config, step) => step(config), initial);

    await Promise.all([
        store.set(keyVersion, result.version),
        store.set(keyRules, result.rules),
    ]);
}

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension started");

    migration();
    console.log("Migration done");
});
