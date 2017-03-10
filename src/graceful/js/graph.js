var _ = require("lodash/core");
var nodeElement= require("./elements/nodeElement")();
var linkElement= require("./elements/linkElement")();
var portlinkElement= require("./elements/portLinkElements")();

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
		port_linkContainer=[],
		cI=0,
		inputJsonText,
        inputParser= require("./inputParser")(graph),
		classNodes,
		zoom;


    graph.getOutputJSON=function(name,exportJsonButton){
        console.log("want to write the file");
        var TBOX=inputParser.getTBOX();
        var header=inputParser.getHeader();
        console.log("TBOX"+TBOX);

        var exportObj = {};
        exportObj.header=header;
        exportObj.TBOX=TBOX;

        // create ABOX;

		if (instance_container.length>0){
			// adding the aBOX TO exportOBJ
            var ABOX={};
            ABOX.nodes=[];
            for (var i=0;i<instance_container.length;i++)
			{
				var tempNodeOBJ={};
				var node=instance_container[i];
				tempNodeOBJ.name       = node.label();
                tempNodeOBJ.imgURL     = node.imageURL();
                tempNodeOBJ.hoverText  = node.hoverText();
				tempNodeOBJ.parameters = [];
				console.log("PARAMETERS"+node.getParamaters());
				for (var x=0;x<node.getParamaters().length;x++){
					tempNodeOBJ.parameters.push(node.getParamaters()[x]);
				}
				tempNodeOBJ.identity   = node.id();
                tempNodeOBJ.interface  = [];

                for (var j=0;j<node.getPortObjs().length;j++){
                	var tempPort={};

                    tempPort.name=node.getPortObjs()[j].label();
                    tempPort.type=node.getPortObjs()[j].elementType();
                    tempPort.hoverText=node.getPortObjs()[j].hoverText();
                    tempPort.imgURL=node.getPortObjs()[j].imageURL();
                    tempPort.rotation=node.getPortObjs()[j].rotationEnabled();
                    tempPort.connection=[];
                    var con=node.getPortObjs()[j].getConnections();
                    for (var c=0;c<con.length;c++)
                        tempPort.connection.push(con[c]);
                    tempNodeOBJ.interface.push(tempPort);
				}
				ABOX.nodes.push(tempNodeOBJ);
			}
			exportObj.ABOX=ABOX;

		}


		return exportObj;




    };


	graph.connectionMode=function(){
		return followNodeElement;
	};
	graph.getTestObject=function(){ return testObj;};
	graph.setJSONInputText=function(txt){
		inputJsonText=txt;

		classNodes=inputParser.parse(inputJsonText);
        redrawContent();
		var instanceNodes=inputParser.parseABOX(inputJsonText);
		if (instanceNodes.highestId>0)
			cI=instanceNodes.highestId+1;

		// check connections
		if (instanceNodes.connections.length>0){
			// add connections;

			for (var iC=0;iC<instanceNodes.connections.length;iC++){
				// identify the nodes
				var con=instanceNodes.connections[iC];
				var friendId=con.friendId;
				var friendPort=con.portName;

				console.log("friendId: "+friendId+"  portName "+friendPort);
				var startNode=con.node;
				var startPort=con.port;
				var endNode;
				var endPort;
				// search for the endNode;
				for (var iE=0;iE<instanceNodes.nodes.length;iE++){
					if (instanceNodes.nodes[iE].id()===friendId)
						endNode=instanceNodes.nodes[iE];
				}
				// find endPort
				for (var iP=0;iP<endNode.getPortObjs().length;iP++){
					if (endNode.getPortObjs()[iP].label()===friendPort){
						endPort=endNode.getPortObjs()[iP];
					}
				}

                addForceLink(startNode,endNode);
                addPortLink(startPort,endPort);
                startPort.addConnection(endNode.id(),endPort.label());
                // graph.createLinkBetweenPorts(startPort,endPort);
				console.log("want to create GraphLink  "+startNode.labelForCurrentLanguage()+" "+endNode.labelForCurrentLanguage());

			}

		}

		if (instanceNodes.nodes.length>0){
			for (var i=0;i<instanceNodes.nodes.length;i++)
	            instance_container.push(instanceNodes.nodes[i]);
            updateForceNodes();
		}

        redrawContent();

	};

    function addPortLink(starPort,endPort){
    	console.log("start: "+starPort.label()+"  "+endPort.label());
         var portLink=new portlinkElement(graph);
         portLink.svgRoot(linkLayer);
         portLink.setupPortConnection(starPort,endPort);
         port_linkContainer.push(portLink);
	}
	function addForceLink(startNode,endNode){
            console.log("generating FORCE LINK between "+startNode.labelForCurrentLanguage()+"->"+endNode.labelForCurrentLanguage());
            // we only need one link between these two node;
            var linkExists=false;
            // check if we should generate a link;
            var sLinks=startNode.getLinkElements();
            var eLinks=endNode.getLinkElements();
            var i;
            for (i=0;i<sLinks.length;i++){
                console.log("domain"+ sLinks[i].domain()+ "range"+ sLinks[i].range());
                console.log("domain"+ sLinks[i].domain().labelForCurrentLanguage()+ "range"+ sLinks[i].range().labelForCurrentLanguage());
                if (sLinks[i].domain()=== startNode && sLinks[i].range()===endNode) {
                    linkExists = true;
                }
                if (sLinks[i].domain()=== endNode && sLinks[i].range()===startNode) {
                    linkExists = true;
                }
            }
            for (i=0;i<eLinks.length;i++){
                if (eLinks[i].domain()=== startNode && eLinks[i].range()===endNode) {
                    linkExists = true;
                }
                if (eLinks[i].domain()=== endNode && eLinks[i].range()===startNode) {
                    linkExists = true;
                }
            }

            if (linkExists===true){
                return;
            }
            else{
                // create a link element
                // console.log("CREATE THE LINK between "+startNode+"->"+endNode);
                var link=new linkElement(graph);
                link.domain(startNode);
                link.range(endNode);
                //	link.svgRoot(linkLayer);
                console.log("link created");
                startNode.addLink(link);
            }
	}


    graph.createNewInstanceNode=function(nodeType){
        var node=new nodeElement(graph);
        var classId=nodeType.id();
        node.id(cI);
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

        if (port_linkContainer.length>0){
        	for (i=0;i<port_linkContainer.length;i++) {
                port_linkContainer[i].updateLinkElements();
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


		console.log("redrawing");

		// create container for fixed nodes;

        nodeContainer = graphContainer.append("g").classed("nodeContainer", true);
        linkLayer = nodeContainer.append("g").classed("nodeContainer", true);
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

        console.log("redrawing PORT ELEMENTS");
        for (var i=0;i<port_linkContainer.length;i++){
        	port_linkContainer[i].svgRoot(linkLayer);
        	port_linkContainer[i].drawLinkElements();
		}
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
               // console.log("NODE DRAG START");
            })
            .on("drag", function (d) {
               // console.log("NODE DRAG ");
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
             //   console.log("NODE DRAG END");
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

    graph.createLinkBetweenPorts=function(portA,portB){

		// todo : check if already exists;


        var portLink=new portlinkElement(graph);
        portLink.svgRoot(linkLayer);
        portLink.setupPortConnection(portA,portB);
        port_linkContainer.push(portLink);

        redrawContent();

	};

    graph.createLinkBetweenNodes=function(startNode,endNode){
    	console.log("generating link between "+startNode.labelForCurrentLanguage()+"->"+endNode.labelForCurrentLanguage());

    	// we only need one link between these two node;
		var linkExists=false;
		// check if we should generate a link;
		var sLinks=startNode.getLinkElements();
		var eLinks=endNode.getLinkElements();
		var i;
		for (i=0;i<sLinks.length;i++){
             console.log("domain"+ sLinks[i].domain()+ "range"+ sLinks[i].range());
             console.log("domain"+ sLinks[i].domain().labelForCurrentLanguage()+ "range"+ sLinks[i].range().labelForCurrentLanguage());
			if (sLinks[i].domain()=== startNode && sLinks[i].range()===endNode) {
		        linkExists = true;
            }
			if (sLinks[i].domain()=== endNode && sLinks[i].range()===startNode) {
                linkExists = true;
            }
		}
		for (i=0;i<eLinks.length;i++){
			if (eLinks[i].domain()=== startNode && eLinks[i].range()===endNode) {
                linkExists = true;
            }
			if (eLinks[i].domain()=== endNode && eLinks[i].range()===startNode) {
                linkExists = true;
            }
		}

		if (linkExists===true){
			return;
		}
		else{
			// create a link element
            // console.log("CREATE THE LINK between "+startNode+"->"+endNode);
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

			var x1=parseFloat(testObj.getPortDragingObj().attr("x1"));
            var y1=parseFloat(testObj.getPortDragingObj().attr("y1"));
			var x2=grPos.x-parPos.x-testObj.x;
			var y2=grPos.y-parPos.y-testObj.y;


			var dirX=x2-x1;
            var dirY=y2-y1;

            var length=Math.sqrt(dirX*dirX+dirY*dirY);
            var nX=dirX/length;
            var nY=dirY/length;

			testObj.getPortDragingObj().attr("x2",x2-5*nX)
				                       .attr("y2",y2-5*nY);





	};


	return graph;
};
