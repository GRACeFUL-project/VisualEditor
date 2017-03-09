module.exports = function () {

	var app = {},
		graph = graceful.graph(),
		options = graph.graphOptions(),
		// languageTools = graceful.util.languageTools(),
		GRAPH_SELECTOR = "#graph",

		sidebar = require("./sidebar")(graph),
        buttonsMenu= require("./menu/buttonsMenu")(graph);


		var logo=require("./logo")();

		var metaInfo=require("./metaInfo")(graph);



	app.initialize = function () {
		buttonsMenu.setup();
		sidebar.setup();
		logo.setup();
		metaInfo.setup();
		options.graphContainerSelector(GRAPH_SELECTOR);
		options.logo(logo);
		options.metaInfo(metaInfo);
		d3.select(window).on("resize", adjustSize);
		graph.start();
        adjustSize();

	};

	function adjustSize() {
		var graphContainer = d3.select(GRAPH_SELECTOR),
			svg = graphContainer.select("svg"),
			height = window.innerHeight,
			width = window.innerWidth;

		graphContainer.style("height", height + "px");
		svg.attr("width", width)
			.attr("height", height);

		options .width(width)
    			.height(height);
		graph.updateStyle();

	}
	return app;
};
