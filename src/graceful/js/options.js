module.exports = function () {
	var options = {},
		graphContainerSelector,
		height = 600,
		width = 800,
		minMagnification = 0.1,
		maxMagnification = 4,
		logoItem,
        metaInfoItem,
		sidebar;

	options.sidebar= function(s){
		if (!arguments.length) return sidebar;
		sidebar = s;
		return options;

	};

	options.logo=function(l){
        if (!arguments.length) return logoItem;
        logoItem=l;
        return options;

    };

    options.metaInfo=function(mi){
        if (!arguments.length) return metaInfoItem;
        metaInfoItem=mi;
        return options;
	};

	options.graphContainerSelector = function (p) {
		if (!arguments.length) return graphContainerSelector;
		graphContainerSelector = p;
		return options;
	};

	options.height = function (p) {
		if (!arguments.length) return height;
		height = +p;
		return options;
	};

	options.minMagnification = function (p) {
		if (!arguments.length) return minMagnification;
		minMagnification = +p;
		return options;
	};

	options.maxMagnification = function (p) {
		if (!arguments.length) return maxMagnification;
		maxMagnification = +p;
		return options;
	};

	options.width = function (p) {
		if (!arguments.length) return width;
		width = +p;
		return options;
	};



	return options;
};
