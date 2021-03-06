const UPDATED = false;
const EVENTS = {
    connected: new Event("veeraConnected"),
//    newBattle: new Event("newBattle")
};

window.addEventListener("veeraConnected", MainInit);
//window.addEventListener("newBattle", );

DevTools.wait(); //Listen for devtools conn
//Adding a last item in array macro
Object.defineProperty(Array.prototype, "last", {
    get: function () {
        return this.length == 0 ? 0 : this[this.length - 1];
    }
});

function MainInit() {
    DevTools.query("tabId").then(id => {
            State.game.linkToTab(id).then(() => console.group("Loading data"));
        })
        .then(State.load)
        .then(Supplies.load)
        .then(Raids.load)
        .then(Profile.load)
        .then(() => {
            console.groupEnd();
            console.groupCollapsed("Initiliaze UI");
            updateUI("init", {theme: State.theme.current,
                              planner: Planner.listSeries(),
                              unfEdition: State.unfEdition,
                              raids: Raids.getList()});
            updateUI("updSupplies", Supplies.getAll());
//            updateUI("updStatus", Profile.status);
            updateUI("updCurrencies", Profile.currencies);
            updateUI("updPendants", Profile.pendants);
            updateUI("updArca", Profile.arcarum);
            console.groupEnd();
        })
        .then(checkReset)//jshint ignore:line
        .catch(e => {
            DevTools.disconnect();
            console.error(e);
        });
    }

//Old function, kept for now due to ease of reading intended use.
function updateUI (type, value) {
    DevTools.send(type, value);
}

//Utils
function Enum(...names) { //eh it's neat but can't auto-complete and not JSON
    let idx = 1;
    Object.defineProperty(this, "dict", {
        enumerable: false,
        value: {}
    });

    for (let name of names) {
        this.dict[idx] = name;
        this[name] = idx;
        idx++;
    }
    Object.freeze(this.dict);
    Object.freeze(this);
}
Enum.prototype.getName = function (value) {
    return this.dict[value];
};

function getEnumNamedValue(list, val) { //for the simple plain obj enum actually used
    return Object.entries(list).find(x => x[1] == val)[0];
}

const DOM_PARSER = new DOMParser();
function parseDom(data, mime) {
    return DOM_PARSER.parseFromString(decodeURIComponent(data), mime || "text/html");
}