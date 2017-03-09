

/* NODES


 {  "id"         : "nodeId0",
 "name"       : "pump",
 "imagURL"    : "./data/img/pump.png",
 "hoverText"  : "this is a pump",
 "parameters" : [ {"name" : "capacity","type" : "Float",} ]
 },

 "interfaces" :[
 {  "id"         : "interfaceId0",
 "name"       : "inflow",
 "type"       : "Flow",
 "hoverText"  : "Description",
 "imagURL"    : "./data/interfaces/inflow.png",
 "ConRestrict": []
 },
* */

module.exports = function (graph) {
    var parser={};
    var inputClasses=[];
    var inputPorts=[];
    var nodeElement= require("./elements/nodeElement")();
    var portElement= require("./elements/portElement")();

    parser.parse=function(inputTxt){
        //1] read the txt as JSON;
        var jObj=JSON.parse(inputTxt);

        // parse some meta Info:
        var title=jObj.header.title;
        var comment=jObj.header._comment;

        graph.options().metaInfo().title().innerHTML="Title "+title;
        graph.options().metaInfo().comment().innerHTML="Comment "+comment;


        var inp=jObj.nodes;
        for (var i=0;i<inp.length;i++){
            var element=inp[i];
            console.log(i+" name "+element.id);
            var node=new nodeElement(graph);
            node.id(element.id);
            node.imageURL(element.imgURL);
            node.elementType("CLASS_NODE"); // setting the type of the node to be a class node
            node.label(element.name);
            node.hoverText(element.hoverText);
			node.parametersAsString(element.parameters);
            inputClasses.push(node);
        }

        console.log("Creating interfaces");
        // parse the different ports;
        var ports=jObj.interfaces;

        for (i=0;i<ports.length;i++){
            element=ports[i];
            var port=new portElement(graph);
            port.id(element.id);
            port.name(element.name);
			port.portType(element.type);
			port.hoverText(element.hoverText);
            port.imageURL(element.imgURL);
            port.rotationEnabled(element.rotation);
            port.elementType(element.type);
            port.label(element.name);
            inputPorts.push(port);
        }
        // port assignment to classes;
        // TODO: craete maping for ids to objects

        console.log("Trying assignment");
        var assignment=jObj.interfaceAssignment;
        for (i=0;i<assignment.length;i++) {
            element = assignment[i];
            var classId = element.NodeId;
            var portIds = element.ports;

            console.log("processing "+classId);
            console.log("With PortIds "+portIds);
            // get the specific node element
            var nodeThing;

            for (var n=0;n<inputClasses.length;n++){
                if (inputClasses[i].id()===classId) {
                    nodeThing = inputClasses[i];
                    console.log("found nodeElement Id"+ i);
                }
            }

            // get port object
            for (var j=0;j<portIds.length;j++){
                var portElementId=portIds[j];
                var portThing;
                for (var p=0;p<inputPorts.length;p++){
                    if (inputPorts[p].id()===portElementId) {
                        portThing = inputPorts[p];
                        console.log("found a port thing "+ p);
                    }
                }
                console.log("Elements : "+portThing + " Nodes "+nodeThing);
                if (portThing && nodeThing) {
                    console.log("adding port obj");
                    nodeThing.addPortObject(portThing);
                }
            }
        }



        return inputClasses;
    };


    return parser;
};