let currentURL = document.getElementById("currentURL");
let addToBadSites = document.getElementById("addToBadSites");
let searchLinks = document.getElementById("searchLinks");
let postResult = document.getElementById("postResult");
let sitesNumberValue = document.getElementById("sitesNumberValue");

var areLinksHighlighted = false;

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
            let total = response.body.size[0].n_reputations;
            chrome.storage.sync.set({ totalSites: total });
            sitesNumberValue.innerText = response.body.success;
        })
        .catch(error => console.log(error));
}

function highlightLinks() {
    var urls = document.getElementsByTagName('a');
    if (areLinksHighlighted === true) {
        for (var i = 0; i < urls.length; i++) {
            console.log(urls[i].getAttribute('href'));
            urls[i].style.backgroundColor = "#CDCDCD";
        }
        areLinksHighlighted = false;
    } else {
        for (var i = 0; i < urls.length; i++) {
            console.log(urls[i].getAttribute('href'));
            urls[i].style.backgroundColor = "#f4a261";
        }
        areLinksHighlighted = true;
    }
}

// ===== LISTENER
addToBadSites.addEventListener("click", e => addSiteToBannedList(e));

searchLinks.addEventListener("click", async() => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: highlightLinks
    });
});

if (areLinksHighlighted === true) {
    searchLinks.style.backgroundColor = "#2a9d8f";
} else {
    searchLinks.style.backgroundColor = "#CDCDCD";
}

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