window.onload = function () {
   DreamGarage.startApp();
};

var DreamGarage = (function () {
    var allPins = [];
    var queryStringParams = {};

    var currentPinIndex = -1;
    var isFullSizeMode = false;

    var pinEnumFields = "note%2Cimage";
    var boardInfoFields = "name%2Curl";

    var board = "andr4489/dream-garage";
    var access_token = "AUO5p-pxQMuomnDePDBjCcKIWZ5SFQHPqIBl_gVEj6glA6AxtgAAAAA";

    var baseUrl = "";
    var pinEnumUrl = "";
    var boardInfoUrl = "";

    var cachedElements = {};

    function cacheElements() {
        cachedElements.header = document.querySelector("#header");
        cachedElements.titleBar = document.querySelector("#titleBar");
        cachedElements.fullSizeImg = document.querySelector("#fullSizeImg > img");
        cachedElements.titleBarDiv = document.querySelector("#titleBar > #title");
        cachedElements.pinContainer = document.querySelector(".container-fluid > .row");
        cachedElements.titleBarText = document.querySelector("#titleBar > #title span");
        cachedElements.fullSizeContainer = document.querySelector("#fullSizeContainer");
        cachedElements.pinTemplate = document.querySelector("#templates #pin_thumb > img");
    }

    function checkforCustomBoard() {
        if (queryStringParams.board !== undefined) {
            board = queryStringParams.board;
        }
    }

    function setPinterestUrls() {
        baseUrl = "https://api.pinterest.com/v1/boards/" + board;

        pinEnumUrl = baseUrl + "/pins/?access_token=" + access_token + "&fields=" + pinEnumFields;
        boardInfoUrl = baseUrl + "/?access_token=" + access_token + "&fields=" + boardInfoFields;
    }

    function setupClickBindings() {
        cachedElements.fullSizeContainer.addEventListener("click", hideFullSize);
    }

    function setupKeyBindings() {
        document.addEventListener("keydown", onKeyDown);
    }

    function setupGestureSupport() {
        var hammertime = new Hammer(cachedElements.fullSizeContainer);

        hammertime.on("swipe", function (event) {
            switch (event.direction) {
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
        switch (event.keyCode) {
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

    function getBoardInfo() {
        httpGetAsync(boardInfoUrl,
            function (response) {
                if (response !== "") {
                    response = JSON.parse(response);
                }
                else {
                    response = { message: "Board not found." };
                }

                parseBoardInfoResponse(response);
            });
    }

    function getPinterestData(url) {
        if (url === undefined) {
            url = pinEnumUrl;
        }

        httpGetAsync(url,
            function (response) {
                response = JSON.parse(response);
                parsePinEnumResponse(response);
            });
    }

    function httpGetAsync(theUrl, callback) {
        var xmlHttp = new XMLHttpRequest();

        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4)
                callback(xmlHttp.responseText);
        };

        xmlHttp.open("GET", theUrl, true);
        xmlHttp.send(null);
    }

    function parseBoardInfoResponse(response) {
        console.log(response);

        var headerText;

        if (response.message !== undefined) {
            headerText = response.message;
        }
        else {
            headerText = response.data.name;
        }

        cachedElements.header.innerHTML = headerText;
        document.title = headerText;
    }

    function parsePinEnumResponse(response) {
        console.log(response);

        var pins = response.data;

        if (pins === undefined) {
            return;
        }

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
        var newNode = cachedElements.pinTemplate.cloneNode(true);

        newNode.setAttribute("alt", pin.note);
        newNode.setAttribute("src", getThumbUrl(pin));

        newNode.addEventListener("click",
            function (event) {
                showFullSize(pin, index);
            });

        newNode.addEventListener("mouseout", onPinMouseOut);
        newNode.addEventListener("mouseover", onPinMouseOver);

        cachedElements.pinContainer.appendChild(newNode);
    }

    function onPinMouseOver(event) {
        if (isFullSizeMode) {
            return;
        }

        cachedElements.titleBar.style.opacity = 1;
        
        var pinNode = event.target;
        cachedElements.titleBarText.innerHTML = pinNode.alt;

        updateTextFill();        
    }

    function onPinMouseOut(event) {
        if (isFullSizeMode) {
            return;
        }

        cachedElements.titleBar.style.opacity = 0;
    }

    function showFullSize(pin, index) {
        isFullSizeMode = true;
        currentPinIndex = index;

        cachedElements.fullSizeImg.setAttribute("src", "assets/gear.gif");

        var downloadingImage = new Image();

        downloadingImage.onload = function () {
            fullSizeImg.setAttribute("src", this.src);
        };

        downloadingImage.src = pin.image.original.url;

        cachedElements.pinContainer.style.opacity = 1;
        cachedElements.pinContainer.style.pointerEvents = "all";

        cachedElements.titleBar.style.pointerEvents = "all";
        cachedElements.titleBarText.innerHTML = pin.note;

        updateTextFill();
        
        titleBar.addEventListener("click", hideFullSize);
    }

    function hideFullSize() {
        if (!isFullSizeMode) {
            return;
        }

        cachedElements.pinContainer.style.opacity = 0;
        cachedElements.pinContainer.style.pointerEvents = "none";

        cachedElements.titleBar.style.opacity = 0;
        cachedElements.titleBar.style.pointerEvents = "none";

        cachedElements.titleBar.removeEventListener("click", hideFullSize);

        isFullSizeMode = false;
        currentPinIndex = -1;
    }

    function parseQueryStringParams() {
        var location = window.location.href;

        var pos = location.indexOf('?') + 1;
        var rawParams = location.slice(pos).split('&');

        rawParams.forEach(function (rawParam, index) {
            var parsedParam = rawParam.split('=');

            var key = parsedParam[0];
            var value = parsedParam[1];

            queryStringParams[key] = value;
        });
    }

    function updateTextFill()
    {
        $(cachedElements.titleBarDiv).textfill({
            maxFontPixels: 70
        });
    }

    return {
        startApp: function () {
            cacheElements();
            
            parseQueryStringParams();
            checkforCustomBoard();
            setPinterestUrls();

            setupKeyBindings();
            setupClickBindings();
            setupGestureSupport();

            getBoardInfo();
            getPinterestData();
        }
    };
})();
