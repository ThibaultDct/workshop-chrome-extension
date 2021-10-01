let color = '#3aa757';
let url = '';
let totalSites = 0;
let highlightLinksBool = false;
let pageInfos = null;

chrome.runtime.onInstalled.addListener((reason) => {
    // STORAGE
    chrome.storage.sync.set({ color });
    chrome.storage.sync.set({ url });
    chrome.storage.sync.set({ totalSites });
    chrome.storage.sync.set({ highlightLinksBool });
    chrome.storage.sync.set({ pageInfos });

    if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.tabs.create({
            url: 'onboarding.html'
        });
    }

    // ALARMS
    chrome.alarms.create('fetchTotalSitesAlarm', {
        periodInMinutes: 1
    });

    function getSitesNumber() {
        const url = 'https://workshop.cloud.thibaultdct.fr/reputations/all/size';
        const options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            }
        };
        fetch(url, options)
            .then(function(toJson) {
                return toJson.json();
            })
            .then(function(json) {
                chrome.storage.sync.set({ totalSites: json.size[0].n_reputations });
            })
            .catch(error => console.log(error));
    }

    function getPageInfos() {
        chrome.storage.sync.get(['url'], function(result) {
            const url = 'https://workshop.cloud.thibaultdct.fr/reputations/url';
            const options = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                body: JSON.stringify({
                    url: result.url
                })
            };
            fetch(url, options)
                .then(function(toJson) {
                    return toJson.json();
                })
                .then(function(json) {
                    console.log("Infos " + result.url);
                    console.log(json);
                    console.log(json.reputation.length);
                    if (json.reputation.length > 0) {
                        chrome.storage.sync.set({ pageInfos: json.reputation });
                        chrome.tabs.query({ currentWindow: true, active: true }, function(tab) {
                            chrome.tabs.update(tab.id, { url: "http://google.fr" });
                        });
                    } else
                        chrome.storage.sync.set({ pageInfos: null });
                })
                .catch(error => console.log(error));
        });
    }

    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === "fetchTotalSitesAlarm") {
            getSitesNumber();
        }
    });

    async function getTabInfosOnActivation(infos) {
        try {
            let tabInfos = await chrome.tabs.get(infos.tabId);
            console.log("Activating : " + tabInfos.url);
            chrome.storage.sync.set({ url: tabInfos.url });
            getPageInfos();
        } catch (error) {
            console.error(error);
        }
    }

    async function getTabInfosOnUpdate(tabId, changeInfo, tabInfo) {
        try {
            let tabInfos = await chrome.tabs.get(tabId);
            console.log("Activating : " + tabInfo.url);
            chrome.storage.sync.set({ url: tabInfo.url });
            getPageInfos();
        } catch (error) {
            console.error(error);
        }
    }

    chrome.tabs.onActivated.addListener(getTabInfosOnActivation);
    chrome.tabs.onUpdated.addListener(getTabInfosOnUpdate);

    getSitesNumber();
    getPageInfos();

});