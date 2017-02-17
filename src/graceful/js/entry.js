require("../css/vowl.css");

// var nodeMap = require("./elements/nodes/nodeMap")();
// var propertyMap = require("./elements/properties/propertyMap")();


var graceful = {};
graceful.graph = require("./graph");
graceful.options = require("./options");
graceful.version = "@@GRACEFULL_VERSION";

graceful.util = {};
graceful.util.constants = require("./util/constants");
graceful.util.languageTools = require("./util/languageTools");
// graceful.util.elementTools = require("./util/elementTools");


module.exports = graceful;
