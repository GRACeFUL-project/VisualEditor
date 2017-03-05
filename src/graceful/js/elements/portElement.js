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

        // node behaviour
        var id,
            name,
            hoverText,
            portType,
            focused,
            mouseEntered,
            label;

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
            svgRoot.attr("transform", "translate(" + that.x + "," + that.y + ")");
        };

        this.setParentNodeElement=function(parent){
            parentNodeElement=parent;
        };

        this.getParentPos=function(){
            if (parentNodeElement){
                return {x: parentNodeElement.x, y: parentNodeElement.y};
            }else return {x: 0, y: 0};

        };
        this.imageURL=function(url){
            console.log("Setting image to URL"+url);
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


            DEF.CL("adding Connections"+ svgRoot);
            hoverPrimitive=svgRoot.append("circle")
                .classed("hoverPortImage", true)
                .attr("r", radius);
            hoverPrimitive.classed("hidden",true);
            DEF.CL("------------------------------------------------------");
            svgRoot.on("mouseover", function () {onImageHover() ;});
            svgRoot.on("mouseout" , function () {outImageHover();});
            svgRoot.on("click", onClicked);

            //dragover drop dragstart

            svgRoot.on("mousedown",function(){ dragStart() });
          //  svgRoot.on("mouseup", function(){ dragOver()  });
          //  svgRoot.on("mousemove",     function(){ draging()  });





        };


        this.getPortDragingObj=function(){
            return tempArrowElement;
        };

        function dragStart(){
            d3.event.stopImmediatePropagation();
            d3.event.preventDefault();
            portDrag=true;
            DEF.CL("Prevented default? "+ d3.event.defaultPrevented);

            // create the arrow;


            tempArrowElement=svgRoot.append("circle")
                .attr("style","fill : #f0f;")
                            .attr("r", 20)
                            .attr("cx", 0)
                            .attr("cy", 0);

            graph.followObject(that);
            // tempArrowElement= svgRoot.append("line")
            //     .attr("x1", 0)
            //     .attr("y1", 0 )
            //     .attr("x2", 50)
            //     .attr("y2", 50)
            //     .attr('style', "stroke: " + "#f00" + ";stroke-width: " + "2" + ";");

            tempArrowElement.on("mouseup",     function(){ draging()  });


        }
        function dragOver(){
            portDrag =false;
            DEF.CL("calling dragOver");
            tempArrowElement.remove();

        }
        function draging(){
            if (portDrag===false)return;

            // talk with the graph to detect the actual position in the screen depending on graph;
            graph.followObject(tempArrowElement);



            // tempArrowElement.attr("cx",  )
            //     .attr("cy", d3.event.offsetY )



        }



        this.setHoverHighlighting = function (enable) {
          //  console.log("Enable Hover"+ enable);
            nodeElement.classed("hovered", enable);
        };

        this.deepCopy=function(other){
          that.radius(other.radius());
          that.imageURL(other.imageURL());

          that.label(other.label());
          that.svgRoot(other.svgRoot());

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
