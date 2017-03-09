
var DEF=require("../elements/defines")();

function CL(text) {
    console.log(text);
}

module.exports = (function () {
    var tools = {};

    tools.drawNodeElement=function(node){
        var root=node.svgNodeRoot();
        var nodeEl=root.append("circle")
            .classed("class", true)
            .attr("r", node.radius());

        if (node.renderAsImage()===true){
           var imagePrimitive=root.append("image")
                .attr('x',-node.radius())
                .attr('y',-node.radius())
                .attr('width', 2*node.radius())
                .attr('height', 2*node.radius())
                .attr("xlink:href",node.imageURL());
        }

        return nodeEl;
    };

    tools.addTextElement=function (node) {
        var textElement = node.svgRoot().append("text")
            .classed("text", true)
            .attr("x", 0-0.5*node.radius())
            .attr("y", -5-node.radius())
            .attr("style", "fill:white;")
            .attr("text-anchor", "middle")
            .text(node.labelForCurrentLanguage());
        return textElement;

    };

    tools.drawPortElement=function (parentNode,portObj){
        var portRoot=portObj.svgRoot();

        // based on portObjType (rect, round) add the thing to it;
        // todo: currently allowing only round images, and round ports, extend that.
        // CL("drawing the port node"+portObj.renderType());


        if (portObj.renderType()===DEF.ROUND){
			// console.log("Adding Circle");
             portRoot.append("circle")
                 .attr("style","fill:#fff;")
                .attr("r", portObj.radius());
            // console.log("Adding Image"+ portObj.imageURL());
            if (portObj.renderAsImage()===true) {
                portRoot.append("image")
                    .attr('x', -portObj.radius())
                    .attr('y', -portObj.radius())
                    .attr('width', 2 * portObj.radius())
                    .attr('height', 2 * portObj.radius())
                    .attr("xlink:href", portObj.imageURL());
            }
        }

    };


    return function () {
        // Encapsulate into function to maintain default.module.path()
        return tools;
    };
})();