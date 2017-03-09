var languageTools = require("../util/languageTools")();
var nodeDrawTools = require("../drawTools/nodeDrawTools")();
var portElement= require("./portElement")();

var DEF=require("./defines")();


module.exports = function () {
    var o = function (graph) {
        // some variables
        var that=this;

        // rendering flags and variables
        var radius=40,
            imageUrl,
            elementType,
            RENDER_AS_IMAGE=false,
            hoverPrimitive=null,
            nodeRoot,
            portsRoot,
            svgRoot;



        var portObjects=[];
        var forceLinks=[];

        // rendering elements
        var nodeElement,
            textElement;



        // node behaviour
        var id,
            focused,
            mouseEntered,
            hoverText,
            label;
        // force node behaviour
        var locked=false,
            frozen=false,
            pinned=false,
            charge=-1500;
        // parameters
        var parametersAsString;


        this.getLinkElements=function(){
            return forceLinks;
        };
        this.getLinks=function(){

            var fl=[];
            for (var i=0;i<forceLinks.length;i++)
                fl=fl.concat(forceLinks[i].getLinkForceLinks());

            return fl;
        };
        this.addLink=function(link){
            forceLinks.push(link);
        };


        this.parametersAsString=function(text){
			if (!arguments.length) return parametersAsString;
			parametersAsString=text;
			// todo : parse the parameters and add a value for each parameter
            // so the user can change it.
        };
        this.hoverText=function(text){
			if (!arguments.length) return hoverText;
            hoverText=text;
        };

        this.imageURL=function(url){
            if (!arguments.length) return imageUrl;
            imageUrl=url;
            RENDER_AS_IMAGE=true;
        };
        this.elementType=function(t){
            if (!arguments.length) return elementType;
            elementType=t;
        };


        this.addPortObject=function (portObj){
          // need to copy the port object
            console.log("Make a copy of this port "+portObj.label());
            var cp_obj=new portElement(graph);
            cp_obj.deepCopy(portObj);
            portObjects.push(cp_obj);
            console.log("Adding Port"+cp_obj.labelForCurrentLanguage()+" to node "+that.labelForCurrentLanguage());

            // set the svgRoot and the new id for the port

            var portId=cp_obj.id();
            cp_obj.id(that.id()+"_"+portId);
            cp_obj.svgRoot(portsRoot);
        };

// rendering functions
        this.updateRendering=function(){
            // only update me
            svgRoot.attr("transform", "translate(" + that.x + "," + that.y + ")");
            // for each port object compute optiomal location;

            for (var i =0;i<portObjects.length;i++){
                var aPort=portObjects[i];
                var friends=aPort.connectedPorts();
                if (friends.length>0) {
                    var dirx = 0;
                    var diry = 0;
                    for (var j = 0; j < friends.length; j++) {
                        dirx = dirx + (friends[j].getParentNodeElement().x - this.x);
                        diry = diry + (friends[j].getParentNodeElement().y - this.y);
                    }
                    // normalize vector;
                    var length = Math.sqrt(dirx * dirx + diry * diry);
                    var nX = dirx / length;
                    var nY = diry / length;
                   // console.log(aPort.x + " " + aPort.y + "->" + that.radius() * nX + " " + that.radius() * nY);
                    aPort.x=that.radius()*nX;
                    aPort.y=that.radius()*nY;
                    aPort.updateRendering();
                }
            }
            // check for conflicts!
            if (portObjects.length>1){
                // only if we have more than one portobject we can check for conflicks
                var conflicts=false;
                for(i=1;i<portObjects.length;i++){
                    if (checkPortDistance(portObjects[0],portObjects[i])) {
                        conflicts = true;
                        break;
                    }
                }
                if (conflicts===true){

                    // optimize the layout!
                    //portObjects[0] stays fixed;
                    


                }
            }

        };

        function checkPortDistance(elementA,elementB){
            var conflict=false;

            var aX=elementA.x;
            var aY=elementA.y;
            var bX=elementB.x;
            var bY=elementB.y;


            var distx=aX-bX;
            var disty=aY-bY;
            var length=Math.sqrt(distx*distx+disty*disty);

            if (length<elementA.radius())
                conflict=true;

            return conflict;
        }

        this.svgRoot=function(root){
            if (!arguments.length) return svgRoot;
            svgRoot = root;
            return this;
        };

        this.svgNodeRoot=function(root){
            if (!arguments.length) return nodeRoot;
            nodeRoot= root;
            return this;
        };

        this.svgPortsRoot=function(root){
            if (!arguments.length) return portsRoot;
            portsRoot = root;
            return this;
        };


        this.renderAsImage=function(){
            return RENDER_AS_IMAGE;
        };


        this.updatePortsSvgRoot=function(){
            for (var i=0;i<portObjects.length;i++) {
                var tempRoot=portsRoot.append('g');
                portObjects[i].svgRoot(tempRoot);
            }
        };

        this.drawNodeElement=function(svgRoot){
            applyFixedLocationAttributes();
            // craete draw function class;

            that.svgRoot(svgRoot);
            nodeRoot=svgRoot.append("g");
            portsRoot=svgRoot.append("g");

            that.updatePortsSvgRoot();


            nodeElement=nodeDrawTools.drawNodeElement(that);
            if (that.elementType()==="INSTANCE")
                textElement=nodeDrawTools.addTextElement(that);
            // add connections to this object
            that.addConnectionsToNodeElement(nodeElement);
            hoverPrimitive=nodeRoot.append("circle")
                .classed("hoverImage", true)
                .attr("r", radius);
            hoverPrimitive.classed("hidden",true);

            that.drawPortElements();

        };


        this.drawPortElements=function(){
          //  DEF.CL("want to draw ports info "+portObjects.length);

            var portPositions=getPrecomputedPortPositions();

            for (var i=0;i<portObjects.length;i++){

                portObjects[i].x=that.radius()*portPositions[i].x;
                portObjects[i].y=that.radius()*portPositions[i].y;
           //    DEF.CL("Port "+i+ "POS:"+xOffset+" "+yOffset );
                nodeDrawTools.drawPortElement(that,portObjects[i]);
                portObjects[i].addConnectionsToNodeElement();
                portObjects[i].updateRendering();

            }

        };

        this.radius=function(r){
            if (!arguments.length) return radius;
            radius = r;
            return this;
        };


        function getPrecomputedPortPositions(){
            var angularValues=[];
            if (portObjects.length===1){
                angularValues.push(0);
            }
            if (portObjects.length===2){
                angularValues.push(45);
                angularValues.push(-45);
            }
            if (portObjects.length===3){
                angularValues.push(45);
                angularValues.push(0);
                angularValues.push(-45);
            }
            var vectors=[];
            for (var i=0;i<angularValues.length;i++){
                vectors.push(angleToNormedVec(angularValues[i]));
            }
            return vectors;
        }


        function angleToNormedVec(angle){
            // angle in degree;
            var xn=Math.cos(angle);
            var yn=Math.sin(angle);
            return {x: xn, y: yn}


        }

        this.addConnectionsToNodeElement=function(el){


            if(RENDER_AS_IMAGE===true){
                nodeRoot.on("mouseover", function () {onImageHover() ;});
                nodeRoot.on("mouseout" , function () {outImageHover();});
                nodeRoot.append("title").text(that.hoverText());
                nodeRoot.on("click", onClicked);
            }else {
                el.on("mouseover", onMouseOver)
                    .on("mouseout", onMouseOut)
                    .on("click", onClicked);
            }

        };


        function onClicked() {
          //  console.log("I was Clicked: " + that.labelForCurrentLanguage());
            if (d3.event.defaultPrevented) {
                return;
            }

            if (elementType==="CLASS_NODE"){
                // create new node from this class
                graph.createNewInstanceNode(that);
                hoverPrimitive.classed("hidden",false);
            }else {
                that.toggleFocus();
            }
        }

        function onImageHover(){
            if (that.mouseEntered()) {
                //	titleElement.classed("hidden",false);
                return;
            }
         //   console.log("hoverred over image"+that.labelForCurrentLanguage());
            that.mouseEntered(true);
            hoverPrimitive.classed("hidden",false);

        }

        function outImageHover(){
            that.mouseEntered(false);
            hoverPrimitive.classed("hidden",true);
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
        //    console.log("Enable Hover"+ enable);
            nodeElement.classed("hovered", enable);
        };


// COPY CONSTRUCTORS

        this.getPortObjs=function(){
            return portObjects;
        };

        this.copyPorts=function(ports){
          portObjects=[];
          // DEF.CL("copying ports");
          for (var i=0;i<ports.length;i++){
              var portThing=new portElement(graph);

              portThing.deepCopy(ports[i]);
              var thingId=portThing.id();
              portThing.id(thingId+"_"+that.id());
              portObjects.push(portThing);
              portThing.allowHover(true);
              portThing.setParentNodeElement(that);
          }
        };


        this.deepCopy=function(other){
            this.imageURL(other.imageURL());
            this.radius(other.radius());
            this.copyPorts(other.getPortObjs());
            this.hoverText(other.hoverText());
            this.label(other.label()+" "+this.id());


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
