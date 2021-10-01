let currentURL = document.getElementById("currentURL");
let addToBadSites = document.getElementById("addToBadSites");
let searchLinks = document.getElementById("searchLinks");
let postResult = document.getElementById("postResult");
let sitesNumberValue = document.getElementById("sitesNumberValue");
let alertPlaceholder = document.getElementById("alert");
let buttonToWebsite = document.getElementById("goToWebsite");

chrome.storage.sync.get("url", ({ url }) => {
    currentURL.innerText = url;
});

function getCurrentUrl() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];
        return activeTab.url;
    });
}

const addSiteToBannedList = async e => {
    e.preventDefault();

    chrome.storage.sync.get(['url'], function(result) {
        const url = 'https://workshop.cloud.thibaultdct.fr/reputations';
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
            .then(response => {
                console.log(response.status);
            })
            .catch(error => console.log(error));
    });
}

function highlightLinks() {
    var urls = document.getElementsByTagName('a');

    chrome.storage.sync.get("highlightLinksBool", ({ highlightLinksBool }) => {
        if (highlightLinksBool === true) {
            for (var i = 0; i < urls.length; i++) {
                console.log(urls[i].getAttribute('href'));
                urls[i].style.backgroundColor = "unset";
            }
            chrome.storage.sync.set({ highlightLinksBool: false });
            searchLinks.style.backgroundColor = "#CDCDCD";
        } else {
            for (var i = 0; i < urls.length; i++) {
                console.log(urls[i].getAttribute('href'));
                urls[i].style.backgroundColor = "#f4a261";
            }
            chrome.storage.sync.set({ highlightLinksBool: true });
            searchLinks.style.backgroundColor = "#2a9d8f";
        }
    });
}

const goToWebsite = async e => {
    chrome.tabs.query({ currentWindow: true, active: true }, function(tab) {
        chrome.tabs.update(tab.id, { url: "https://workshop.cloud2.thibaultdct.fr/#/dashboard" });
    });
}

// ===== LISTENERS =====
// Bouton ajout site malveillant
addToBadSites.addEventListener("click", e => addSiteToBannedList(e));

// Bouton afficher / masquer liens
searchLinks.addEventListener("click", async() => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: highlightLinks
    });
});

// Bouton site
buttonToWebsite.addEventListener("click", e => goToWebsite(e));

chrome.storage.sync.get("highlightLinksBool", ({ highlightLinksBool }) => {
    if (highlightLinksBool === true) {
        searchLinks.style.backgroundColor = "#2a9d8f";
    } else {
        searchLinks.style.backgroundColor = "#CDCDCD";
    }
});

chrome.storage.sync.get("url", ({ url }) => {
    currentURL.innerText = url;
});

chrome.storage.sync.get("totalSites", ({ totalSites }) => {
    sitesNumberValue.innerText = totalSites;
});

chrome.storage.sync.get("pageInfos", ({ pageInfos }) => {
    if (pageInfos === null) {
        alertPlaceholder.style.visibility = "hidden";
    } else {
        alertPlaceholder.style.visibility = "visible";
        chrome.tabs.query({ currentWindow: true, active: true }, function(tab) {
            chrome.tabs.update(tab.id, { url: "https://workshop.cloud2.thibaultdct.fr/#/dashboard" });
        });
    }
});

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var activeTab = tabs[0];
    chrome.storage.sync.set({ url: activeTab.url });
    currentURL.innerText = activeTab.url;
});