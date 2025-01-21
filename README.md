# Markdown Link Generator

Generate Markdown link of current tab with one click.

## Installation

Install from Chrome Web Store:
[Markdown Link](https://chrome.google.com/webstore/detail/markdown-link/ecbklhnbeilcdabliikhpdanaljlpkhe)

Or you can build from source and load it manually

```shell
npm install --include dev
npm run compile
```

Then goto <chrome://extensions/> , (enable Developer mode) and load unpacked extension

## Usage

Assume you are on `google.com`. When your click the extension button, the following
Markdown text will send into your clipboard.

``` markdown
[Google](https://www.google.com/)
```

The link text is generated from current tab title.

Use `Alt` + `F` To as a shortcut to activate this action.
(You can change this key binding in <chrome://extensions/> )

## Contributors

- `wdhongtw`
- `JayBeeDe`

## Reference

- [What are extensions? - Google Chrome](https://developer.chrome.com/extensions)
- [Sample Extensions - Google Chrome](https://developer.chrome.com/extensions/samples#search:)
- [Clipboard Copy / Paste on Content script (Chrome Extension) - Stack Overflow](https://stackoverflow.com/questions/25622359/clipboard-copy-paste-on-content-script-chrome-extension)
- [dcurtis/markdown-mark: Use this mark to identify Markdown.](https://github.com/dcurtis/markdown-mark)
