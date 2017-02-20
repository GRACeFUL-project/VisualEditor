module.exports = (function () {
    var tools = {};

    tools.drawNodeElement=function(node){
        var root=node.svgRoot();
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

    return function () {
        // Encapsulate into function to maintain default.module.path()
        return tools;
    };
})();