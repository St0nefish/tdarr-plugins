"use strict";
var CropInfo = /** @class */ (function () {
    // constructor
    function CropInfo(w, h, x, y) {
        if (h === void 0) { h = 0; }
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        var _this = this;
        // width
        this.w = 0;
        // height
        this.h = 0;
        // x offset
        this.x = 0;
        // y offset
        this.y = 0;
        // toString
        this.toString = function () { return "".concat(_this.w, ":").concat(_this.h, ":").concat(_this.x, ":").concat(_this.y); };
        this.w = w;
        this.h = h;
        this.x = x;
        this.y = y;
    }
    return CropInfo;
}());
