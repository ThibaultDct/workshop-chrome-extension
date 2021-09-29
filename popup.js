let currentURL = document.getElementById("currentURL");
let addToBadSites = document.getElementById("addToBadSites");
let searchLinks = document.getElementById("searchLinks");
let postResult = document.getElementById("postResult");
let sitesNumberValue = document.getElementById("sitesNumberValue");

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
        .then(response => {
            console.log(response.status);
            let result = response.json();
            let total = result.size[0].n_reputations;
            chrome.storage.sync.set({ totalSites: total });
            sitesNumberValue.innerText = total;
        })
        .catch(error => console.log(error));
}

function highlightLinks() {
    var urls = document.getElementsByTagName('a');

    chrome.storage.sync.get("highlightLinksBool", ({ highlightLinksBool }) => {
        if (highlightLinksBool === true) {
            for (var i = 0; i < urls.length; i++) {
                console.log(urls[i].getAttribute('href'));
                urls[i].style.backgroundColor = "transparent";
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

getSitesNumber();
chrome.storage.sync.get("totalSites", ({ totalSites }) => {
    sitesNumberValue.innerText = totalSites;
});

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var activeTab = tabs[0];
    chrome.storage.sync.set({ url: activeTab.url });
    currentURL.innerText = activeTab.url;
});