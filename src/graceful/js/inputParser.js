

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


    parser.parseSolution=function (text){
        var jObj=JSON.parse(text);
        var len= jObj.length;
        console.log("Solution Length="+len);

        var solutions=[];
        for (var i=0;i<len;i++){
            var tempObj=jObj[i];
            var solutionOBJ={};
            for (var name in tempObj){
                solutionOBJ.nodeId=name;
                solutionOBJ.interfaceValues=[];
                var interfaceValues=tempObj[name];
                for (var j=0;j<interfaceValues.length;j++) {
                    var interFace=interfaceValues[j];
                    for (var interfaceName in interFace){
                        // console.log("InterfaceName "+interfaceName);
                        // console.log("Value "+interFace[interfaceName]);
                        // // create simple obj for this
                        var simpleObj={};
                        simpleObj.name=interfaceName;
                        simpleObj.value=interFace[interfaceName];
                        solutionOBJ.interfaceValues.push(simpleObj);
                    }
                }

            }
            solutions.push(solutionOBJ);
        }



        return solutions;
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

    parser.parseLib=function(text) {
        inputClasses=[];
        console.log("parsing input txt");
        //1] read the txt as JSON;
        var jObj=JSON.parse(text);
        console.log("Okay");
        header=jObj.header;

        if (header){
            // parse some meta Info:
            var title=header.title;
            var comment=header._comment;

            if (title && comment) {
                graph.options().metaInfo().title().innerHTML = "Title " + title;
                graph.options().metaInfo().comment().innerHTML = "Comment " + comment;
            }
        }else{
            graph.options().metaInfo().title().innerHTML = "Title : Not presented in file";
            graph.options().metaInfo().comment().innerHTML = "Comment : Not presented in file";
        }


        console.log("PARSING DATA");

        TBOX=jObj.library;
        // for number of objects in TBOX do parsing
        var nodeId=0;
        for (var iA=0;iA<TBOX.length;iA++){
            var libDisc=TBOX[iA];
            // get description of the library in terms of nodes and their interfaces
            // each object is here a node with its values;
            var nodeName    = libDisc.name;
            var imgURL      = libDisc.icon;
            var hoverText   = libDisc.comment;
            var params      = libDisc.parameters; // TODO: parse them and add them to the node object;

            var node=new nodeElement(graph);
            node.id(nodeId++);
            node.imageURL(imgURL);
            node.elementType("CLASS_NODE"); // setting the type of the node to be a class node
            node.label(nodeName);
            node.nameValue(nodeName);
            node.hoverText(hoverText);

            for (var pl=0;pl<params.length;pl++){
                var par=params[pl];
                node.addParameter(par);
            }
            inputClasses.push(node);

            var ports       = libDisc.interface;
            // create ports;
            for (var iC=0;iC<ports.length;iC++) {
                var portName = ports[iC].name;
                var portType = ports[iC].type;
                var portText = ports[iC].hoverText;
                var portImg  = ports[iC].imgURL;
                var portRot  = ports[iC].rotation;

                var portOBJ=new portElement(graph);
                portOBJ.id(0);
                portOBJ.hoverText(portText);
                portOBJ.imageURL(portImg);
                portOBJ.name(portName);
                portOBJ.rotationEnabled(portRot);
                portOBJ.elementType(portType);
                portOBJ.label(portName);
                // assign this port to the node;
                node.addPortObject(portOBJ);
            }
            // console.log( nodeId+" : "+ nodeName +" "+ imgURL+ " "+ hoverText);
        }
        return inputClasses;
   };

    parser.parse=function(inputTxt){
        inputClasses=[];
        console.log("parsing input txt");
        //1] read the txt as JSON;
        var jObj=JSON.parse(inputTxt);
        console.log("Okay");
        header=jObj.header;

        if (header){
        // parse some meta Info:
            var title=header.title;
            var comment=header._comment;

            if (title && comment) {
                graph.options().metaInfo().title().innerHTML = "Title " + title;
                graph.options().metaInfo().comment().innerHTML = "Comment " + comment;
            }
        }else{
            graph.options().metaInfo().title().innerHTML = "Title : Not presented in file";
            graph.options().metaInfo().comment().innerHTML = "Comment : Not presented in file";
        }


        console.log("PARSING DATA");

        TBOX=jObj.library;
        // for number of objects in TBOX do parsing
        var nodeId=0;
        for (var iA=0;iA<TBOX.length;iA++){
            var libDisc=TBOX[iA];
            // get description of the library in terms of nodes and their interfaces
            // each object is here a node with its values;
                var nodeName    = libDisc.name;
                var imgURL      = libDisc.imgURL;
                var hoverText   = libDisc.hoverText;
                var params      = libDisc.parameters; // TODO: parse them and add them to the node object;

                var node=new nodeElement(graph);
                node.id(nodeId++);
                node.imageURL(imgURL);
                node.elementType("CLASS_NODE"); // setting the type of the node to be a class node
                node.label(nodeName);
                node.nameValue(nodeName);
                node.hoverText(hoverText);

                for (var pl=0;pl<params.length;pl++){
                    var par=params[pl];
                    node.addParameter(par);
                }
                inputClasses.push(node);

                var ports       = libDisc.interface;
                // create ports;
                for (var iC=0;iC<ports.length;iC++) {
                    var portName = ports[iC].name;
                    var portType = ports[iC].type;
                    var portText = ports[iC].hoverText;
                    var portImg  = ports[iC].imgURL;
                    var portRot  = ports[iC].rotation;

                    var portOBJ=new portElement(graph);
                    portOBJ.id(0);
                    portOBJ.hoverText(portText);
                    portOBJ.imageURL(portImg);
                    portOBJ.name(portName);
                    portOBJ.rotationEnabled(portRot);
                    portOBJ.elementType(portType);
                    portOBJ.label(portName);
                    // assign this port to the node;
                    node.addPortObject(portOBJ);
                }
                // console.log( nodeId+" : "+ nodeName +" "+ imgURL+ " "+ hoverText);
            }
        return inputClasses;
    };

    return parser;
};