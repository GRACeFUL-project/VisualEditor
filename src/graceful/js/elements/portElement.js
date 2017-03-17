var languageTools = require("../util/languageTools")();
var nodeDrawTools = require("../drawTools/nodeDrawTools")();
var DEF=require("./defines")();

module.exports = function () {
    var o = function (graph) {
        // some variables
        var that=this;

        // rendering flags and variables
        var radius=10,
            imageUrl,
            elementType,
            RENDER_AS_IMAGE=false,
            RENDER_TYPE=DEF.ROUND,
            HOVERING_ENABLED=false,
            hoverPrimitive=null,
            parentNodeElement,
            portDrag=false,
            tempArrowElement=null,
            svgRoot;

        // rendering elements
        var nodeElement;
        var rotationEnabled=false;
        var connections=[];
        var portIsInUse=false;

        // node behaviour
        var id,
            name,
            hoverText,
            portType,
            focused,
            mouseEntered,
            label;

        var connectedPorts=[];

        this.portUsed=function(val){
            if (!arguments.length) return portIsInUse;
            portIsInUse=val;
        };

        this.getConnections=function(){
            return connections;
        };
        this.rotationEnabled=function (arg){
            if (!arguments.length) return rotationEnabled;
            rotationEnabled=arg;
        };
        this.addFriendPort=function(port){
            connectedPorts.push(port);
        };

        this.connectedPorts=function(){
            return connectedPorts;
        };

        this.name=function(n){
			if (!arguments.length) return name;
			name=n;
        };
		this.portType=function(n){
			if (!arguments.length) return portType;
			portType=n;
		};

        this.hoverText=function(text){
			if (!arguments.length) return hoverText;
			hoverText=text;
        };

        this.updateRendering=function(){
            // only update me
            if (HOVERING_ENABLED===false)
                svgRoot.attr("transform", "translate(" + that.x + "," + that.y + ")");
            else{

                if (rotationEnabled===true) {
                    var angle=Math.atan2(that.y,that.x)* (180 / Math.PI);
                    var image=svgRoot.select("image");

                    image.attr("transform", "rotate("+angle+")");
                    svgRoot.attr("transform", "translate(" + that.x + "," + that.y + ")");
                }
                else
                    svgRoot.attr("transform", "translate(" + that.x + "," + that.y + ")");
            }
        };

        this.setParentNodeElement=function(parent){
            parentNodeElement=parent;
        };
		this.getParentNodeElement=function(){
			return parentNodeElement;
		};


		this.getParentPos=function(){
            if (parentNodeElement){
                return {x: parentNodeElement.x, y: parentNodeElement.y};
            }else return {x: 0, y: 0};

        };
        this.imageURL=function(url){
      //      console.log("Setting image to URL"+url);
            if (!arguments.length) return imageUrl;
            imageUrl=url;
            RENDER_AS_IMAGE=true;
        };
        this.elementType=function(t){
            if (!arguments.length) return elementType;
            elementType=t;
        };


        this.svgRoot=function(root){
            if (!arguments.length) return svgRoot;
            svgRoot = root;
            return this;
        };
        this.hoverElement=function(arg){
            if (!arguments.length) return hoverPrimitive;
            hoverPrimitive = arg;
            return this;
        };
        this.renderAsImage=function(){
            return RENDER_AS_IMAGE;
        };


        this.radius=function(r){
            if (!arguments.length) return radius;
            radius = r;
            return this;
        };

        this.allowHover=function(arg){
            if (!arguments.length) return HOVERING_ENABLED;
            HOVERING_ENABLED = arg;
            that.addConnectionsToNodeElement();
            return this;

        };



        this.addConnectionsToNodeElement=function(){
            if (HOVERING_ENABLED===false) return;

          //  console.log("svgRoot"+svgRoot);
         //   console.log("Hover Item"+hoverPrimitive);
            // DEF.CL("adding Connections"+ svgRoot);
            hoverPrimitive=svgRoot.append("circle")
                .classed("hoverPortImage", true)
                .attr("r", radius);
            hoverPrimitive.classed("hidden",true);
			svgRoot.append("title").text(that.hoverText());
            // DEF.CL("------------------------------------------------------");
            svgRoot.on("mouseover", function () {onImageHover() ;});
            svgRoot.on("mouseout" , function () {outImageHover();});
            svgRoot.on("click", onClicked);

            //dragover drop dragstart

            svgRoot.on("mousedown",function(){ dragStart() });
            svgRoot.on("mouseup", function(){ dragOver()  });
          //  svgRoot.on("mousemove",     function(){ draging()  });





        };

        this.removeTempArrow=function(){
         //   console.log("removing Temp Arrow Element");
            if (tempArrowElement)
                tempArrowElement.remove();
            tempArrowElement=undefined;

        };

        this.getPortDragingObj=function(){
            return tempArrowElement;
        };

        function dragStart(){

            d3.event.stopImmediatePropagation();
            d3.event.preventDefault();
            if (portIsInUse===true) return;
            portDrag=true;
            // DEF.CL("Prevented default? "+ d3.event.defaultPrevented);

            // create the arrow;
            var MARKER_FILL_COLOR="#000";
            var LINK_COLOR="#0f0";
            var LINK_SIZE="2";


            tempArrowElement= svgRoot.append("line")
                .attr("x1",  0)
                .attr("y1",  0)
                .attr("x2", 0)
                .attr("y2", 0)
                .attr('style', "stroke: " + LINK_COLOR + ";stroke-width: " + LINK_SIZE + ";");

                // create the marker
                var scale = 2.0,
                    vx = -12 * scale,
                    vy = -8 * scale,
                    lx = 24 * scale,
                    ly = 16 * scale,
                    wh = 12 * scale;

                var m1X = -12 * scale;
                var m1Y = 8 * scale;
                var m2X = -12 * scale;
                var m2Y = -8 * scale;
                var viewBoxString = "" + vx + " " + vy + " " + lx + " " + ly;
                var marker = svgRoot.append("marker")
                    .datum(that)
                    .attr("id", "TEMPLINK")
                    .attr("viewBox", viewBoxString) // temp
                    .attr("markerWidth", wh)
                    .attr("markerHeight", wh)
                    .attr("markerUnits", "userSpaceOnUse")
                    .attr("orient", "auto");
                var el = marker.append("path")
                    .attr("d", "M0,0L " + m1X + "," + m1Y + "L" + m2X + "," + m2Y + "z");
                el.attr('style', "fill:" + MARKER_FILL_COLOR + "; stroke: " + LINK_COLOR + ";stroke-width: " + LINK_SIZE + ";");
            tempArrowElement.attr("marker-end", "url(#TEMPLINK)");


            graph.followObject(that);
            // tempArrowElement= svgRoot.append("line")
            //     .attr("x1", 0)
            //     .attr("y1", 0 )
            //     .attr("x2", 50)
            //     .attr("y2", 50)
            //     .attr('style', "stroke: " + "#f00" + ";stroke-width: " + "2" + ";");



        }


        that.addConnection=function(otherId,otherLabel){
            connections.push(otherId);
            connections.push(otherLabel);
        };

        function dragOver(){
            portDrag =false;
            // DEF.CL("calling dragOverASD");

            var other=graph.getTestObject();

            if (other.getParentNodeElement()!==that.getParentNodeElement()
            && other.elementType()===that.elementType()){


                // check if a port connection exists;
                if (that.portUsed()===false && other.portUsed()===false) {

                    graph.createLinkBetweenNodes(that.getParentNodeElement(), other.getParentNodeElement());
                    graph.createLinkBetweenPorts(that, other);
                    connections.push(other.getParentNodeElement().id());
                    connections.push(other.label());
                    that.portUsed(true);
                    other.portUsed(true);
                }

            }
            graph.stopFollow();
        }

        this.setHoverHighlighting = function (enable) {
          //  console.log("Enable Hover"+ enable);
            nodeElement.classed("hovered", enable);
        };

        this.deepCopy=function(other){
          that.radius(other.radius());
          that.imageURL(other.imageURL());
          that.hoverText(other.hoverText());
          that.elementType(other.elementType());
          that.label(other.label());
          that.svgRoot(other.svgRoot());
          that.rotationEnabled(other.rotationEnabled());

          // todo more things;



        };


        function onClicked() {
          //  console.log("I was Clicked PORT: " + that.labelForCurrentLanguage());
            if (d3.event.defaultPrevented) {
                return;
            }
        }

        function onImageHover(){
           // DEF.CL("hoveredPort? "+that.mouseEntered());
            if (that.mouseEntered()) {
               return;
            }
          //  console.log("hoverred over PORT"+that.labelForCurrentLanguage());
            that.mouseEntered(true);

            if (graph.connectionMode()){
                // check if we allow the connection;
                var otherPort=graph.getTestObject();
                console.log("that="+that.labelForCurrentLanguage()+" "+otherPort.labelForCurrentLanguage());
				hoverPrimitive.style("fill","#f00");
                if  (otherPort.getParentNodeElement()===that.getParentNodeElement()){
					hoverPrimitive.style("fill","#f00");
                    hoverPrimitive.classed("hidden",false);
					return;
                }

				if  ((otherPort.elementType()===that.elementType())&& (otherPort.portUsed()===false && that.portUsed()===false))
					hoverPrimitive.style("fill","#0f0");

			} else
				hoverPrimitive.style("fill","#f00");

            hoverPrimitive.classed("hidden",false);
        }

        function outImageHover(){
            that.mouseEntered(false);
            hoverPrimitive.classed("hidden",true);
        }

        function onMouseOver() {
         //   DEF.CL("hoveredPort MOUSE OVEr? "+that.mouseEntered());
            if (that.mouseEntered()) {
                return;
            }
            that.setHoverHighlighting(true);
            that.mouseEntered(true);
        }

        function onMouseOut() {
            that.setHoverHighlighting(false);
            that.mouseEntered(false);
        }

        this.setHoverHighlighting = function (enable) {
         //   console.log("Enable Hover"+ enable);
            //nodeElement.classed("hovered", enable);
        };


// BASE CLASS DEFINITIONS



        this.focused = function (p) {
            if (!arguments.length) return focused;
            focused = p;
            return this;
        };
        that.toggleFocus=function(){
            that.focused(!that.focused());
            nodeElement.classed("focused", that.focused());
        };
        this.id = function (p) {
            if (!arguments.length) return id;
            id = p;
            return this;
        };

        this.mouseEntered = function (p) {
            if (!arguments.length) return mouseEntered;
            mouseEntered = p;
            return this;
        };
        this.label = function (p) {
            if (!arguments.length) return label;
            label = p;
            return this;
        };
        this.labelForCurrentLanguage = function () {
            var preferredLanguage = graph && graph.language ? graph.language() : null;
            return languageTools.textInLanguage(this.label(), preferredLanguage);
        };

        this.renderType=function(arg) {
            if (!arguments.length) return RENDER_TYPE;
            RENDER_TYPE = arg;
            return this;
        };





// ENDING STUFF
    };
    return o;
};
