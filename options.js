/**
 * @typedef {Object} Rule
 * @property {string} url
 * @property {string} search
 * @property {string} replace
 */

/**
 * @type Rule
 */
const defaultRules = {
    url: ".*",
    search: "(.*)",
    replace: "$1",
};

async function initApplication() {
    // Elements

    const ruleContainer = document.getElementById("list-of-rule");
    const ruleTemplate = document.getElementById("rule-template");

    const buttonImport = document.getElementById("import-button");
    const buttonExport = document.getElementById("export-button");
    const buttonReset = document.getElementById("load-defaults-button");
    const buttonAdd = document.getElementById("add-button");
    const buttonSave = document.getElementById("save-button");
    const notificationSaved = document.getElementById("saved-notification");

    // Initialization
    await (async () => {
        const storage = await chrome.storage.sync.get(null);
        setRules(storage.rules);

        if (document.querySelectorAll(".remove-rule-button").length === 1) {
            document
                .querySelector(".remove-rule-button")
                .classList.add("hidden");
        }
    })();

    /**
     *
     * @param {Rule[]} rules
     * @returns
     */
    function setRules(rules) {
        // Remove old rules
        const ruleNodes = ruleContainer.querySelectorAll(".rule-row");
        for (const ruleNode of ruleNodes) {
            ruleNode.remove();
        }
        // Add new rules
        for (const rule of rules) {
            const ruleNode = ruleTemplate.content.cloneNode(true);
            ruleNode.querySelector(".url").value = rule.url;
            ruleNode.querySelector(".search").value = rule.search;
            ruleNode.querySelector(".replace").value = rule.replace;
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
        /**
         * @type {Rule[]}
         */
        const rules = [];
        const data = {
            rules: rules,
        };
        const ruleNodes = ruleContainer.querySelectorAll(".rule-row");
        for (const ruleNode of ruleNodes) {
            data.rules.push({
                url: ruleNode.querySelector(".url").value,
                search: ruleNode.querySelector(".search").value,
                replace: ruleNode.querySelector(".replace").value,
            });
        }
        await chrome.storage.sync.set(data);
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
                const storage = JSON.parse("" + reader.result);
                setRules(storage.rules);
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

    buttonReset.addEventListener("click", () => setRules([defaultRules]));

    // Events - Export
    buttonExport.addEventListener("click", async () => {
        const storage = await chrome.storage.sync.get(null);
        const result = JSON.stringify(storage);
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
