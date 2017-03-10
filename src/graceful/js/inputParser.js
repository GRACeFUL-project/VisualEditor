

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
    var TBOX;
    var header;

    parser.getHeader=function(){
        return header;
    };

    parser.getTBOX=function(){
        return TBOX;
    };

    parser.parseABOX=function(inputTxt){

        console.log("PARSING ABOX");
        var highestID=0;
        var instanceNodes=[];
        var portConnections=[];
        var jObj=JSON.parse(inputTxt);
        if (jObj.ABOX){
            var nodes=jObj.ABOX.nodes;
            for (var iA=0;iA<nodes.length;iA++){
                var tempNode=nodes[iA];
                var instanceNode=new nodeElement(graph);
                var nodeId      = tempNode.identity;

                // check for highest instace id;
                var intNid=parseInt(nodeId);
                if (highestID<intNid)
                    highestID=intNid;

                var nodeName    = tempNode.name;
                var imgURL      = tempNode.imgURL;
                var hoverText   = tempNode.hoverText;
                var params      = tempNode.parameters; // TODO: parse them and add them to the node object;
                for (var pl=0;pl<params.length;pl++){
                    var par=params[pl];
                    instanceNode.addParameter(par);
                }

                instanceNode.imageURL(imgURL);
                instanceNode.elementType("INSTANCE"); // setting the type of the node to be a class node
                instanceNode.label(nodeName);
                instanceNode.hoverText(hoverText);
                instanceNode.id(nodeId);

                var ports       = tempNode.interface;
                // create ports;
                for (var iC=0;iC<ports.length;iC++) {
                    var portOBJ=new portElement(graph);
                    var portName = ports[iC].name;
                    var portType = ports[iC].type;
                    var portText = ports[iC].hoverText;
                    var portImg  = ports[iC].imgURL;
                    var portRot  = ports[iC].rotation;

                    portOBJ.id(0);
                    // portOBJ.name(portName);
                    // portOBJ.portType(portType);
                    portOBJ.hoverText(portText);
                    portOBJ.imageURL(portImg);

                    portOBJ.rotationEnabled(portRot);
                    console.log("Allow Port "+portName+" to rotate                      ->"+portOBJ.rotationEnabled());
                    portOBJ.elementType(portType);
                    portOBJ.label(portName);



                    var portCon  = ports[iC].connection;
                    if (portCon.length>0) {
                        // add a connection
                        for (var iP = 0; iP < portCon.length; iP = iP + 2) {
                            var connectionDescription = {};
                            connectionDescription.node = instanceNode;
                            connectionDescription.port = portOBJ;
                            connectionDescription.friendId = portCon[iP];
                            connectionDescription.portName = portCon[iP + 1];
                            portConnections.push(connectionDescription);
                        }
                    }

                        // assign this port to the node;
                    instanceNode.addInstancePort(portOBJ);
                }

                instanceNodes.push(instanceNode);
            }
        }
        return {
            nodes:instanceNodes,
            highestId:highestID,
            connections:portConnections
        }

    };

    parser.parse=function(inputTxt){
        //1] read the txt as JSON;
        var jObj=JSON.parse(inputTxt);

        // parse some meta Info:
        var title=jObj.header.title;
        var comment=jObj.header._comment;

        graph.options().metaInfo().title().innerHTML="Title "+title;
        graph.options().metaInfo().comment().innerHTML="Comment "+comment;


        // get tBox
        header=jObj.header;
        TBOX=jObj.TBOX;
        // for number of objects in TBOX do parsing
        var nodeId=0;
        var portId=0;
        for (var iA=0;iA<TBOX.length;iA++){
            var libInst=TBOX[iA];
            var libraryName=libInst.name;
            console.log("Found Library in TBOX, Id = "+iA+" ,Name = "+libraryName);

            // get description of the library in terms of nodes and their interfaces
            var libDisc=libInst.library;

            // each object is here a node with its values;
            for (var iB=0;iB<libDisc.length;iB++){
                var nodeName    = libDisc[iB].name;
                var imgURL      = libDisc[iB].imgURL;
                var hoverText   = libDisc[iB].hoverText;
                var params      = libDisc[iB].parameters; // TODO: parse them and add them to the node object;

                var node=new nodeElement(graph);
                node.id(nodeId++);
                node.imageURL(imgURL);
                node.elementType("CLASS_NODE"); // setting the type of the node to be a class node
                node.label(nodeName);
                node.hoverText(hoverText);

                for (var pl=0;pl<params.length;pl++){
                    var par=params[pl];
                    node.addParameter(par);
                }
                inputClasses.push(node);

                var ports       = libDisc[iB].interface;
                console.log("ports: "+ports);

                // create ports;
                for (var iC=0;iC<ports.length;iC++) {
                    var portName = ports[iC].name;
                    var portType = ports[iC].type;
                    var portText = ports[iC].hoverText;
                    var portImg = ports[iC].imgURL;
                    var portRot = ports[iC].rotation;

                    var portOBJ=new portElement(graph);
                    portOBJ.id(0);
                    // portOBJ.name(portName);
                    // portOBJ.portType(portType);
                    portOBJ.hoverText(portText);
                    portOBJ.imageURL(portImg);
                    portOBJ.rotationEnabled(portRot);
                    portOBJ.elementType(portType);
                    portOBJ.label(portName);
                    // assign this port to the node;
                    node.addPortObject(portOBJ);
                }



                console.log( nodeId+" : "+ nodeName +" "+ imgURL+ " "+ hoverText);

            }


        }
        //
        // var inp=jObj.nodes;
        // for (var i=0;i<inp.length;i++){
        //     var element=inp[i];
        //     console.log(i+" name "+element.id);
        //     var node=new nodeElement(graph);
        //     node.id(element.id);
        //     node.imageURL(element.imgURL);
        //     node.elementType("CLASS_NODE"); // setting the type of the node to be a class node
        //     node.label(element.name);
        //     node.hoverText(element.hoverText);
			// node.parametersAsString(element.parameters);
        //     inputClasses.push(node);
        // }
        //
        // console.log("Creating interfaces");
        // // parse the different ports;
        // var ports=jObj.interfaces;
        //
        // for (i=0;i<ports.length;i++){
        //     element=ports[i];
        //     var port=new portElement(graph);
        //     port.id(element.id);
        //     port.name(element.name);
			// port.portType(element.type);
			// port.hoverText(element.hoverText);
        //     port.imageURL(element.imgURL);
        //     port.rotationEnabled(element.rotation);
        //     port.elementType(element.type);
        //     port.label(element.name);
        //     inputPorts.push(port);
        // }
        // // port assignment to classes;
        // // TODO: craete maping for ids to objects
        //
        // console.log("Trying assignment");
        // var assignment=jObj.interfaceAssignment;
        // for (i=0;i<assignment.length;i++) {
        //     element = assignment[i];
        //     var classId = element.NodeId;
        //     var portIds = element.ports;
        //
        //     console.log("processing "+classId);
        //     console.log("With PortIds "+portIds);
        //     // get the specific node element
        //     var nodeThing;
        //
        //     for (var n=0;n<inputClasses.length;n++){
        //         if (inputClasses[i].id()===classId) {
        //             nodeThing = inputClasses[i];
        //             console.log("found nodeElement Id"+ i);
        //         }
        //     }
        //
        //     // get port object
        //     for (var j=0;j<portIds.length;j++){
        //         var portElementId=portIds[j];
        //         var portThing;
        //         for (var p=0;p<inputPorts.length;p++){
        //             if (inputPorts[p].id()===portElementId) {
        //                 portThing = inputPorts[p];
        //                 console.log("found a port thing "+ p);
        //             }
        //         }
        //         console.log("Elements : "+portThing + " Nodes "+nodeThing);
        //         if (portThing && nodeThing) {
        //             console.log("adding port obj");
        //             nodeThing.addPortObject(portThing);
        //         }
        //     }
        // }



        return inputClasses;
    };


    return parser;
};