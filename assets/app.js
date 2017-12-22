var allPins = [];
var isFullSizeMode = false;
var startUrl = "https://api.pinterest.com/v1/boards/andr4489/dream-garage/pins/?access_token=AUO5p-pxQMuomnDePDBjCcKIWZ5SFQHPqIBl_gVEj6glA6AxtgAAAAA&fields=note%2Cimage";

window.onload = function () {
    setupKeyBindings();

    var fullSizeContainer = document.querySelector("#fullSizeContainer");
    fullSizeContainer.addEventListener("click", hideFullSize);

    getPinterestData();
};

function setupKeyBindings()
{
    document.addEventListener("keydown",
        function (event) {
            if (event.keyCode == 27) {
                onEscKeyPressed();
            }
        });
}

function onEscKeyPressed() {
    hideFullSize();
}

function getPinterestData(url) {
    if (url === undefined) {
        url = startUrl;
    }

    httpGetAsync(url,
        function (response) {
            response = JSON.parse(response);
            parseResponse(response);
        });
}

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    };

    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function parseResponse(response) {
    console.log(response);

    var pins = response.data;
    allPins = allPins.concat(pins);

    var nextPage = response.page.next;

    if (nextPage !== null) {
        getPinterestData(nextPage);
        return;
    }

    allPins.sort(sortPins);

    showPins();
}

function sortPins(pinA, pinB) {
    var noteA = pinA.note.toUpperCase();
    var noteB = pinB.note.toUpperCase();

    if (noteA < noteB) {
        return -1;
    } 

    if (noteA > noteB) {
        return 1;
    }

    return 0;
}

function showPins() {
    allPins.forEach(function (pin) {
        addPin(pin);
    });
}

function getThumbUrl(pin) {
    return pin.image.original.url.replace("/originals/", "/736x/");
}

function addPin(pin) {
    var template = document.querySelector("#templates #pin_thumb > img");
    var newNode = template.cloneNode(true);

    newNode.setAttribute("alt", pin.note);
    newNode.setAttribute("src", getThumbUrl(pin));

    newNode.addEventListener("click",
        function (event) {
            showFullSize(event, pin);
        });

    newNode.addEventListener("mouseout", onPinMouseOut);
    newNode.addEventListener("mouseover", onPinMouseOver);

    var container = document.querySelector(".container-fluid > .row");
    container.appendChild(newNode);
}

function onPinMouseOver(event) {
    if (isFullSizeMode) {
        return;
    }

    var pinNode = event.target;

    var titleBar = document.querySelector("#titleBar");
    titleBar.style.opacity = 1;

    var titleDiv = document.querySelector("#titleBar > #title");
    titleDiv.innerHTML = pinNode.alt;
}

function onPinMouseOut(event) {
    if (isFullSizeMode) {
        return;
    }

    var titleBar = document.querySelector("#titleBar");
    titleBar.style.opacity = 0;
}

function showFullSize(event, pin) {
    isFullSizeMode = true;

    var container = document.querySelector("#fullSizeContainer");

    var fullSizeImg = document.querySelector("#fullSizeImg > img");
    fullSizeImg.setAttribute("src", pin.image.original.url);
    
    container.style.opacity = 1;
    container.style.pointerEvents = "all";

    var titleBar = document.querySelector("#titleBar");
    titleBar.style.pointerEvents = "all";

    titleBar.addEventListener("click", hideFullSize);
}

function hideFullSize() {
    var container = document.querySelector("#fullSizeContainer");

    container.style.opacity = 0;
    container.style.pointerEvents = "none";

    var titleBar = document.querySelector("#titleBar");
    titleBar.style.pointerEvents = "none";

    titleBar.removeEventListener("click", hideFullSize);
    
    isFullSizeMode = false;
}
