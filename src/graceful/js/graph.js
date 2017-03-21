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
		lastSelectedNode=undefined,
		zoom,
// Library ControlElements
		libraryZoomFactor=1.0,
		controlHoverElement,
		libraryUp,
		libraryDown,
		libraryZoomIn,
		controlsEntered=false,
        libraryStartIndex=0,
		libraryZoomOut;


    graph.updateEditInfo=function(node){
    	// get edit population
		graph.options().sidebar().updateEditInfo(node);
		if (lastSelectedNode===undefined){
			lastSelectedNode=node;
			return;
		}
        if (lastSelectedNode===node){
            lastSelectedNode=undefined;
            graph.options().sidebar().updateEditInfo(undefined);
			return;
		}


		console.log("removing last node highlight");
		lastSelectedNode.focused(true);
		lastSelectedNode.toggleFocus();
		lastSelectedNode=node;


	};


    graph.setJSON_SOLUTION_Text=function(text){
        console.log("got solution text");
        var solutions = inputParser.parseSolution(text);
        // show solotions;
        console.log("-----------------solutions----------------------");
        for (var x=0;x<solutions.length;x++) {
            var nodeId=parseInt(solutions[x].nodeId);

            var instanceId=-1;
            // try to find corresponding Id;
            for (var i=0;i<instance_container.length;i++) {
                if (nodeId===instance_container[i].id()) {
                    instanceId=i;
                    console.log("Found Node : " + solutions[x].nodeId+" At instance With Id "+instanceId);
                }
            }
            if (instanceId===-1){
                console.log("could not Find Node with identity "+nodeId);
                continue;
            }

            // get the portObj of this node
            var ports=instance_container[instanceId].getPortObjs();

            for (var y = 0; y < solutions[x].interfaceValues.length; y++){
                var simpleObj = solutions[x].interfaceValues[y];
                console.log("    InterFace Name " + simpleObj.name);
                console.log("    InterFace Val  " + simpleObj.value);

                var portId=parseInt(simpleObj.name);
                if (portId || portId===0){
                    console.log("Using Integer Id values! ");
                    ports[portId].setValue(simpleObj.value);
                }
                else{
                    console.log("Using Ports Name !, search for  "+simpleObj.name);
                    // search for port
                    for (var p=0;p<ports.length;p++){
                        var port=ports[p];
                        console.log("Test Name "+port.name());
                        if (port.name()===simpleObj.name){
                            console.log("Found Port with name"+port.name());
                            port.setValue(simpleObj.value);
                        }
                    }
                }



            }
            console.log("--------------------");
        }

        // reset selection
        if (lastSelectedNode){
            graph.options().sidebar().updateEditInfo(lastSelectedNode);
        }
    };



    graph.getOutputJSON=function(){
        var exportObj = {};
		if (instance_container.length>0){
			// adding the aBOX TO exportOBJ
            exportObj.nodes=[];
            for (var i=0;i<instance_container.length;i++)
			{
				var tempNodeOBJ={};
				var node=instance_container[i];
				tempNodeOBJ.name       = node.nameValue();
//                tempNodeOBJ.imgURL     = node.imageURL();
//                tempNodeOBJ.hoverText  = node.hoverText();
				tempNodeOBJ.parameters = [];
				for (var x=0;x<node.getParamaters().length;x++){
					tempNodeOBJ.parameters.push(node.getParamaters()[x]);
				}
				tempNodeOBJ.identity   = node.id();
                tempNodeOBJ.interface  = [];

                for (var j=0;j<node.getPortObjs().length;j++){
                	var tempPort={};

                    tempPort.name=node.getPortObjs()[j].label();
                    tempPort.type=node.getPortObjs()[j].elementType();
                    // tempPort.hoverText=node.getPortObjs()[j].hoverText();
                    // tempPort.imgURL=node.getPortObjs()[j].imageURL();
                    // tempPort.rotation=node.getPortObjs()[j].rotationEnabled();
                    var con=node.getPortObjs()[j].getConnections();
					if (con.length>0) {
                        tempPort.connection = [];
                        for (var c = 0; c < con.length; c++)
                            tempPort.connection.push(con[c]);
                    }
                    tempNodeOBJ.interface.push(tempPort);
				}
                exportObj.nodes.push(tempNodeOBJ);
			}
		}
		return exportObj;
    };


	graph.connectionMode=function(){
		return followNodeElement;
	};
	graph.getTestObject=function(){ return testObj;};

    graph.setLibraryText=function(text){
        graph.clearGraphData();
        inputJsonText=text;

        classNodes=inputParser.parseLib(inputJsonText);
        redrawContent();

    };

	graph.setJSONInputText=function(txt){
		graph.clearGraphData();
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
        node.id(cI);
        node.deepCopy(nodeType);
        node.elementType("INSTANCE");
        cI++;
        instance_container.push(node);
        updateForceNodes();
        redrawContent();
	};

    graph.removeNode=function(node2Remove){
        console.log("removing that node "+node2Remove.labelForCurrentLanguage());
        // find this node in the instance container;
        todo: node2Remove.clearConnections();
		var newArray=[];
        for (var i=0;i<instance_container.length;i++){
        	if (instance_container[i]===node2Remove)
        		continue;
        	newArray.push(instance_container[i]);
		}
        instance_container=newArray;
        updateForceNodes();
        redrawContent();
        graph.options().sidebar().updateEditInfo(undefined);

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
        redrawContent();
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
		console.log("removing data");
		classNodes=[];
		instance_container=[];
        port_linkContainer=[];
        controlHoverElement=undefined;
        controlsEntered=false;
        cI=0;
        updateForceNodes();
        redrawGraph();
	};

	function libraryControlElements(){

        // create via node things;
		var layerUpContainer=fixedNodeContainer.append('g');
        var layerDownContainer=fixedNodeContainer.append('g');
        var layerZoomInContainer=fixedNodeContainer.append('g');
        var layerZoomOutContainer=fixedNodeContainer.append('g');

		libraryUp=layerUpContainer.append('image')
            .attr("x", 10)
            .attr("y", 150)
            .attr("width", 30)
            .attr("height", 30)
            .attr("xlink:href",'./data/img/controlUp.png');

        libraryDown=layerDownContainer.append('image')
            .attr("x", 45)
            .attr("y", 150)
            .attr("width", 30)
            .attr("height", 30)
            .attr("xlink:href",'./data/img/controlDown.png');

        libraryZoomIn=layerZoomInContainer.append('image')
            .attr("x", 80)
            .attr("y", 150)
            .attr("width", 30)
            .attr("height", 30)
            .attr("xlink:href",'./data/img/controlZoom.png');

        libraryZoomOut=layerZoomOutContainer.append('image')
            .attr("x", 115)
            .attr("y", 150)
            .attr("width", 30)
            .attr("height", 30)
            .attr("xlink:href",'./data/img/controlZoomOut.png');



        // library Up
        layerUpContainer.on("mouseover", function(){
            // create
            if (controlsEntered===true) {
                controlHoverElement.classed("hidden",false);
                return;
            }
            if (controlHoverElement===undefined && controlsEntered===false) {
                controlsEntered=true;
				controlHoverElement=layerUpContainer.append('rect')
					.attr("x", 10)
					.attr("y", 150)
					.attr("width", 30)
					.attr("height", 30)
					.classed("hoverImage", true);
				controlHoverElement.on("click",function(){
					// console.log("layer Up was clicked");
					library_Up();
				});
                controlHoverElement.on("mouseout", function(){
                    controlHoverElement.classed("hidden",true);
                    controlHoverElement.remove();
                    controlHoverElement=undefined;
                    controlsEntered=false;
                });

            }

        });
        // library DOWN
        layerDownContainer.on("mouseover", function(){
            // create
            if (controlsEntered===true) {
                controlHoverElement.classed("hidden",false);
                return;
            }
            if (controlHoverElement===undefined && controlsEntered===false) {
                controlsEntered=true;
                controlHoverElement=layerDownContainer.append('rect')
                    .attr("x", 45)
                    .attr("y", 150)
                    .attr("width", 30)
                    .attr("height", 30)
                    .classed("hoverImage", true);
                controlHoverElement.on("click",function(){
                    // console.log("layer Down was clicked");
                    library_Down();
                });
                controlHoverElement.on("mouseout", function(){
                    controlHoverElement.classed("hidden",true);
                    controlHoverElement.remove();
                    controlHoverElement=undefined;
                    controlsEntered=false;
                });

            }

        });

        // library ZoomIn
        layerZoomInContainer.on("mouseover", function(){
            // create
            if (controlsEntered===true) {
                controlHoverElement.classed("hidden",false);
                return;
            }
            if (controlHoverElement===undefined && controlsEntered===false) {
                controlsEntered=true;
                controlHoverElement=layerZoomInContainer.append('rect')
                    .attr("x", 80)
                    .attr("y", 150)
                    .attr("width", 30)
                    .attr("height", 30)
                    .classed("hoverImage", true);
                controlHoverElement.on("click",function(){
                    // console.log("layer ZoomIn  was clicked");
                    library_ZoomIn();
                });
                controlHoverElement.on("mouseout", function(){
                    controlHoverElement.classed("hidden",true);
                    controlHoverElement.remove();
                    controlHoverElement=undefined;
                    controlsEntered=false;
                });

            }

        });

        // library Up
        layerZoomOutContainer.on("mouseover", function(){
            // create
            if (controlsEntered===true) {
                controlHoverElement.classed("hidden",false);
                return;
            }
            if (controlHoverElement===undefined && controlsEntered===false) {
                controlsEntered=true;
                controlHoverElement=layerZoomOutContainer.append('rect')
                    .attr("x", 115)
                    .attr("y", 150)
                    .attr("width", 30)
                    .attr("height", 30)
                    .classed("hoverImage", true);
                controlHoverElement.on("click",function(){
                    // console.log("layer ZoomOut was clicked");
                    library_ZoomOut();
                });
                controlHoverElement.on("mouseout", function(){
                    controlHoverElement.classed("hidden",true);
                    controlHoverElement.remove();
                    controlHoverElement=undefined;
                    controlsEntered=false;
                });

            }

        });
    }

    function library_Up(){
        libraryStartIndex=libraryStartIndex+1;
        if (libraryStartIndex>classNodes.length-1)
            libraryStartIndex=classNodes.length-1;

        controlHoverElement=undefined;
        controlsEntered=false;
        redrawContent();

    }
    function library_Down() {
        libraryStartIndex=libraryStartIndex-1;
        if (libraryStartIndex<0)
            libraryStartIndex=0;

        controlHoverElement=undefined;
        controlsEntered=false;
        redrawContent();

    }
    function library_ZoomOut(){
		libraryZoomFactor=0.9*libraryZoomFactor;
        if (libraryZoomFactor<0.1){
            libraryZoomFactor=0.1;
        }
		controlHoverElement=undefined;
        controlsEntered=false;
		redrawContent();


	}
    function library_ZoomIn(){
        libraryZoomFactor=1.1*libraryZoomFactor;
        if (libraryZoomFactor>1.0){
            libraryZoomFactor=1.0;
        }
        controlHoverElement=undefined;
        controlsEntered=false;
        redrawContent();

    }


	function redrawContent() {
		if (!graphContainer) {
			return;
		}

		// Empty the graph container
		graphContainer.selectAll("*").remove();

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
			var tIndex=0;
			// console.log("nuber of nodes="+fixed.length);

            fixed.each(function (node) {
                if (tIndex>=libraryStartIndex) {
                    node.x = node.radius() + 10;
                    // console.log("Library Zoom Factor" + libraryZoomFactor);
                    node.y = (240 - (1.0 - libraryZoomFactor) * node.radius() + (index * libraryZoomFactor * 2 * (node.radius() + 10)));
                    // console.log("Y POs" + node.y);
                    node.zoomFactor(libraryZoomFactor);
                    node.drawNodeElement(d3.select(this));
                    node.updateScaleFactor();
                    index++;
                }
                tIndex++;
            });
            // add libraryControlElements
			libraryControlElements();
        }


		if (force.nodes().length===0){
			console.log("Nothing to render");
			return;
		}
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

    graph.removeLinksBetweenPorts=function(portA,portB) {

    	var newPorts=[];
    	for (var i=0;i<port_linkContainer.length;i++){
    		if (port_linkContainer[i].connectionExists(portA,portB)) {
    			portA.resetState();
                portB.resetState();
                continue;
            }
    		newPorts.push(port_linkContainer[i]);
		}
    	port_linkContainer=newPorts;
		redrawContent();
    };
    graph.createLinkBetweenPorts=function(portA,portB){

		// todo : check if already exists;


        var portLink=new portlinkElement(graph);
        portLink.svgRoot(linkLayer);
        portLink.setupPortConnection(portA,portB);
        port_linkContainer.push(portLink);

        redrawContent();

	};

    graph.removeLinkBetweenNodes=function(nodeA,nodeB){
    	console.log("remove links between nodes if necessary");
		console.log("nodeA "+nodeA.labelForCurrentLanguage());
        console.log("nodeB "+nodeB.labelForCurrentLanguage());

        var linkElement=undefined;
        var sLinks=nodeA.getLinkElements();
        var eLinks=nodeB.getLinkElements();

        var i,aLink;
        for (i=0;i<sLinks.length;i++){
        	aLink=sLinks[i];
        	if (aLink.domain()===nodeA && aLink.range()===nodeB) linkElement=aLink;
            if (aLink.domain()===nodeB && aLink.range()===nodeA) linkElement=aLink;
		}
        for (i=0;i<eLinks.length;i++){
            aLink=eLinks[i];
            if (aLink.domain()===nodeA && aLink.range()===nodeB) linkElement=aLink;
            if (aLink.domain()===nodeB && aLink.range()===nodeA) linkElement=aLink;
        }
        // now we have identified the link element.


		// the link is inside linkeElement.domain();

		// now check if the link is still used

		var linkIsUsedInDom=false;
        var linkIsUsedInRan=false;

        var domPorts=linkElement.domain().getPortObjs();
        for (i=0;i<domPorts.length;i++){
        	if(domPorts[i].getConnectedToNode()===linkElement.range())
        		linkIsUsedInDom=true;
		}
        var ranPorts=linkElement.range().getPortObjs();
        for (i=0;i<ranPorts.length;i++){
            if(ranPorts[i].getConnectedToNode()===linkElement.domain())
                linkIsUsedInRan=true;
        }

        if (linkIsUsedInDom===false && linkIsUsedInRan===false){
        	// we can remove the force link;
			var domainObj=linkElement.domain();
			domainObj.removeLink(linkElement);
			updateForceNodes();
			redrawContent();
		}


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
            // console.log("Stop follow, and remove node" + followNodeElement);
            masterContainer.on("mousemove", function () {
            });
            if (testObj) {
                testObj.removeTempArrow();
                followNodeElement = false;
                testObj = null;
            }
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
