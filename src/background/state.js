window.State = {
    store: {
        unfEdition: "",
        config: {version: 1, updDelta: 0}
    },

    settings: {
        debug: true,
        theme: 0,
        raids: {
            sortByDiff: true
        }
    },

    theme: {
        list: [{name: "Tiamat Night", fname: "night"},
               {name: "Anichra Day", fname: "day"}],
        get current() {
            return this.list[State.settings.theme];
        },
        set current(idx) {
            State.settings.theme = idx;
        }
    },
    game: {
        tabId: null,
        linkToTab: function (id) {
            return new Promise ((r,x) => {
                chrome.tabs.get(id, t => {
                    if (/game\.granbluefantasy\.jp|gbf\.game\.mbga\.jp/.test(t.url)) {
                        devlog(`Ufufu... onee-sama ha tab ${id} wo mite imasu ne.`);
                        this.tabId = id;
                        r();
                    } else {
                        x("Onee-sama wo damasu to ha ii dokyou desu wa!");
                    }
                });
            });
        },
        navigateTo: function (url) {
            if (this.tabId && url) {
                chrome.tabs.update(this.tabId, {url: url}, () => devlog("Navigated to " + url));
            }
        }
    },

    save: function() {
        let o = {store: this.store, settings: this.settings};
        Storage.set({state: o});
        devlog("State saved.");
    },
    load: function () { //Called out of context
        return new Promise((r, x) => {
            function _load(data) {
                if (!data.state) {
                    console.warn("No saved state, initializing from defaults.");
                    setVeeraDefaults();
                    State.save();
                }
                else if (data.state.store && data.state.store.config) {
                    if (data.state.store.config.version == State.store.config.version) {
                        State.settings = data.state.settings;
                        State.store = data.state.store;
                        console.info("State loaded.");
                    }
                    else if (State.store.config.version - data.state.store.config.version <= this.store.config.updDelta) {
                        devlog("Attempting state update from older version.");
                        for (let obj of ["store", "settings"]) {
                            for (let key in State[obj]) {
                                State[obj][key] = data.state[obj][key];
                            }
                        }
                        State.save();
                    }
                }
                else {
                    console.warn("Invalid stored state, internal Veera update?");
                    console.log("Loading defaults.");
                    setVeeraDefaults();
                    State.save();
                }
                r();
            }
            Storage.get("state", _load);
        });
    },
    reset () {
        if (confirm("Clear all stored data and settings?")) {
            Supplies.clear();
            Storage.clear();
            setVeeraDefaults();
            console.log("Cleared all stored data and settings.");
        }
    }
};

function setVeeraDefaults() {
    State.theme.current = 0;
}

function toggleDebug() {
    State.settings.debug = !State.settings.debug;
}

function devlog() {
    if (State.settings.debug) { console.debug(... arguments); }
}

function devwarn() {
    if (State.settings.debug) { console.warn(... arguments); }
}

function deverror() {
    console.error(... arguments);
}