let color = '#3aa757';
let url = '';
let totalSites = 0;

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ color });
    chrome.storage.sync.set({ url });
    chrome.storage.sync.set({ totalSites });
});