// Copyright (C) 2005 David Caldwell and Jim Radford, All Rights Reserved.

var __platform_js__;
if (!__platform_js__) {
__platform_js__ = 1;

var nbsp = "\u00a0";

function PlatformSpecific()
{
    //debugger;
    this.ua = navigator.userAgent;
    this.op = !!(window.opera && document.getElementById);
    this.op6 = !!(this.op && !(this.body && this.body.innerHTML));
    if (this.op && !this.op6) document.onmousedown = function (e) {
        if (((e = e || window.event).target || e.srcElement).tagName == "IMAGE") return false; };
    if (navigator.appName == 'Microsoft Internet Explorer') { // http://msdn.microsoft.com/en-us/library/ms537509%28VS.85%29.aspx
        var match = this.ua.match(/MSIE ([0-9]{1,}[.0-9]{0,})/);
        this.ie = match ? parseFloat(match[1]) : 1;
    }
    this.iemac = !!(this.ie && this.ua.match(/mac/i));
    this.ie4 = !!(this.ie && !document.getElementById);
    this.n4 = !!(document.layers && typeof document.classes != "undefined");
    this.n6 = !!(typeof window.getComputedStyle != "undefined" && typeof document.createRange != "undefined");
    this.w3c = !!(!this.op && !this.ie && !this.n6 && document.getElementById);
    this.ce = !!(document.captureEvents && document.releaseEvents);
    this.px = (this.n4 || this.op6)? '' : 'px';
    this.tiv = this.w3c? 40 : 10;
    this.mac = window.navigator && window.navigator.platform && (window.navigator.platform.indexOf("mac") >= 0 ||
                                                                 window.navigator.platform.indexOf("Mac") >= 0);
    this.safari = this.ua.match(/safari/i);
    if (this.webkit = this.ua.match(/AppleWebKit\/(\d+)/i) || undefined /* match returns null which sucks for inequalities */)
        this.webkit = this.webkit[1];

    this.has_canvas = !!document.createElement('canvas').getContext;
    this.has_placeholder = 'placeholder' in document.createElement('input');
    this.has_border_radius = !!(document.documentElement && document.documentElement.style &&
                                ('borderRadius'       in document.documentElement.style ||
                                 'MozBorderRadius'    in document.documentElement.style ||
                                 'WebkitBorderRadius' in document.documentElement.style ||
                                 'KhtmlBorderRadius'  in document.documentElement.style))
    this.has_position_fixed = (function () { // Adapted from http://yura.thinkweb2.com/cft/
        var isSupported = false;
        var el = document.createElement("div");
        el.style.position = "fixed";
        el.style.top = "10px";
        document.body.appendChild(el);
        isSupported = el.offsetTop === 10;
        document.body.removeChild(el);
        return isSupported;
    })();

    this.key_name = { 38:"up", 40:"down", 37:"left", 39:"right",
                     33:"page-up", 34:"page-down", 35:"end", 36:"home", 45:"insert", 46:"delete",
                     112:"f1", 113:"f2", 114:"f3", 115:"f4", 116:"f5", 117:"f6",
                     118:"f7", 119:"f8", 120:"f9", 121:"f10", 122:"f11", 123:"f12",
                     13:"return", 14:"enter", 9 :"tab", 8 :"backspace", 27:"escape", 6:"delete"/*mac firefox*/,
                     // Explorer
                     18:""/*alt(will have A- added below)*/, 16:"S-"/*shift*/,
                     192:"`", 189:"-", 187:"=", 219:"[", 221:"]", 220:"\\", 186:";", 222:"'", 188:",", 190:".", 191:"/",
                     // Safari:
                     63232: "up", 63233:"down", 63234:"left", 63235:"right",
                     63236:"f1", 63237:"f2", 63238:"f3", 63239:"f4", 63240:"f5", 63241:"f6",
                     63242:"f7", 63243:"f8", 63244:"f9", 63245:"f10", 63246:"f11", 63247:"f12",
                     63276:"page-up", 63277:"page-down", 63275:"end", 63273:"home", 63272:"delete",
                     3:"enter" };
    // Explorer seems to pass Shift-1 instead of ! etc.
    this.explorer_shift_map = { // These shifts of the above sequence are so specific to *my* keyboard it's not even funny.
                     192:"~", 189:"_", 187:"+", 219:"{", 221:"}", 220:"|", 186:":", 222:"\"", 188:"<", 190:">", 191:"?"};
    var explorer_shift_map = {"1":"!", "2":"@", "3":"#", "4":"$", "5":"%", "6":"^", "7":"&", "8":"*", "9":"(", "0":")"};
    for (var s in explorer_shift_map)
        this.explorer_shift_map[s.charCodeAt(0)] = explorer_shift_map[s];

    this.dom_code = {
            "DOM_VK_CANCEL"        : "cancel",
            "DOM_VK_HELP"          : "help",
            "DOM_VK_BACK_SPACE"    : "backspace",
            "DOM_VK_TAB"           : "tab",
            "DOM_VK_CLEAR"         : "clear",
            "DOM_VK_RETURN"        : "return",
            "DOM_VK_ENTER"         : "enter",
            "DOM_VK_SHIFT"         : "shift",
            "DOM_VK_CONTROL"       : "control",
            "DOM_VK_ALT"           : "alt",
            "DOM_VK_PAUSE"         : "pause",
            "DOM_VK_CAPS_LOCK"     : "capslock",
            "DOM_VK_ESCAPE"        : "escape",
            "DOM_VK_SPACE"         : "space",
            "DOM_VK_PAGE_UP"       : "PAGE-up",
            "DOM_VK_PAGE_DOWN"     : "page-down",
            "DOM_VK_END"           : "end",
            "DOM_VK_HOME"          : "home",
            "DOM_VK_LEFT"          : "left",
            "DOM_VK_UP"            : "up",
            "DOM_VK_RIGHT"         : "right",
            "DOM_VK_DOWN"          : "down",
            "DOM_VK_PRINTSCREEN"   : "printscreen",
            "DOM_VK_INSERT"        : "insert",
            "DOM_VK_DELETE"        : "delete",
            "DOM_VK_0"             : "0",
            "DOM_VK_1"             : "1",
            "DOM_VK_2"             : "2",
            "DOM_VK_3"             : "3",
            "DOM_VK_4"             : "4",
            "DOM_VK_5"             : "5",
            "DOM_VK_6"             : "6",
            "DOM_VK_7"             : "7",
            "DOM_VK_8"             : "8",
            "DOM_VK_9"             : "9",
            "DOM_VK_SEMICOLON"     : ";",
            "DOM_VK_EQUALS"        : "=",
            "DOM_VK_A"             : "a",
            "DOM_VK_B"             : "b",
            "DOM_VK_C"             : "c",
            "DOM_VK_D"             : "d",
            "DOM_VK_E"             : "e",
            "DOM_VK_F"             : "f",
            "DOM_VK_G"             : "g",
            "DOM_VK_H"             : "h",
            "DOM_VK_I"             : "i",
            "DOM_VK_J"             : "j",
            "DOM_VK_K"             : "k",
            "DOM_VK_L"             : "l",
            "DOM_VK_M"             : "m",
            "DOM_VK_N"             : "n",
            "DOM_VK_O"             : "o",
            "DOM_VK_P"             : "p",
            "DOM_VK_Q"             : "q",
            "DOM_VK_R"             : "r",
            "DOM_VK_S"             : "s",
            "DOM_VK_T"             : "t",
            "DOM_VK_U"             : "u",
            "DOM_VK_V"             : "v",
            "DOM_VK_W"             : "w",
            "DOM_VK_X"             : "x",
            "DOM_VK_Y"             : "y",
            "DOM_VK_Z"             : "z",
            "DOM_VK_CONTEXT_MENU"  : "context-menu",
            "DOM_VK_NUMPAD0"       : "0",
            "DOM_VK_NUMPAD1"       : "1",
            "DOM_VK_NUMPAD2"       : "2",
            "DOM_VK_NUMPAD3"       : "3",
            "DOM_VK_NUMPAD4"       : "4",
            "DOM_VK_NUMPAD5"       : "5",
            "DOM_VK_NUMPAD6"       : "6",
            "DOM_VK_NUMPAD7"       : "7",
            "DOM_VK_NUMPAD8"       : "8",
            "DOM_VK_NUMPAD9"       : "9",
            "DOM_VK_MULTIPLY"      : "*",
            "DOM_VK_ADD"           : "+",
            "DOM_VK_SEPARATOR"     : "separator",
            "DOM_VK_SUBTRACT"      : "-",
            "DOM_VK_DECIMAL"       : ".",
            "DOM_VK_DIVIDE"        : "/",
            "DOM_VK_F1"            : "F1",
            "DOM_VK_F2"            : "f2",
            "DOM_VK_F3"            : "f3",
            "DOM_VK_F4"            : "f4",
            "DOM_VK_F5"            : "f5",
            "DOM_VK_F6"            : "f6",
            "DOM_VK_F7"            : "f7",
            "DOM_VK_F8"            : "f8",
            "DOM_VK_F9"            : "f9",
            "DOM_VK_F10"           : "f10",
            "DOM_VK_F11"           : "f11",
            "DOM_VK_F12"           : "f12",
            "DOM_VK_F13"           : "f13",
            "DOM_VK_F14"           : "f14",
            "DOM_VK_F15"           : "f15",
            "DOM_VK_F16"           : "f16",
            "DOM_VK_F17"           : "f17",
            "DOM_VK_F18"           : "f18",
            "DOM_VK_F19"           : "f19",
            "DOM_VK_F20"           : "f20",
            "DOM_VK_F21"           : "f21",
            "DOM_VK_F22"           : "f22",
            "DOM_VK_F23"           : "f23",
            "DOM_VK_F24"           : "f24",
            "DOM_VK_NUM_LOCK"      : "num-lock",
            "DOM_VK_SCROLL_LOCK"   : "scroll-lock",
            "DOM_VK_COMMA"         : ",",
            "DOM_VK_PERIOD"        : ".",
            "DOM_VK_SLASH"         : "/",
            "DOM_VK_BACK_QUOTE"    : "`",
            "DOM_VK_OPEN_BRACKET"  : "[",
            "DOM_VK_BACK_SLASH"    : "\\",
            "DOM_VK_CLOSE_BRACKET" : "]",
            "DOM_VK_QUOTE"         : "\"",
            "DOM_VK_META"          : "meta"
    };
    this.dom_key_code = function(event) {
        if (!this.key_code) {
            this.key_code = {};
            for (var k in this.dom_code) {
                this.key_code[event[k]]          = this.dom_code[k];
                //printf("%3d (%s) = %s\n", event[k], k, this.dom_code[k]);
            }
        }
        return this.key_code[event.keyCode];
    };
    if ("index" in "1,2".split(/,/)) {
        var broken_chrome_split = String.prototype.split;
        String.prototype.split = function () {
            var a = broken_chrome_split.apply(this,arguments);
            delete a.index;
            delete a.input;
            return a;
        }
    }
}

PlatformSpecific.prototype.windowWidth  = function() { return document.documentElement.clientWidth;  };
PlatformSpecific.prototype.windowHeight = function() { return document.documentElement.clientHeight; };

// Keypress/Keydown why one or the other?
// keypress seems to cancel stuff nicely--You can capture Command-A and it won't let the browser do select all (mac firefox and safari).
// keypress doesn't do arrows on Safari 3 and 4.
// keydown does arrows, but doesn't do symbols well ($ comes back as shift 4). Also I can't get it to cancel the event.
// So choose wisely.
PlatformSpecific.prototype.register_key_events = function(div, handler) {
    // List of handlers comes next
    var args = Array.prototype.slice.call(arguments,2);
    var handlers = !args.length ? { keydown:1 } : {};
    for (var a in args)
        handlers[args[a]] = 1;

    if (!div.addEventListener) { // Fake it for IE.
        div.addEventListener = function (type, listener, use_capture) {
            this.attachEvent('on' + type, listener)
        };
        div.removeEventListener = function (type, listener, use_capture) {
            this.detachEvent('on' + type, listener)
        };
    }

    var cancel = {}, down, up;
    down = function(e) {
        var event = new plat.key_event(e);
        if (handler(event) == false) {
            cancel[event.key] = true;
            if (e.preventDefault) // DOM
                e.preventDefault();
            return e.returnValue/*for IE*/ = false;
        }
    }
    if (handlers.keydown)
        div.addEventListener("keydown", down, true);
    if (handlers.keypress)
        div.addEventListener("keypress", down, true);
    div.addEventListener("keyup", up = function(e) {
        var event = new plat.key_event(e);
        if (cancel[event.key] == true) {
            if (handlers.keyup) handler(event);
            delete cancel[event.key];
            if (e.preventDefault) // DOM
                e.preventDefault();
            return e.returnValue/*for IE*/ = false;
        }
    }, false);
    return function () {
        if (handlers.keydown)
            div.removeEventListener("keydown", down, true);
        if (handlers.keypress)
            div.removeEventListener("keypress", down, true);
        div.removeEventListener("keyup", up, false);
    };
}

PlatformSpecific.prototype.register_window_focus_events = function(handler) {
    if (this.ie) {
        // Determined through experimentation. "Real" focus in/out events have src=HTML|BODY and to=null.
        document.onfocusout = wrap(this,function (event) {
            if (!event) event = window.event;
            if ((event.srcElement == document.body || event.srcElement == document.documentElement) && event.toElement === null) handler(0);
        });
        document.onfocusin  = wrap(this,function (event) {
            if (!event) event = window.event;
            if ((event.srcElement == document.body || event.srcElement == document.documentElement) && event.toElement === null) handler(1);
        });
    } else {
        window.onblur       = function() { handler(0); };
        window.onfocus      = function() { handler(1); };
    }
}

var plat = new PlatformSpecific();

//PlatformSpecific.prototype.event = function(event) {
plat.event = function(event, elem) {
    if (!event) event = window.event; // stupid windows
    this.type = event.type;
    this.target = event.target || event.srcElement || null;
    this.targetX = event.x || (this.target ? this.target.x : 0);
    this.targetY = event.y || (this.target ? this.target.y : 0);
    this.layerX  = event.layerX || event.offsetX || 0;
    this.layerY  = event.layerY || event.offsetY ||0;
    this.pageX = event.pageX || event.clientX || 0;
    this.pageY = event.pageY || event.clientY || 0;
    if (plat.ie < 9) {
        // This || lets us support both strict and quirks mode.
        this.pageX += (document.documentElement.scrollLeft || document.body.scrollLeft) - (!plat.iemac)*1;
        this.pageY += (document.documentElement.scrollTop  || document.body.scrollTop)  - (!plat.iemac)*1;
    }
    if (elem) {
        //debugger;
        if (this.layerX) {
            var parent = PageCoords(this.target, elem);
            printf("parent: (%d,%d)\n", parent.x, parent.y);
            this.targetX = this.layerX + parent.x;
            this.targetY = this.layerY + parent.y;
        } else {
            var parent = PageCoords(elem);
            this.targetX = this.pageX - parent.x;
            this.targetY = this.pageY - parent.y;
        }
    }

}

plat.key_event = function(event) {
    if (!event) event = window.event; // stupid windows
    var charCode = event.type == "keypress" ? this.charCode : undefined;
    this.keyCode = event.keyCode;
    this.charCode = this.keyCode ? undefined : charCode;
    this.ctrlKey = event.ctrlKey;
    this.altKey = event.altKey;
    this.metaKey = event.metaKey;
    this.shiftKey = event.shiftKey;
    this.type = event.type;

    var keyCode = this.keyCode;

    if (event.keyIdentifier) { // DOM 3 (Safari 4, for starters)
        var m;
        if      (event.keyIdentifier.toLowerCase() == 'u+0020')   this.key = "space";
        else if (event.keyIdentifier.toLowerCase() == 'u+0009')   this.key = "tab";
        else if (event.keyIdentifier.toLowerCase() == 'u+0008')   this.key = "backspace";
        else if (event.keyIdentifier.toLowerCase() == 'u+001b')   this.key = "escape";
        else if (event.keyIdentifier.toLowerCase() == 'enter')    this.key = "return";
        else if (m = event.keyIdentifier.match(/^U\+([\da-f]{4})$/i))
                                                 event.shiftKey ? this.key = chr(parseInt("0x"+m[1])).toUpperCase()
                                                                : this.key = chr(parseInt("0x"+m[1])).toLowerCase();
        else                                                      this.key = event.keyIdentifier.toLowerCase();
    }
    else if (isgraph(charCode))       this.key = chr(charCode);
    else if (charCode < 32 &&
             event.ctrlKey)           this.key = chr(charCode+96); // Safari gives ascii control chars
    else if (charCode == 32)          this.key = "space";
    else if (this.shiftKey && plat.explorer_shift_map[this.keyCode]) this.key = plat.explorer_shift_map[this.keyCode];
    else if (plat.dom_key_code(event) != undefined) this.key = plat.dom_key_code(event);
    else if (plat.key_name[keyCode] != undefined)  this.key = plat.key_name[keyCode];
    else {
        if (isupper(keyCode) && !this.shiftKey) // Stupid explorer!
            keyCode = tolower(keyCode);
        if (isgraph(keyCode))         this.key = chr(keyCode); // IE puts things in the keycode
        else if (keyCode == 32)       this.key = "space"; // Explorer
        else                              this.key = "\\"+(keyCode || charCode);
    }
    if (this.shiftKey)this.key = this.key.length == 1 ? this.key.toUpperCase() : "S-"+this.key;
    if (this.altKey)  this.key = "A-"+this.key;
    if (this.metaKey) this.key = "M-"+this.key;
    if (this.ctrlKey) this.key = "C-"+this.key;

//    printf("key: %s, keyCode: %d, charCode: %d\n",this.key,event.keyCode, event.charCode);
};

function PageCoords(el, stop) {
    // Stupid IE counts margins, padding, and borders multiple times in its offsetLeft/offsetTop numbers. To
    // get accurate offsets we have to use its nonstandard getBoundingClientRect() function.  Firefox has this
    // function too. But IE always gives you offsets (+2,+2) for some reason. But we can tell this because
    // they also offset the <body> element by (+2,+2), so we just subtract the body offset from our el's
    // offset. That also saves us from worrying about document.body.scrollTop/Left since stupid
    // getBoundingClientRect() returns coordinates relative to the window.
    if (stop == undefined && 'getBoundingClientRect' in el) {
        var b = document.body.getBoundingClientRect();
        var r = el.getBoundingClientRect();
        return { x: r.left - b.left,
                 y: r.top  - b.top };
    }
    var off = { "x":0, "y":0 };
    for (; el != null && el != stop; el = el.offsetParent) {
        off.x += el.offsetLeft;
        off.y += el.offsetTop;
    }
    return off;
}

function on_load(f) {
    var old = window.onload;
    window.onload = function() {
        if (old) old();
        f();
    };
}
function on_unload(f) {
    var old = window.onunload;
    window.close = window.onunload = function() {
        if (old) old();
        f();
    };
}

// From Newlib:
/* Pseudo-random generator based on Minimal Standard by
   Lewis, Goodman, and Miller in 1969.
 
   I[j+1] = a*I[j] (mod m)

   where a = 16807
         m = 2147483647

   Using Schrage's algorithm, a*I[j] (mod m) can be rewritten as:
  
     a*(I[j] mod q) - r*{I[j]/q}      if >= 0
     a*(I[j] mod q) - r*{I[j]/q} + m  otherwise

   where: {} denotes integer division 
          q = {m/a} = 127773 
          r = m (mod a) = 2836

   note that the seed value of 0 cannot be used in the calculation as
   it results in 0 itself
*/

var __random_seed = 0;
function srand(seed) { __random_seed = seed; }

function rand() {
    var k;
    var s = __random_seed;
    if (s == 0)
        s = 0x12345987;
    k = Math.floor(s / 127773);
    s = (16807 * (s - k * 127773) - 2836 * k);
    if (s < 0)
        s += 2147483647;
    __random_seed = s;
    return s & 0x7fffffff;
}

function makeurlparams(/*params, params, ...*/)
{
    var params = [];
    for (var i=0; i<arguments.length; i++) {
        var component = arguments[i], param;
        if (typeof(component) == "object") {
            for (var p in param = component)
                if (p != undefined && param[p] != undefined)
                    params.push(encodeURIComponent(p) + '=' + encodeURIComponent(param[p]));
        }
    }
    return params.join('&');
}

function makeurl() // makeurl(components..., params...)
{
    var url = [], params = [], protocol='';
    for (var i=0; i<arguments.length; i++) {
        var component = arguments[i], param;
        if (typeof(component) == "object")
            params.push(component);
        else if (component != undefined)
            if (protocol == '' && !url.length && component.match(/:$/))
                protocol = component;
            else
                url.push(encodeURIComponent(component));
    }
    return protocol + url.join('/') + (params.length == 0 ? '' : '?' + makeurlparams.apply(null, params));
}

function loadContent(url, post, f, method, binary) {
    var req;
    if (window.XMLHttpRequest)        // branch for native XMLHttpRequest object
        req = new XMLHttpRequest();
    else if (window.ActiveXObject)    // branch for IE/Windows ActiveX version
        req = new ActiveXObject("Microsoft.XMLHTTP");

    if (req) {
        req.onreadystatechange = function () {
            if (f && req.readyState == 4) {
                if (!window["plat"]) return; // bail out if we lost our context (why is this even possible?)
                try { // we access the req function here to centralize the try/catch
                    var text = req[method || "responseText"], status = req.status, statusText = req.statusText, error;
                } catch (err) {
                    say({"request error: ": err, "text: ": text, "status: ": status, statusText: statusText}); 
                    text = undefined; error = err||"unknown request error";
                }
                if (status != 200 && !url.match(/^file:/)) { // this used to be == 404 which seems a bit too specific
                    text = undefined; error = statusText||"unknown status text";
                }
                //req.onreadystatechange = null;
                if (f)
                    f(text, error, status);
            }
        };
        if (document.URL.match(/^file:\/\//)) { // relative URLs don't seem to work (in Chrome, at least)
            var m,basename = document.URL;
            if (!basename.match(/\/$/))
                basename = (m=basename.match(/^(.*\/)[^\/]+$/)) ? m[1] : "/";
            url = basename + arguments[0];
        }
        try {
            req.open(post ? "POST" : "GET", url, true);
        } catch(e) {
            if (f)
                f(undefined, 'description' in e ? e.description : ""+e, -1);
        }
        if (post) req.setRequestHeader('Content-Type', post.mimetype);
        if (binary && req.overrideMimeType)
            req.overrideMimeType('text/plain; charset=x-user-defined'); // Marcus Granado 2006 [http://mgran.blogspot.com]
        req.send(post ? post.data : null);
    } else {
        alert('Your browser can\'t handle this script');
    }
}
function loadXML(url, f) {
    return loadContent(url, null, f, 'responseXML');
}
var responseBodyToArray_vb = '\n'
+'Function responseBodyToArray(body)\n'
+'    Dim array(), i\n'
+'    ReDim array(LenB(body)-1)\n'
+'    For i = 1 To LenB(body)\n'
+'      array(i-1) = AscB(MidB(body, i, 1))\n'
+'    Next\n'
+'    responseBodyToArray=array\n'
+'End Function\n'
;
function loadBinary(url, f) {
    var ff = function(text, error, status) {
        var data;
        if (text != undefined) {
            if (plat.ie) {
                if (responseBodyToArray_vb) {
                    var script = doc(["script", {type: "text/vbscript"}]);
                    script.text = responseBodyToArray_vb; // script.canHaveChildren is false in IE
                    responseBodyToArray_vb = undefined;
                    document.body.appendChild(script);
                }
                data = responseBodyToArray(text).toArray();
            } else {
                data = Array(text.length);
                for (var i=0; i<text.length; i++)
                   data[i] = text.charCodeAt(i) & 0xff; // extract from UNICODE Private Area: 0xF700-0xF7ff
            }
        }
        return f(data,error,status);
    };
    return loadContent(url, null, ff , plat.ie ? 'responseBody' : 'responseText', true);
}
function loadText(url, f) {
    return loadContent(url, null, f);
}
function _interpJSON(f, text, error, status) {
    var json;
    if (text)
        try { json = eval("____="+text); }
    catch(err) { error = err; }
    if (json && json.status != 'ok') { // allow the json to return an error in a consistent way
        error = json.status;
        json = undefined;
    }
    return f(json, error, status);
}
function interpJSON(f) {
    return function(text, error, status) {
        return _interpJSON(f, text, error, status);
    };
}
function loadJSON(url, f) {
    return loadContent(url, null, interpJSON(f));
}
// For post*: Unlike loadJSON you have to wrap your callback with iterpJSON() if you expect JSON back.
function postForm(url, data, f) {
    // This particular version of IE stupidly won't POST, so use GET instead. Dumb.
    if (plat.ua == "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)")
        return loadContent(url + (url.match(/\?/) ? '&' : '?') + makeurlparams(data), null, f);
    return loadContent(url, {data: makeurlparams(data), mimetype:'application/x-www-form-urlencoded; charset=UTF-8'}, f);
}
function postJSON(url, data, f) {
    return loadContent(url, {data: json(data), mimetype:'application/json; charset=UTF-8'}, f);
}

var debug=1;
on_load(function() { if (URL.param.debug != undefined) debug = URL.param.debug; });
function report_error(where, error, extra) {
    if (debug) {
        printf("Caught error in %s!: %s", where, error);
        print_structure(error, "error");
        print_structure(extra, "extra");
    } else
        postJSON(makeurl('error','report'), merge({Message: "Caught in "+where+": "+error, e:error},
                                                  extra ? { extra: extra } : {}));
}

var print_array = [];
function print(s) {
    var flush;
    if (print_array.push(s) == 1) // cache up requests since innerHTML is slow
        timeout(0, flush = function() {
                    if (print_array.length) {
                        var d = document.getElementById("debug");
                        if (!d) return on_load(flush); // try to print later
                        d.style.display = "block"; // make it appear if it's hidden
                        d.innerHTML += print_array.join("")
                            .replace(/</g,"&lt;").replace(/>/g,"&gt;")
                            .split("\n").join("<br>");
                        print_array = [];
                    }
                });
}

function html_from_dom(el) {
    if (el.nodeType == el.TEXT_NODE)
        return el.data;
    var attributes="";
    if (el.attributes)
        for (var i=0; i<el.attributes.length; i++)
            attributes += " "+el.attributes.item(i).name + "=\"" + el.attributes.item(i).value + "\"";
    return "<"+el.tagName+attributes+">"
          + map(function(e) { return html_from_dom(e) }, el.childNodes).join("")
          + "</"+el.tagName+">"
}

function json(s, name, indent) {
    indent = indent || "";
    var rep = name ? name+" = " : "";
    if (s===null) return rep += "null";
    if (s==undefined) return rep += "undefined";
    switch (typeof(s)) {
        case "function":
        case "number": rep += s.toString(); break;
        case "string": rep += '"'
                           + s.replace(/[\\"\u0000-\u001f]/g, // RFC 4627 section 2.5
                                       function(match) { var c = match.charCodeAt(0);
                                                         return   c == 0x22 ? '\\"'
                                                                : c == 0x5C ? "\\\\"
                                                                : c == 0x2F ? "\\/"
                                                                : c == 0x08 ? "\\b"
                                                                : c == 0x0C ? "\\f"
                                                                : c == 0x0A ? "\\n"
                                                                : c == 0x0D ? "\\r"
                                                                : c == 0x09 ? "\\t"
                                                                : "\\u00"+encodeURIComponent(match).replace("%","");
                                                       })
                           + '"'; break;
        case "boolean": rep += s ? "true" : "false"; break;
        case "object":
            var newindent = indent+"    ";
            var wrap = function(b,a,e) {
                if (a.join(", ").length < 80) return b+" "+a.join(", ")+" "+e;
                return b+"\n"+newindent+a.join(",\n"+newindent)+"\n"+indent+e;
            }
            if      ("nodeType" in s)         rep += "DOM("+html_from_dom(s)+")";
            else if (s.constructor == Array)  rep += wrap('[',map(function(v)   { return               json(v, undefined, newindent) }, s),']');
            else                              rep += wrap('{',map(function(v,k) { return '"'+k+'": ' + json(v, undefined, newindent) }, s),'}');
            break;
        default: rep += '???';
    }
    return rep;
}
function pj(s, name) { print(json(s,name)); }
//on_load(function() { printf("This is a %j test\n", {a:1, b:"Hello", c:{d:"yo", e:-1}, d:[0,1,2,3,4,5], e:true, f:function(a,b) {return "hello"}}, "eat"); });

function print_structure(s, name) {
    if (!s)
        print(" "+name+" is undefined\n");
    else
        for (var i in s) {
            var rep;
            try { rep = s[i] == undefined        ? "undefined"     : 
                        typeof(s[i]) == "string" ? '"'+s[i]+'"'    :
                        s[i].toString            ? s[i].toString() : "???"; }
            catch(err) { rep = "!" + (typeof(err) == "string" ? err : typeof(err)) + "!"; }
            print(" "+name+"."+i+"="+rep+"\n");
        }
    print("--------------\n");
}

function sprintf(format) {
    var f = format.replace(/%%/g, "%q"); // hack so split doesn't lose our escaped %
    var chunk = f.split(/%/);
    var out="";
    if (f.slice(0,1) != '%' || chunk[0] == "") { // Skip the next steps on IE since it does split *WRONG*!!! Bastards.
        out = chunk[0];  // First one is a special case--no % was there so don't process it
        chunk.shift();
    }
    var a = 1;
    for (var c in chunk) {
        var m = chunk[c].match(/^([-#0 +]?)(\d*|\*)(?:\.(\d*|\*))?([dsfxqjc])/);
        if (m == undefined) { out += "[Bad printf sequence: %"+chunk[c]+"]"; continue; }
        if (m[3]=="") m[3]=0; // 3. => 3.0
        var width = parseInt(m[2] == "*" ? arguments[a++] : m[2]),
            prec  = parseInt(m[3] == "*" ? arguments[a++] : m[3]),
            flags = {};
        for (var i=0;i<m[1].length;i++)
            flags[m[1].slice(i,1)] = 1;
        if (m) {
            chunk[c] = chunk[c].slice(m[0].length); // remove the params from the start
            var arg="", prefix=" ", suffix=" ";
            function pad(s, c, n, right) {
                var p = "";
                if (n) for (var i=0; i<Math.max(0, n - s.length); i++) p += c;
                return right ? s+p : p+s;
            }
            switch(m[4]) {
                case 'q': out += "%"; break;
                case 'd': arg += pad(parseInt(arguments[a++]),"0",prec); break;
                case 's': arg += arguments[a++]; if (prec) arg = arg.slice(0, prec); break;
                case 'f': arg += parseFloat(arguments[a++]).toFixed(prec == undefined ? 10 : prec); break;
                case 'x': arg += pad(parseInt(arguments[a++]).toString(16), "0", prec); break;
                case 'j': arg += json(arguments[a++]); break;
                case 'c': arg += typeof arguments[a] == "string" ? arguments[a++].slice(0,1)
                                                                 : String.fromCharCode(arguments[a++]); break;
            }
            if (flags['-'] || prec) flags['0'] = 0; // read the man page
            out += pad(arg, flags['0'] ? "0" : nbsp, width, flags['-']);
        }
        out += chunk[c];
    }
    return out;
}

function printf(format) {
    print(sprintf.apply(null,arguments));
} 

function say(hash) {
    s = [];
    for (var v in hash)
        s.push(v + "=" + hash[v]);
    print(s.join(", ")+"\n");
} 

function timeout(delay_ms, callback) {
    return setTimeout(callback, delay_ms);
}
function cancel_timeout(id) {
    clearTimeout(id);
}

function ParseURL(url) {
    var u = { raw:url };
    u.base = u.raw.split('?')[0];
    u.params = u.raw.split('?')[1];
    u.param = {};
    if (u.params) {
        var param = u.params.split('&');
        for (var p in param) {
            if (m = param[p].match(/^([^=]+)=(.*)$/))
                u.param[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }
    }
    return u;
}
var URL = ParseURL(document.URL);

function new_alert(dom_el, options) {
    if (options == undefined) options = {};
    var w = options.width || 300, h = options.height || 200;
    var titlebar;
    var goaway = !options.goaway ? {} :
        doc(["a", { href: "", onclick: function() { close_alert(div); return false; } },
                  doc.img("alert/close-box.png")]);

    var div = doc(["div", {className: "alertbox",
                             style:     { display:  "block",
                                          position: plat.has_position_fixed ? "fixed" : "absolute",
                                          height:   "auto",
                                          left:     (plat.windowWidth()/2 - w/2) + "px",
                                          bottom:   "auto",
                                          right:    "auto",
                                          zIndex:   1000000 } },
        ["table",
           ["tbody",
               ["tr",
                      ["td", {className: "ttl"}, nbsp],
                      ["td", {className: "ttm"}, nbsp],
                      ["td", {className: "ttr"}, nbsp]],
               ["tr",
                      ["td", {className: "tbl"}, nbsp],
                      ["td", {className: "tbm"},
                             titlebar = doc(["div", { className:   "titlebar" },
                                               ["table", { width:"100%" },
                                                  ["tbody",
                                                      ["tr",
                                                             ["td", {},              plat.mac ? goaway : {}],
                                                             ["td", {align:"center", width:"100%"}, options.title || nbsp],
                                                             ["td", {align:"right"}, plat.mac ? {} : goaway]]]]])],
                      ["td", {className: "tbr"}, nbsp]],
               ["tr",
                      ["td", {className: "ctl"}, nbsp],
                      ["td", {className: "ctm"},
                             ["div", { className: "alert", style: { width: px(w) } },
                                     dom_el]],
                      ["td", {className: "ctr"}, nbsp]],
               ["tr",
                      ["td", {className: "cbl"}, nbsp],
                      ["td", {className: "cbm"}, nbsp],
                      ["td", {className: "cbr"}, nbsp]]]]]);


    titlebar.onmousedown = function(event) {
        var e = new plat.event(event, titlebar);
        var drag = { cx:e.pageX, cy:e.pageY, ox:div.offsetLeft, oy:div.offsetTop,
                     old_move: document.onmousemove, old_up:   document.onmouseup };
        document.onmousemove = function(event) {
            var e = new plat.event(event, titlebar);
            div.style.left = px(drag.ox + e.pageX - drag.cx);
            div.style.top  = px(drag.oy + e.pageY - drag.cy);
            return false;
        }
        document.onmouseup = function(event) {
            var e = new plat.event(event, titlebar);
            document.onmousemove = drag.old_move;
            document.onmouseup   = drag.old_up;
            return false;
        }
        return false;
    };

    div.unregister_escape = plat.register_key_events(document, wrap(this, function(e) {
        if (e.key == "escape") {
            close_alert(div);
            if (options.cancel)
                options.cancel();
            return false;
        }
    },"keydown"));

    document.body.appendChild(div);
    div.style.top = px(Math.max(0, plat.windowHeight()/2 - div.clientHeight/2));
    return div;
}

function close_alert(alert) {
    alert.style.display = "none";
    if (alert.unregister_escape)
        alert.unregister_escape();
    try { document.body.removeChild(alert); }
    catch(e) { /* Could be closed already. We don't care. */ }
}

function new_text_alert(message) {
    var lines=message.split(/\n/);
    var div = document.createElement("div");
    var p;
    for (var l in lines)
        div.appendChild(doc(["p", { align:"center" }, lines[l]]));
    var close;
    div.appendChild(p = doc(["p", { align:"center" },
                                  close = doc(["a", {href:""} , "Click to close"])]));
    var alert = new_alert(div, {goaway:true});
    p.style.fontSize = "x-small";
    close.onclick = function() {
        close_alert(alert);
        return false;
    };
    return alert;
}

function CookieClass() {
    this.reload();
}
CookieClass.prototype.reload = function() {
    this.list = {};
    if (document.cookie == "")
        return;
    var cookie = document.cookie.split(/\s*;\s*/);
    for (var c in cookie)
        this.list[decodeURIComponent(cookie[c].split("=")[0])] = decodeURIComponent(cookie[c].split("=")[1]);
}
CookieClass.prototype.set = function(key, value, max_age, path, domain, port) {
    var cookie = key + "=";
    if (value  != undefined) cookie += encodeURIComponent(value);
    else /* Delete */        cookie += ";expires=Sat, 19 Jan 1974 04:31:24 GMT";
    if (path   != undefined) cookie += ";path="   + path;
    if (domain != undefined) cookie += ";domain=" + domain;
    if (port   != undefined) cookie += ";port="   + port;
    if (max_age!= undefined && value) {
        var m = max_age.match(/^(\d+)([smhdwy])$/);
        if (!m) printf("Bad age \"%s\".", max_age);
        var seconds = { s:1, m:60, h:60*60, d:60*60*24, w:60*60*24*7, y:60*60*24*365 };
        cookie += ";max-age=" + m[1] * seconds[m[2]];
    }
    document.cookie = cookie;
    this.reload();
};
var Cookie = new CookieClass;

var doc = function (array) {
    var valid = function (a, array) {
        if (a === undefined || a === null)
            printf("undefined value in: %j\n", array);
        else
            return true;
    };
    if (array.constructor === String)
        return document.createTextNode(array);
    var el = array[0];
    if (typeof el.nodeType === "undefined")
        el = el.charAt(0) == "#"
            ? document.getElementById(el.substring(1))
            : document.createElement(el);

    for (var i=1, l=array.length; i<l; i++) {
        var a = array[i];
        if (!valid(a, array))
            continue;
        if (a.constructor === Array) {
            if (a.length === 0 || a[0].constructor === Array)
               for (var j in a) // [[],[],...] ==> [],[],...
                 el.appendChild(doc(a[j]))
            else
               el.appendChild(doc(a));
        }
        else if (typeof a.nodeType !== "undefined")
            el.appendChild(a);
        else if (a.constructor === Object)
            for (var p in a) {
                var ap = a[p];
                if (valid(ap,a) && ap.constructor === Object)
                  for (s in ap)
                    el[p][s] = ap[s];
                else
                  el[p] = ap;
            }
        else
            el.appendChild(document.createTextNode(a));
    }
    return el;
}
doc.el = function(elem, props) {
        var el = document.createElement(elem);
        if (elem == "table") {
            arguments[0] = "tbody";
            var tbody = doc.el.apply(null, arguments);
            // Safari can't do: arguments = [ "xxx", {}, tbody];
            arguments[0] = "xxx";
            arguments[1] = {};
            arguments[2] = tbody;
            arguments.length=3
        }
        if (props)
            for (var p in props)
                if (p != "style")
                    el[p] = props[p];
                else
                    for (var s in props.style)
                        el.style[s] = props.style[s];

        if (arguments.length > 2)
            doc.append_array(el, arguments, 2);
        return el;
    },
doc.text = function(text) {
        return document.createTextNode(text);
    },
doc.id = function(id) { return document.getElementById(id); },
doc.append_array = function(dom_el, array, start) {
        for (var a=start||0; a<array.length; a++)
            if (array[a])
                if (array[a].constructor == Array) // Flatten nested arrays.
                    doc.append_array(dom_el, array[a]);
                else
                    dom_el.appendChild(array[a]);
    },
doc.appendTo = function(dom_el) {
        doc.append_array(dom_el, arguments, 1);
    },
doc.img = function(src) {
        var img;
        if (!plat.ie || plat.ie >= 7) {
            img=doc(["img", {src:src}]);
            img.set_src = function(src) { img.src = src; return img; };
            img.set_alt = function(alt) { img.alt = alt; };
            img.set_size = function(size) { img.width = size.width; img.height = size.height };
        } else {
            img = doc(["div", { style: { display:"inline-block", width:"1px", height:"1px" } }]);
            img.set_src = function(src) {
                img.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader( src='"+src+"');";
            };
            img.set_alt = function(alt) { }
            img.set_size = function(w,h) { img.style.width = px(w); img.style.height = px(h); };
            img.set_src(src);
        }
        return img;
    },
doc.opacity = function(el, percent) {
        el.style.opacity = percent;
        if (plat.ie < 9) {
            if (plat.ie <= 6)
                return; // below filter conflicts with cards AlphaImageLoader filter.
            el.style['-ms-filter'] = 'progid:DXImageTransform.Microsoft.Alpha(Opacity='+percent*100+')';
            el.style.filter = 'alpha(opacity=' + percent*100 + ')';
        }
    }
doc.click = function(el) {
    if (el.nodeName == 'A') // Firefox doesn't follow <a> links on synthetic click events :-(
        location = el.href;
    else if (document.createEvent) { // Firefox, DOM Level 2,3 Events:
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("click", true, true, document.defaultView,
                           1, 0, 0, 0, 0, false, false, false, false, 0, null);
        return el.dispatchEvent(evt);
    } else if (el.click) // IE
        el.click();
};


function px(x) {
    return x+"px"
}

function chr(code) { return String.fromCharCode(code); }
function asc(chr)  { return chr.charCodeAt(0); }
function isupper(c) { return c >= 65 && c <= 90; };
function islower(c) { return c >= 97 && c <= 122; };
function isdigit(c) { return c >= 48 && c <= 57; };
function ispunct(c) { return c >= 33 && c <= 47 || c >=  58 && c <=  64 ||
                             c >= 91 && c <= 96 || c >= 123 && c <= 126; }
function isspace(c) { return c == 9 || c == 10 || c == 11 || c == 13 || c == 28; }
function isalpha(c) { return isupper(c) || islower(c); };
function isalnum(c) { return isalpha(c) || isdigit(c); };
function isgraph(c) { return isalnum(c) || ispunct(c); };
function isprint(c) { return isalnum(c) || ispunct(c) || isspace(c); };
function tolower(c) { return isupper(c) ? c + (97-65) : c; };

function wrap(context, f) {
    return function() {
        return f.apply(context, arguments);
    };
}

function merge_into(to /*, from, [from, ...]*/)
{
    for (var a=1; a<arguments.length; a++)
        for (var i in arguments[a])
            to[i] = arguments[a][i];
    return to;
}
function merge(/*a, [b, ...]*/)
{
    Array.prototype.unshift.call(arguments,{});
    return merge_into.apply(null, arguments);
}

function filter(f,a) {
    var b = [];
    for (var i in a)
        if (f(a[i]))
            b.push(a[i]);
    return b;
}
function filter_obj(f,a) {
    var b = [];
    for (var i in a)
        if (f(a[i], i))
            b[i] = a[i];
    return b;
}
function map(f,a) {
    var b = [];
    for (var i in a)
        b.push(f(a[i],i));
    return b;
}
function map_obj(f,a) {
    var b = {};
    for (var i in a) {
        var o = {};
        o[i] = a[i];
        merge_into(b, f(i,o));
    }
    return b;
}
function arrayize(a) { // For stupid DOM things that look like arrays but don't act like them.
    var b = [];
    for (var i=0; i<a.length; i++)
        b[i] = a[i];
    return b;
}

function rot13(s) {
    var sa = s.split(""), out="";
    for (var c in sa) {
        var base = sa[c].toLowerCase() == sa[c] ? "a".charCodeAt(0) : "A".charCodeAt(0);
        out += (sa[c].toLowerCase()<'a' || sa[c].toLowerCase>'z') ? sa[c] :
            String.fromCharCode((sa[c].charCodeAt(0) - base + 13) % 26+base);
    }
    return out;
}

}