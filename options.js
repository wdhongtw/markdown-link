/**
 * @typedef {Object} Rule
 * @property {string} url
 * @property {string} search
 * @property {string} replace
 */

/**
 * @typedef {Object} Config
 * @property {Rule[]} rules
 * @property {number} version
 */

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

async function initApplication() {
    // Elements

    /** @type {HTMLElement} */
    const ruleContainer = document.getElementById("list-of-rule");
    /** @type {HTMLElement} */
    const ruleTemplate = document.getElementById("rule-template");

    const buttonReset = document.getElementById("load-defaults-button");
    const buttonAdd = document.getElementById("add-button");
    const buttonSave = document.getElementById("save-button");
    const notificationSaved = document.getElementById("saved-notification");

    // Initialization
    await (async () => {
        await migration();

        /** @type Config */
        const config = await chrome.storage.sync.get();
        setRules(config.rules);
    })();

    /**
     * Populate rule container with given rules
     * @param {Rule[]} rules
     */
    function setRules(rules) {
        // Remove old rules
        const oldRuleNodes = ruleContainer.querySelectorAll(".rule-row");
        for (const ruleNode of oldRuleNodes) {
            ruleNode.remove();
        }

        const ruleNodes = rules.map((rule) => {
            const ruleNode = ruleTemplate.content.cloneNode(true);
            ruleNode.querySelector(".url").value = rule.url;
            ruleNode.querySelector(".search").value = rule.search;
            ruleNode.querySelector(".replace").value = rule.replace;
            return ruleNode;
        });
        // Add new rules
        for (const ruleNode of ruleNodes) {
            ruleContainer.appendChild(ruleNode);
        }
    }

    // Events

    // Events - Add rules
    buttonAdd.addEventListener("click", () => {
        ruleContainer.appendChild(ruleTemplate.content.cloneNode(true));
    });

    // Events - Save rules
    buttonSave.addEventListener("click", async () => {
        const ruleNodes = ruleContainer.querySelectorAll(".rule-row");
        /** @type {Rule[]} */
        const rules = [...ruleNodes].map((ruleNode) => ({
            url: ruleNode.querySelector(".url").value,
            search: ruleNode.querySelector(".search").value,
            replace: ruleNode.querySelector(".replace").value,
        }));
        /** @type {Config} */
        const config = { rules: rules };
        await chrome.storage.sync.set(config);
        notificationSaved.classList.remove("hidden");
        setTimeout(() => notificationSaved.classList.add("hidden"), 1000);
    });

    // Events - Remove rules
    ruleContainer.addEventListener("click", (eventObject) => {
        const removeRuleButton = eventObject.target;
        if (removeRuleButton.classList.contains("remove-rule-button")) {
            removeRuleButton.parentElement.remove();
        }
    });

    // Events - Load defaults
    buttonReset.addEventListener("click", () => {
        /** @type {Rule} */
        const defaultRule = {
            url: ".*",
            search: "(.*)",
            replace: "$1",
        };
        setRules([defaultRule]);
    });
}

document.onreadystatechange = () => {
    if (document.readyState === "interactive") {
        initApplication();
    }
};
