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
            zoomFactor=1.0,
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
            nameValue,
            label;
        // force node behaviour
        var locked=false,
            frozen=false,
            pinned=false,
            charge=-1500;
        // parameters
        var parametersAsString;
        var parameters=[];


        this.nameValue=function(val){
            if (arguments.length===0) {
                return nameValue;
            }
            else nameValue=val;
        };

        this.getParamaters=function(){
         //   console.log("RETRUNRING PARAMATERS"+parameters.length);

            return parameters;
        };
        this.addParameter=function(par){

            var copyOfParameter={};
            copyOfParameter.name=par.name;
            copyOfParameter.type=par.type;

            if (par.value===undefined) {
            //    console.log("UNDEFINED VALUE");
                copyOfParameter.value = 0;
            }
            else
                copyOfParameter.value=par.value;

       //     console.log("adding paramater                              -> "+copyOfParameter.name +" type "+copyOfParameter.type+" value "+copyOfParameter.value);
            parameters.push(copyOfParameter);
        };

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

        this.removeLink=function(linkElement){

            var newLinks=[];
            for (var i =0;i<forceLinks.length;i++){
                if (forceLinks[i]===linkElement)
                    continue;
                newLinks.push(forceLinks[i]);
            }
            forceLinks=newLinks;
        };
        this.clearConnections=function(){
            console.log("call clear connections");


            // check the ports of this node
            for (var i=0;i<portObjects.length;i++){
                var port=portObjects[i];
                var friendPort=port.connectedPorts();
                console.log("Has Connections"+friendPort);
                if (friendPort.length>0){
                    var fPort=friendPort[0];
                    console.log("Port="+portObjects[i]);
                    console.log("FPort="+fPort);
                    console.log("removeing connection of "+port.labelForCurrentLanguage()+" and "+fPort.labelForCurrentLanguage());
                    graph.removeLinksBetweenPorts(port,fPort);
                }
            }


            // get my links
            for (i =0;i<forceLinks.length;i++){
                if (forceLinks[i].range()===that){
                    console.log("remove the link in the domain!");
                    forceLinks[i].domain().removeLink(forceLinks[i]);
                }
            }








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

        this.addInstancePort=function(port){
           // console.log("Adding PortElement"+port.label());
            port.setParentNodeElement(that);
            port.svgRoot(portsRoot);
            //port.allowHover(true);

            portObjects.push(port);
        };

        this.addPortObject=function (portObj){
          // need to copy the port object
          //  console.log("Make a copy of this port "+portObj.label());
            var cp_obj=new portElement(graph);
            cp_obj.deepCopy(portObj);
            portObjects.push(cp_obj);
          //  console.log("Adding Port"+cp_obj.labelForCurrentLanguage()+" to node "+that.labelForCurrentLanguage());

            // set the svgRoot and the new id for the port

            var portId=cp_obj.id();
            cp_obj.id(that.id()+"_"+portId);
            cp_obj.svgRoot(portsRoot);
        };

// rendering functions

        this.zoomFactor=function(val){
            zoomFactor=val;
        };

        this.updateScaleFactor=function(){
            // console.log("transform", "translate(" + that.x + "," + that.y + ")scale("+zoomFactor+")");
            svgRoot.attr("transform", "translate(" + that.x + "," + that.y + ")scale("+zoomFactor+")");
        };

        this.updateRendering=function(){
            // only update me
            svgRoot.attr("transform", "translate(" + that.x + "," + that.y + ")");
            // for each port object compute optiomal location;
            var high=[];
            var low=[];
            var occupied_Pos=[];
            var i;
            var aPort;
            for (i =0;i<portObjects.length;i++) {
                if (portObjects[i].portUsed()){
                    high.push(portObjects[i]);
                }else {
                    low.push(portObjects[i]);
                }
            }

            for (var i=0;i<high.length;i++){
                aPort=high[i];
                var friends=aPort.connectedPorts();
                if (friends.length>0) {
                    var dirx = 0;
                    var diry = 0;
                    for (var j = 0; j < friends.length; j++) {
                        dirx = dirx + (friends[j].getParentNodeElement().x - this.x);
                        diry = diry + (friends[j].getParentNodeElement().y - this.y);
                    }
                }
                //var dirx = (aPort.getConnectedToNode().x - this.x);
                //var diry = (aPort.getConnectedToNode().x - this.y);
                // normalize vector;
                var length = Math.sqrt(dirx * dirx + diry * diry);
                var nX = dirx / length;
                var nY = diry / length;
                var angle=Math.atan2(-nY,nX)* (180 / Math.PI);
                if (angle<0)
                    angle=angle+360;

                // check if position already set
                var wPos=0;
                if (angle>360-22.5 && angle<22.5 ) wPos=0;
                if (angle>22.5 && angle<22.5+45 ) wPos=1;
                if (angle>22.5+45 && angle<22.5+2*45 ) wPos=2;
                if (angle>22.5+2*45 && angle<22.5+3*45 ) wPos=3;
                if (angle>22.5+3*45 && angle<22.5+4*45 ) wPos=4;
                if (angle>22.5+4*45 && angle<22.5+5*45 ) wPos=5;
                if (angle>22.5+5*45 && angle<22.5+6*45 ) wPos=6;
                if (angle>22.5+6*45 && angle<22.5+7*45 ) wPos=7;

                if (occupied_Pos.indexOf(wPos)===-1) {
                    aPort.x=that.radius()*nX;
                    aPort.y=that.radius()*nY;
                    aPort.updateRendering();
                    occupied_Pos.push(wPos);
                }else{
                    var nearPos=(wPos+1)%8;
                    var nearNeg=(wPos+7)%8;
                    var nV;


                    if (occupied_Pos.indexOf(nearPos)===-1 && occupied_Pos.indexOf(nearNeg)!==-1){
                        nV=angleToNormedVec(45*nearPos);
                        aPort.x=that.radius()*nV.x;
                        aPort.y=that.radius()*nV.y;
                        occupied_Pos.push(nearPos);

                    }
                    if (occupied_Pos.indexOf(nearPos)!==-1 && occupied_Pos.indexOf(nearNeg)===-1){
                        nV=angleToNormedVec(45*nearNeg);
                        aPort.x=that.radius()*nV.x;
                        aPort.y=that.radius()*nV.y;
                        occupied_Pos.push(nearNeg);
                    }
                    if (occupied_Pos.indexOf(nearPos)===-1 && occupied_Pos.indexOf(nearNeg)===-1){
                        nV=angleToNormedVec(45*nearPos);
                        aPort.x=that.radius()*nV.x;
                        aPort.y=that.radius()*nV.y;
                        occupied_Pos.push(nearPos);
                    }
                    aPort.updateRendering();
                }
            }
            for (i=0;i<low.length;i++){
                var aPort=low[i];
                var posSet=false;
                for (var p=0;p<8;p++){
                    if (posSet===true){ continue;}
                    if (occupied_Pos.indexOf(p)!==-1) {continue;}
                    var nV=angleToNormedVec(45*p);
                    aPort.x=that.radius()*nV.x;
                    aPort.y=that.radius()*nV.y;
                    occupied_Pos.push(p);
                    posSet=true;
                }
                aPort.updateRendering();
            }
        };

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
                .attr("r", radius-1);
            hoverPrimitive.classed("hidden",true);

            that.drawPortElements();

        };


        this.drawPortElements=function(){
            for (var i=0;i<portObjects.length;i++){
                var nV=angleToNormedVec(45*i);
                portObjects[i].x=that.radius()*nV.x;
                portObjects[i].y=that.radius()*nV.y;
                nodeDrawTools.drawPortElement(that,portObjects[i]);
               if (that.elementType()==="INSTANCE"){
                   portObjects[i].allowHover(true);
               }else
                    portObjects[i].addConnectionsToNodeElement();
                portObjects[i].updateRendering();
            }

        };

        this.radius=function(r){
            if (!arguments.length) return radius;
            radius = r;
            return this;
        };

        function angleToNormedVec(angle){
            // angle given in degree , need rad for cos and sin
            var xn=Math.cos(angle*Math.PI/180);
            var yn=Math.sin(angle*Math.PI/180);
            return {x: xn, y: -yn}
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
            if (d3.event.defaultPrevented) {
                return;
            }

            if (elementType==="CLASS_NODE"){
                // create new node from this class
                graph.createNewInstanceNode(that);
                hoverPrimitive.classed("hidden",false);
            }else {
                that.toggleFocus();
                graph.updateEditInfo(that);
            }
        }

        function onImageHover(){
            if (that.mouseEntered()) {
                return;
            }
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
            this.label(other.label());
            this.nameValue(other.nameValue());
            var otherParams=other.getParamaters();
            for (var j=0;j<otherParams.length;j++){
                this.addParameter(otherParams[j]);
            }
        };
// BASE CLASS DEFINITIONS

        this.setFocusedHighlight=function(){
            nodeElement.classed("focused", that.focused());
        };

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
