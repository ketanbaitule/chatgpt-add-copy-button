// ==UserScript==
// @name         Add Copy Button
// @namespace    http://tampermonkey.net/
// @version      2026-10-08
// @description  Add a Copy button to ChatGPT code blocks
// @author       Ketan Baitule
// @match        https://chatgpt.com/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chatgpt.com
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    GM_addStyle(`
        pre {
            position: relative !important;
            background: #1a1b16;
            padding: 8px 16px;
            border-radius: 5px;
        }

        .tm-copy-pre-btn {
            position: absolute;
            top: 6px;
            right: 6px;
            z-index: 9999;

            padding: 4px 8px;
            border: 1px solid rgba(128, 128, 128, 0.4);
            border-radius: 5px;

            background: white;
            color: #000;
            font-size: 12px;
            line-height: 1.4;
            font-family: sans-serif;

            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.15s, background 0.15s;
        }

        .tm-copy-pre-btn.copied {
            background: #198754;
            opacity: 1;
        }
    `);

    function addCopyButton(pre) {
        // Don't add twice
        if (pre.dataset.tmCopyButtonAdded === 'true') {
            return;
        }

        pre.dataset.tmCopyButtonAdded = 'true';

        const button = document.createElement('button');
        button.className = 'tm-copy-pre-btn';
        button.type = 'button';
        button.textContent = 'Copy';

        button.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();

            //const text = pre.innerText;
            const code = pre.querySelector('code');
            const text = code ? code.innerText : pre.innerText;

            try {
                await navigator.clipboard.writeText(text);

                button.textContent = 'Copied!';
                button.classList.add('copied');

                setTimeout(() => {
                    button.textContent = 'Copy';
                    button.classList.remove('copied');
                }, 1500);

            } catch (error) {
                console.error('Copy failed:', error);

                // Fallback for pages where Clipboard API is unavailable
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';

                document.body.appendChild(textarea);
                textarea.select();

                try {
                    document.execCommand('copy');

                    button.textContent = 'Copied!';
                    button.classList.add('copied');

                    setTimeout(() => {
                        button.textContent = 'Copy';
                        button.classList.remove('copied');
                    }, 1500);
                } finally {
                    textarea.remove();
                }
            }
        });

        pre.appendChild(button);
    }

    function scanPreBlocks(root = document) {
        if (root.matches?.('pre')) {
            addCopyButton(root);
        }

        root.querySelectorAll?.('pre').forEach(addCopyButton);
    }

    // Existing <pre> blocks
    scanPreBlocks();

    // Dynamically rendered <pre> blocks
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    scanPreBlocks(node);
                }
            }
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})();
