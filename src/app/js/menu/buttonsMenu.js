/**
 * Contains the search "engine"
 *
 * @param graph the associated webvowl graph
 * @returns {{}}
 */
module.exports = function (graph) {
	var buttonsMenu = {};

	buttonsMenu.setup = function () {
		var addRoundNode= d3.select("#add_roundNode");
		addRoundNode.on("click",function(){
			// console.log("I was pressed");
			graph.addRoundNode();
		});
	};

	return buttonsMenu;
};
