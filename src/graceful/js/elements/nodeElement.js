var languageTools = require("../util/languageTools")();
var nodeDrawTools = require("../drawTools/nodeDrawTools")();



module.exports = function () {
    var o = function (graph) {
        // some variables
        var that=this;

        // rendering flags and variables
        var radius=50,

            svgRoot;




        // rendering elements
        var nodeElement,
            textElement;



        // node behaviour
        var id,
            focused,
            mouseEntered,
            label;
        // force node behaviour
        var locked=false,
            frozen=false,
            pinned=false,
            charge=-500;



// rendering functions
        this.updateRendering=function(){
            // only update me
            svgRoot.attr("transform", "translate(" + that.x + "," + that.y + ")");
        };
        this.svgRoot=function(root){
            if (!arguments.length) return svgRoot;
            svgRoot = root;
            return this;
        };

        this.drawNodeElement=function(svgRoot){
            applyFixedLocationAttributes();
            // craete draw function class;

            that.svgRoot(svgRoot);
            nodeElement=nodeDrawTools.drawNodeElement(that);
            textElement=nodeDrawTools.addTextElement(that);

            // add connections to this object
            that.addConnectionsToNodeElement(nodeElement);

        };

        this.radius=function(r){
            if (!arguments.length) return radius;
            radius = r;
            return this;
        };

        this.addConnectionsToNodeElement=function(el){

            el.on("mouseover", onMouseOver)
              .on("mouseout", onMouseOut)
              .on("click", onClicked);

        };


        function onClicked() {
            // console.log("I was Clicked: " + that.labelForCurrentLanguage());
            if (d3.event.defaultPrevented) {
                return;
            }
            that.toggleFocus();
        }

        function onMouseOver() {
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
            // console.log("Enable Hover"+ enable);
            nodeElement.classed("hovered", enable);
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

// FORCE LAYOUT STUFF
        this.charge=function (val){
            if (!arguments.length) return charge;
            charge = val;
        };
        this.locked = function (p) {
            if (!arguments.length) return locked;
            locked = p;
            applyFixedLocationAttributes();
        };

        this.frozen = function (p) {
            if (!arguments.length) return frozen;
            frozen = p;
            applyFixedLocationAttributes();
        };

        this.pinned = function (p) {
            if (!arguments.length) return pinned;
            pinned = p;
            applyFixedLocationAttributes();
        };

        function applyFixedLocationAttributes() {
            if (  that.locked() || that.frozen() || that.pinned()  )
                that.fixed = true;
            else that.fixed = false;
        }



// ENDING STUFF
    };
    return o;
};
