module.exports = function () {

    var  logo={};
    var logoContainer;
    var drawFps=true;
    var drawForceNodesNumber=true;

    logo.setup=function(){
        logoContainer=d3.select("#logo");
        var logoIMG= document.createElement('IMG');
        logoIMG.setAttribute("src", "https://www.graceful-project.eu/wp-content/themes/graceful/images/favicon-160x160.png");
        logoIMG.setAttribute("width", "96");
        logoIMG.setAttribute("height", "96");
        logoContainer.node().appendChild(logoIMG);


        var fpsText= document.createElement('div');
        fpsText.id="framesText";
        fpsText.innerHTML="FPS:";
        logoContainer.node().appendChild(fpsText);
        if (drawFps===false)
            fpsText.style.visibility="hidden";



        var numForceNodes= document.createElement('div');
        numForceNodes.id="numForceNodes";
        numForceNodes.innerHTML="#forceNodes:";
        logoContainer.node().appendChild(numForceNodes);

        if (drawForceNodesNumber===false) {
            numForceNodes.style.visibility="hidden";
        }

        logo.drawFps=function(val){
            if (!arguments.length) return drawFps;
            drawFps=val;
            if (val===true)
                fpsText.style.visibility="visible";
             else
                fpsText.style.visibility="hidden";
        };

        logo.drawForceNodesNumber=function(val){
            if (!arguments.length) return drawForceNodesNumber;
            drawForceNodesNumber=val;
            if (val===true)
                numForceNodes.style.visibility="visible";
            else
                numForceNodes.style.visibility="hidden";

        };
    };

    return logo;

};