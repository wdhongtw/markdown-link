import { generateLink, migration } from "./core.ts";

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

chrome.runtime.onInstalled.addListener(async (details) => {
    console.log(`Extension installed (reason: ${details.reason})`);

    try {
        await migration();
        console.log("Migration done");
    } catch (error) {
        console.error("Migration failed", error);
    }
});
