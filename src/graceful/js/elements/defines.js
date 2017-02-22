module.exports = (function () {
    var defines= {};

    defines.ROUND = "ROUND";
    defines.RECT = "RECT";
    defines.CL = function (text) {
        console.log(text);
    };


    return function () {
        // Encapsulate into function to maintain default.module.path()
        return defines;
    };
})();