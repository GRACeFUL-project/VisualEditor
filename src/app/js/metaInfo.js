module.exports = function (graph) {
    var metaInfo={};
    var infoContainer;
    var selectedFiles;
    // search for better way , scope things into objects or smth
    var title;
    var comment;
    var loadedFileName;


    metaInfo.setup=function(){
        infoContainer=d3.select("#metaInfoObject");
        var tools=document.createElement('div');
        var loaderPath,uploadButton,exportButton;
        var loaderPathContainer=document.createElement('div'),
            uploadButtonContainer=document.createElement('div'),
            exportButtonContainer=document.createElement('div');

        loaderPath=document.createElement('input');
        loaderPath.id="jsonFilePath";
        loaderPath.type="file";
        loaderPath.autocomplete="off";
        loaderPath.placeholder="load a json File";
        loaderPath.setAttribute("class", "inputPath");
        //loaderPath.setAttribute("class", "hidden");

        // check for childeren
        var htmlCollection = loaderPath.children;
        var numEntries = htmlCollection.length;
        console.log("children "+numEntries);


        uploadButton=document.createElement('button');
        uploadButton.type="submit";
        uploadButton.innerHTML="Upload";
        uploadButton.id="uploadButton";
        uploadButton.setAttribute("class", "inputUpLoader");
        uploadButton.disabled=false;





        exportButton=document.createElement('a');
        // <a href="#" download id="exportJson">Export as JSON</a></li>
        exportButton.href="#";
        exportButton.download="";
        exportButton.innerHTML="Save/Export";
        exportButton.id="exportButton";
        exportButton.setAttribute("class", "inputUpLoader");

        loaderPathContainer.appendChild(loaderPath);
        uploadButtonContainer.appendChild(uploadButton);
        exportButtonContainer.appendChild(document.createElement('br'));
        exportButtonContainer.appendChild(exportButton);
        tools.appendChild(loaderPathContainer);
        tools.appendChild(uploadButtonContainer);
        tools.appendChild(exportButtonContainer);

        infoContainer.node().appendChild(tools);


        var loaderPathNode=d3.select("#jsonFilePath");
        loaderPathNode.on("input",function(){
            selectedFiles = loaderPathNode.property("files");
            if (selectedFiles>0)
                uploadButton.disabled=false;
            else
                uploadButton.disabled=false;
        });

        var uploadButtonNode=d3.select("#uploadButton");
        uploadButtonNode.on("click",function(){
            var test=loaderPathNode.property("files");
		    console.log("test "+test);
			selectedFiles = loaderPathNode.property("files");
			if (selectedFiles.length===0)
			    return;
            console.log("testFile"+selectedFiles);
            console.log("File "+selectedFiles[0].name);
            var file=selectedFiles[0];
            loadedFileName=file.name;
            var exportButton=d3.select("#exportButton");
            exportButton.disabled=false;
            var reader = new FileReader();
            reader.readAsText(file);

            reader.onload = function () {
                graph.setJSONInputText(reader.result);
            };

        });

        var exportButton=d3.select("#exportButton");
        exportButton.on("click",writeJSON);



        // console.log("labelNode"+loaderLabelNode);
        // loaderLabelNode.on("click",function(){
        //     loaderPathNode.onchange();
        //
        //
        //
        // });


        //
        // narf.on("change", function () {
        //     var selectedFiles = narf.property("files");
        //     if (selectedFiles.length <= 0) {
        //         uploadButton.disabled=true;
        //     }else{
        //         uploadButton.disabled=false;
        //     }
        // });
        //
        // //
        // <div class="converter-form">
        //     <input class="hidden" type="file" id="file-converter-input" autocomplete="off">
        //     <label class="truncate" id="file-converter-label" for="file-converter-input">Select ontology file</label>
        // <button type="submit" id="file-converter-button" autocomplete="off" disabled>
        // Upload
        // </button>
        // </div>


        // <input type="text" id="iri-converter-input" placeholder="Enter ontology IRI">
        //  <button type="submit" id="iri-converter-button" disabled>Visualize</button>



        var header= document.createElement('h2');
        header.id="metaInfo";
        header.innerHTML="Meta Info";

        title= document.createElement('h5');
        title.innerHTML="Title : EMPTY";

        comment= document.createElement('h5');
        comment.innerHTML="Comment : EMPTY";


        infoContainer.node().appendChild(header);
        infoContainer.node().appendChild(title);
        infoContainer.node().appendChild(comment);
        // <h2 id="metaInfo">Meta Info</h2>
        // <h5>Name: <span id="ontoName"></span></h5>
        //     <h5>Comment: <span id="ontoComment"></span></h5>
        //     <h5>Iri: <span id="ontoIRI"></span></h5>
        //     <h5>Version: <span id="version"></span></h5>
        //     <h5>Author(s): <span id="authors"></span></h5>
        //     <h5>Nodes: <span id="ontoNodes"></span></h5>
        //     <h5>Edges: <span id="ontoEdges"></span></h5>
    };


    metaInfo.title=function(t){
        if (!arguments.length) return title;
        title=t;
    };
    metaInfo.comment=function(c){
        if (!arguments.length) return comment;
        comment=c;
    };


    function writeJSON(){
        var exportJsonButton=d3.select("#exportButton");
        var jOBJ= graph.getOutputJSON();
        console.log("want to write JSON to "+loadedFileName);
        var exportText = JSON.stringify(jOBJ, null, '  ');
        console.log("data:  "+ exportText);

        var dataURI = "data:text/json;charset=utf-8," + encodeURIComponent(exportText);
        exportJsonButton.attr("href", dataURI)
            .attr("download", loadedFileName );

    }


    return metaInfo;

};