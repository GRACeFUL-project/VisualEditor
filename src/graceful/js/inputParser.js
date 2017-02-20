var nodeElement= require("./elements/nodeElement")();

module.exports = function (graph) {
    var parser={};
    var inputClasses=[];
    parser.parse=function(inputTxt){
        //1] read the txt as JSON;
        var jObj=JSON.parse(inputTxt);

        // parse some meta Info:
        var title=jObj.header.title;
        var comment=jObj.header._comment;

        graph.options().metaInfo().title().innerHTML="Title "+title;
        graph.options().metaInfo().comment().innerHTML="Comment "+comment;


        var inp=jObj.classes;
        for (var i=0;i<inp.length;i++){
            var element=inp[i];
            console.log(i+" name "+element.id);
            var node=new nodeElement(graph);
            node.id(element.id);
            node.imageURL(element.imgURL);
            node.elementType(element.type);
            node.label(element.className);
            inputClasses.push(node);
        }

        return inputClasses;
    };


    return parser;
};