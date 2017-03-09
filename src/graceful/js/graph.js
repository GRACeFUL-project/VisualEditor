var _ = require("lodash/core");
var nodeElement= require("./elements/nodeElement")();
var linkElement= require("./elements/linkElement")();


module.exports = function (graphContainerSelector) {
	var graph = {},
		options = require("./options")(),
		language = "default",
		paused = false,
        masterContainer,
		graphContainer,
		nodeContainer,
		linkLayer,

	// draging variables
		followNodeElement=false,

	// Visual elements
		nodeElements,
		testObj,
        fixedNodeContainer,

	// Graph behaviour
		force,
		dragBehaviour,
		zoomFactor,
		graphTranslation,
// FPS computation
		then,
		now,
// NODE CONTAINERS
		instance_container=[],
		link_container=[],
		cI=0,
		inputJsonText,
        inputParser= require("./inputParser")(graph),
		classNodes,
		zoom;

	graph.connectionMode=function(){
		return followNodeElement;
	};
	graph.getTestObject=function(){ return testObj;};
	graph.setJSONInputText=function(txt){
		inputJsonText=txt;

		classNodes=inputParser.parse(inputJsonText);


        redrawContent();

	};


    graph.createNewInstanceNode=function(nodeType){
        var node=new nodeElement(graph);
        var classId=nodeType.id();
        node.id(classId+"_"+cI);
        node.deepCopy(nodeType);
        node.elementType("INSTANCE");
        cI++;
        instance_container.push(node);
        updateForceNodes();
        redrawContent();
	};

	graph.addRoundNode=function(){
	//	console.log("requesting a new  ROUND node");
		// create new node element
		var node=new nodeElement(graph);
		node.id(cI);
		node.label("NodeID_"+cI);
		cI++;
		instance_container.push(node);
		updateForceNodes();
        redrawContent();
	};

	function updateForceNodes(){
		force.nodes(instance_container);
		var forceLinks=[];
		// concat the links of the instance container;
		for (var i=0;i<instance_container.length;i++) {
			var currentNode = instance_container[i];
			var nodeLinks = currentNode.getLinks();
			forceLinks = forceLinks.concat(nodeLinks);
		}
		force.links(forceLinks);
		console.log("Force Nodes",force.nodes());
		console.log("Force Links",force.links());

		if (options.logo().drawForceNodesNumber()===true)
        	d3.select("#numForceNodes").node().innerHTML="#forceNodes:"+force.nodes().length;
	}

	function recalculatePositions() {
        if (force) {
            var nodes = force.nodes();
			for (var i = 0; i < nodes.length; i++) {
            	nodes[i].updateRendering();
            }
        }
        now = Date.now();
        var diff=now-then;
        var fps=(1000 / (diff)).toFixed(2);
        if (options.logo().drawFps()===true)
        	d3.select("#framesText").node().innerHTML="FPS: "+fps;
        then=Date.now();
    }

    graph.update = function () {

    };

	/** Loads all settings, removes the old graph (if it exists) and draws a new one. */
	graph.start = function () {
		redrawGraph();
		force.start();
		console.log("Force started");
		graph.paused(false);
	};

	/**    Updates only the style of the graph. */
	graph.updateStyle = function () {
	 	refreshGraphStyle();
	 	force.start();
	 };

	graph.load = function () {
		force.stop();
        force.on("tick", recalculatePositions());
        force.start();
	};



	graph.paused = function (p) {
		if (!arguments.length) return paused;
		paused = p;
		graph.updateStyle();
		return graph;
	};

	/** setting the zoom factor **/
	graph.setZoom = function (value) {
		zoom.scale(value);
	};

	/** setting the translation factor **/
	graph.setTranslation = function (translation) {
		zoom.translate([translation[0], translation[1]]);
	};


	function redrawGraph() {
		remove();

		masterContainer = d3.selectAll(options.graphContainerSelector())
			.append("svg")
			.classed("vowlGraph", true)
			.attr("width", options.width())
			.attr("height", options.height())
			.call(zoom);
        graphContainer=masterContainer.append("g");
		linkLayer = graphContainer.append("g").classed("linkContainer", true);

	}

	/**
	 * removes data when data could not be loaded
	 */
	graph.clearGraphData=function(){
	};

	function redrawContent() {
		if (!graphContainer) {
			return;
		}

		// Empty the graph container
		graphContainer.selectAll("*").remove();

		// create container for fixed nodes;
        nodeContainer = graphContainer.append("g").classed("nodeContainer", true);
		fixedNodeContainer=graphContainer.append("g").classed("nodeContainer", true);

        // Draw nodes
        // add classNodes to Fixed container;
        if (classNodes.length>0) {
            var fixed = fixedNodeContainer.selectAll(".node")
                .data(classNodes).enter()
                .append("g")
                .classed("node", true)
                .attr("id", function (d) {
                    return d.id();
                });
            //.call(dragBehaviour);
			var index=0;
            fixed.each(function (node) {
                node.x = 60;
                node.y = 200 + index * 110;
                node.drawNodeElement(d3.select(this));
                node.updateRendering();
                index++;
            });
        }


		if (force.nodes().length===0){
			console.log("Nothing to render");
			return;
		}
        // console.log("I want to render #nodes "+force.nodes());
        nodeElements = nodeContainer.selectAll(".node")
            .data(force.nodes()).enter()
            .append("g")
            .classed("node", true)
            .attr("id", function (d) {
                return d.id();
            })
            .call(dragBehaviour);
        nodeElements.each(function (node) {
            node.drawNodeElement(d3.select(this));
        });
        force.start();
        refreshGraphStyle();
	}
	/**
	 * Applies all options that don't change the graph data.
	 */
	function refreshGraphStyle() {
		 zoom = zoom.scaleExtent([options.minMagnification(), options.maxMagnification()]);
		 if (nodeContainer) {
		 	zoom.event(nodeContainer);
		 }

		 force.size([options.width(), options.height()]);// add
         force.charge(function (element) {
            return element.charge();
        });
        force.gravity(0.025);
        force.linkStrength(1); // Flexibility of links
		force.linkDistance(400);
		force.linkStrength(options.linkStrength()); // Flexibility of links
     	force.nodes().forEach(function (n) {
		 	n.frozen(paused);
		 });
	}

	function remove() {
		if (graphContainer) {
			// Select the parent element because the graph container is a group (e.g. for zooming)
			d3.select(graphContainer.node().parentNode).remove();
		}
	}

	graph.options = function () {
		return options;
	};

	graph.language = function (newLanguage) {
		if (!arguments.length) return language;

		if (language !== newLanguage) {
			language = newLanguage || "default";
			redrawContent();
			recalculatePositions();
		}
		return graph;
	};

    function zoomed() {
        nodeContainer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        zoomFactor = d3.event.scale;
        graphTranslation = d3.event.translate;
    }

    function initializeGraph() {
        now = Date.now();
        then = Date.now();
        options.graphContainerSelector(graphContainerSelector);
        force = d3.layout.force()
            .on("tick", recalculatePositions);
        dragBehaviour = d3.behavior.drag()
            .origin(function (d) {
                return d;
            })
            .on("dragstart", function (d) {
                d3.event.sourceEvent.stopPropagation(); // Prevent panning
                d.locked(true);
                console.log("NODE DRAG START");
            })
            .on("drag", function (d) {
                console.log("NODE DRAG ");
                d.px = d3.event.x;
                d.py = d3.event.y;
                force.resume();
                if(paused===true){
                    // redraw the position of the node;
                    d.updateRendering();
                    //d.updateNodePos();
                    //d.updateFriendsConnections();
                }
            })
            .on("dragend", function (d) {
                console.log("NODE DRAG END");
                d.locked(false);
            });
        // Apply the zooming factor.
        zoom = d3.behavior.zoom()
            .duration(150)
            .scaleExtent([options.minMagnification(), options.maxMagnification()])
            .on("zoom", zoomed);
    }
    initializeGraph();

    graph.graphOptions = function () {
        return options;
    };

    graph.scaleFactor = function () {
        return zoomFactor;
    };
    graph.translation = function () {
        return graphTranslation;
    };

    /** resetting the graph **/
    graph.reset = function () {
        zoom.translate([0, 0])
            .scale(1);
    };

    graph.followObject=function(obj){
    	// obj is here a port draging element.
		testObj=obj;
		// get svg root object
        followNodeElement=true;
        masterContainer.on("mouseup",graph.stopFollow);

        masterContainer.on("mousemove",graph.getMousePositionInGraph);
		//graph.getMousePositionInGraph();
   	};

    graph.createLinkBetweenNodes=function(startNode,endNode){
    	console.log("generating link between "+startNode+"->"+endNode);

    	// we only need one link between these two node;
		var linkExists=false;
		// check if we should generate a link;
		var sLinks=startNode.getLinks();
		var eLinks=endNode.getLinks();
		var i;
		for (i=0;i<sLinks.length;i++){
			if (sLinks[i].domain()=== startNode && sLinks[i].range()===endNode)
				linkExists=true;
			if (sLinks[i].domain()=== endNode && sLinks[i].range()===startNode)
				linkExists=true;
		}
		for (i=0;i<eLinks.length;i++){
			if (eLinks[i].domain()=== startNode && eLinks[i].range()===endNode)
				linkExists=true;
			if (eLinks[i].domain()=== endNode && eLinks[i].range()===startNode)
				linkExists=true;
		}

		if (linkExists){
			console.log("THIS LINK ALREADY EXISTS ... NOTHING TO DO HERE");
		}
		else{
			// create a link element
			var link=new linkElement(graph);
			link.domain(startNode);
			link.range(endNode);
		//	link.svgRoot(linkLayer);
			console.log("link created");
			startNode.addLink(link);
			updateForceNodes();
			redrawContent();
		}

	};
    graph.stopFollow=function () {
    	if (followNodeElement) {
            console.log("Stop follow, and remove node" + followNodeElement);
            masterContainer.on("mousemove", function () {
            });
            testObj.removeTempArrow();
            followNodeElement = false;
            testObj=null;
        }

    };
    // The magic function - converts node positions into positions on screen.
        function getScreenCoords(x, y, translate, scale) {
        var xn=(x-translate[0])/scale;
        var yn=(y-translate[1])/scale;

        return {x: xn, y: yn};
    }



        graph.getMousePositionInGraph=function(){
			var grPos=getScreenCoords(d3.event.clientX,d3.event.clientY,graphTranslation,zoomFactor);
            var parPos=testObj.getParentPos();
			// one pixel offset in x direction to be able to hover over other elements;

			//get direction offset;
			var x2=grPos.x-parPos.x-testObj.x;
			var y2=grPos.y-parPos.y-testObj.y;


			testObj.getPortDragingObj().attr("x2",x2-2)
				                       .attr("y2",y2-2);





	};


	return graph;
};
