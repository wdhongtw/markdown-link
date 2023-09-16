/**
 * @typedef {Object} Rule
 * @property {string} url
 * @property {string} search
 * @property {string} replace
 */

/**
 * @typedef {Object} Config
 * @property {Rule[]} rules
 */

async function initApplication() {
    // Elements

    /** @type {HTMLElement} */
    const ruleContainer = document.getElementById("list-of-rule");
    /** @type {HTMLElement} */
    const ruleTemplate = document.getElementById("rule-template");

    const buttonImport = document.getElementById("import-button");
    const buttonExport = document.getElementById("export-button");
    const buttonReset = document.getElementById("load-defaults-button");
    const buttonAdd = document.getElementById("add-button");
    const buttonSave = document.getElementById("save-button");
    const notificationSaved = document.getElementById("saved-notification");

    // Initialization
    await (async () => {
        /** @type Config */
        const config = await chrome.storage.sync.get();
        setRules(config.rules);

        if (document.querySelectorAll(".remove-rule-button").length === 1) {
            document
                .querySelector(".remove-rule-button")
                .classList.add("hidden");
        }
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
        document
            .querySelector(".remove-rule-button")
            .classList.remove("hidden");
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
            const firstRemoveRuleButton = document.querySelector(
                ".remove-rule-button"
            );
            if (document.querySelectorAll(".remove-rule-button").length === 1) {
                firstRemoveRuleButton.classList.add("hidden");
            } else {
                firstRemoveRuleButton.classList.remove("hidden");
            }
        }
    });

    // Events - Import
    buttonImport.addEventListener("click", () => {
        const fileChooser = document.createElement("input");
        fileChooser.type = "file";
        fileChooser.addEventListener("change", () => {
            const file = fileChooser.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                /** @type {Config} */
                const config = JSON.parse("" + reader.result);
                setRules(config.rules);
                buttonSave.click();
            };
            reader.readAsText(file);
            form.reset();
        });
        const form = document.createElement("form");
        form.appendChild(fileChooser);
        fileChooser.click();
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

    // Events - Export
    buttonExport.addEventListener("click", async () => {
        /** @type {Config} */
        const config = await chrome.storage.sync.get();
        const result = JSON.stringify(config);
        const url = "data:application/json;base64," + btoa(result);
        await chrome.downloads.download({
            url: url,
            filename: "markdown-link-config.json",
        });
    });
}

document.onreadystatechange = () => {
    if (document.readyState === "interactive") {
        initApplication();
    }
};
