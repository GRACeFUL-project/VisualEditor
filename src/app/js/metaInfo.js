module.exports = function (graph) {
    var metaInfo={};
    var infoContainer;
    var selectedFiles;
    // search for better way , scope things into objects or smth
    var title;
    var comment;


    metaInfo.setup=function(){
        infoContainer=d3.select("#metaInfoObject");
        var loaderPath,uploadButton;

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
        uploadButton.disabled=true;


        infoContainer.node().appendChild(loaderPath);
        infoContainer.node().appendChild(uploadButton);

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
            console.log("test"+selectedFiles);
            console.log("File "+selectedFiles[0].name);
            var file=selectedFiles[0];
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function () {
                console.log("reading");
                graph.setJSONInputText(reader.result);
            };


        });

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



    return metaInfo;

};