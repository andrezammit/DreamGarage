var allPins = [];

var currentPinIndex = -1;
var isFullSizeMode = false;

var startUrl = "https://api.pinterest.com/v1/boards/andr4489/dream-garage/pins/?access_token=AUO5p-pxQMuomnDePDBjCcKIWZ5SFQHPqIBl_gVEj6glA6AxtgAAAAA&fields=note%2Cimage";

window.onload = function () {
    setupKeyBindings();
    setupGestureSupport();

    var fullSizeContainer = document.querySelector("#fullSizeContainer");
    fullSizeContainer.addEventListener("click", hideFullSize);

    getPinterestData();
};

function setupKeyBindings() {
    document.addEventListener("keydown", onKeyDown);
}

function setupGestureSupport() {
    var fullSizeContainer = document.querySelector("#fullSizeContainer");

    var hammertime = new Hammer(fullSizeContainer);

    hammertime.on("swipe", function(event) {
        switch (event.direction)
        {
        case Hammer.DIRECTION_LEFT:
            onRightArrowPressed();
            break;

        case Hammer.DIRECTION_RIGHT:
            onLeftArrowPressed();
            break;
        }
    });
}

function onKeyDown(event) {
    switch (event.keyCode)
    {
    case 27: // Escape
        onEscKeyPressed();
        break;

    case 37: // Left arrow
        onLeftArrowPressed();
        break;

    case 39: // Right arrow
        onRightArrowPressed();
        break;
    }
}

function onEscKeyPressed() {
    hideFullSize();
}

function onLeftArrowPressed() {
    var index = currentPinIndex - 1;

    if (index < 0) {
        return;
    }

    showFullSize(allPins[index], index);
}

function onRightArrowPressed() {
    var index = currentPinIndex + 1;

    if (index > allPins.length - 1) {
        return;
    }

    showFullSize(allPins[index], index);
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
    allPins.forEach(addPin);
}

function getThumbUrl(pin) {
    return pin.image.original.url.replace("/originals/", "/736x/");
}

function addPin(pin, index) {
    var template = document.querySelector("#templates #pin_thumb > img");
    var newNode = template.cloneNode(true);

    newNode.setAttribute("alt", pin.note);
    newNode.setAttribute("src", getThumbUrl(pin));

    newNode.addEventListener("click",
        function (event) {
            showFullSize(pin, index);
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

function showFullSize(pin, index) {
    isFullSizeMode = true;
    currentPinIndex = index;

    var container = document.querySelector("#fullSizeContainer");

    var fullSizeImg = document.querySelector("#fullSizeImg > img");
    fullSizeImg.setAttribute("src", "assets/gear.gif");

    var downloadingImage = new Image();

    downloadingImage.onload = function () {
        fullSizeImg.setAttribute("src", this.src);
    };
    
    downloadingImage.src = pin.image.original.url;

    container.style.opacity = 1;
    container.style.pointerEvents = "all";

    var titleBar = document.querySelector("#titleBar");
    titleBar.style.pointerEvents = "all";

    var titleDiv = document.querySelector("#titleBar > #title");
    titleDiv.innerHTML = pin.note;
    
    titleBar.addEventListener("click", hideFullSize);
}

function hideFullSize() {
    if (!isFullSizeMode) {
        return;
    }

    var container = document.querySelector("#fullSizeContainer");

    container.style.opacity = 0;
    container.style.pointerEvents = "none";

    var titleBar = document.querySelector("#titleBar");
    titleBar.style.pointerEvents = "none";

    titleBar.removeEventListener("click", hideFullSize);
    
    isFullSizeMode = false;
    currentPinIndex = -1;    
}
