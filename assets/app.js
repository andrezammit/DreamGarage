window.onload = function () {
    getPinterestData();
};

function getPinterestData() {
    httpGetAsync("https://api.pinterest.com/v1/boards/andr4489/dream-garage/pins/?access_token=AUO5p-pxQMuomnDePDBjCcKIWZ5SFQHPqIBl_gVEj6glA6AxtgAAAAA&fields=note%2Cimage",
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

    pins.forEach(function (pin) {
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

    newNode.addEventListener("onClick",
        function (event) {
            showFullSize(event, pin);
        });

    newNode.addEventListener("mouseout", onPinMouseOut);
    newNode.addEventListener("mouseover", onPinMouseOver);

    var container = document.querySelector(".container-fluid > .row");
    container.appendChild(newNode);
}

function onPinMouseOver(event) {
    var pinNode = event.target;

    var titleBar = document.querySelector("#titleBar");
    titleBar.style.opacity = 1;

    var titleDiv = document.querySelector("#titleBar > #title");
    titleDiv.innerHTML = pinNode.alt;
}

function onPinMouseOut(event) {
    var titleBar = document.querySelector("#titleBar");
    titleBar.style.opacity = 0;
}
