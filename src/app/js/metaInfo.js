module.exports = function (graph) {
    var metaInfo={};
    var infoContainer;
    var selectedFiles;
    // search for better way , scope things into objects or smth
    var title;
    var comment;
	var allowExport=false;
    var loadedFileName;




	function setupUploadButton() {
		var input = d3.select("#file-converter-input"),
			inputLabel = d3.select("#file-converter-label"),
			uploadButton = d3.select("#file-converter-button");

		input.on("change", function () {
			var selectedFiles = input.property("files");
			if (selectedFiles.length <= 0) {
				inputLabel.text("Select ontology file");
				uploadButton.property("disabled", true);
			} else {
				inputLabel.text(selectedFiles[0].name);
				uploadButton.property("disabled", false);

				//keepOntologySelectionOpenShortly();
			}
		});

		uploadButton.on("click", function () {
			var selectedFile = input.property("files")[0];
			if (!selectedFile) {
				return false;
			}
			//var newHashParameter = "file=" + selectedFile.name;
			// Trigger the reupload manually, because the iri is not changing
			// if (location.hash === "#" + newHashParameter) {
			// 	loadOntologyFromFile();
			// } else {
			// 	location.hash = newHashParameter;
			// }
		});
	}

    metaInfo.setup=function(){
		var inputOutput=d3.select("#inputOutput");
        infoContainer=d3.select("#metaInfoObject");
        var tools=document.createElement('div');
        var loaderPath,exportButton;

        var uploadForm=document.createElement('form');
        uploadForm.id="uploadJson-Form";
        var uploadInput=document.createElement('input');
        uploadInput.type="text";
        uploadInput.id="JSON_INPUT";
        uploadInput.placeholder="Select JSON";
		uploadInput.setAttribute("class", "inputPath");
        var uploadButton2=document.createElement('button');
        uploadButton2.type="submit";
        uploadButton2.id="uploadButton2";
        uploadButton2.innerHTML="Upload";
        // set the parent hierarchy;
        uploadForm.appendChild(uploadInput);
        uploadForm.appendChild(uploadButton2);
		uploadButton2.setAttribute("class", "inputUpLoader");
		uploadButton2.disabled=true;



        var loaderPathContainer=document.createElement('div'),
            exportButtonContainer=document.createElement('div');

        loaderPath=document.createElement('input');
        loaderPath.id="jsonFilePath";
        loaderPath.type="file";
        loaderPath.style.display="none";
        loaderPath.autocomplete="off";
        loaderPath.placeholder="load a json File";
        loaderPath.setAttribute("class", "inputPath");


        exportButton=document.createElement('a');
        exportButton.href="#";
        exportButton.download="";
        exportButton.innerHTML=" Save/Export ";
        exportButton.id="exportButton";
        exportButton.setAttribute("class", "exportButton");

        loaderPathContainer.appendChild(loaderPath);
        exportButtonContainer.appendChild(document.createElement('br'));
        exportButtonContainer.appendChild(exportButton);

        tools.appendChild(uploadForm);
        tools.appendChild(loaderPathContainer);
        tools.appendChild(exportButtonContainer);


		var inputHeader= document.createElement('h2');
		inputHeader.id="inputHeader";
		inputHeader.innerHTML="Input Output";

		inputOutput.node().appendChild(inputHeader);
		inputOutput.node().appendChild(tools);


        var loaderPathNode=d3.select("#jsonFilePath");
        loaderPathNode.on("input",function(){
            selectedFiles = loaderPathNode.property("files");
        });

        var exportButton=d3.select("#exportButton");
        exportButton.on("click",writeJSON);


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

		// setup button connections;
		setupConverterButtons();
    };

	function setupConverterButtons(){
		console.log("Setting up");

		var le=d3.select("#JSON_INPUT");
		var fileSelect=d3.select("#jsonFilePath");

		console.log("le "+le);
		console.log("fs "+fileSelect);

		le.on("click",function(){
			console.log("le clicked");

			var hiddenBt=document.getElementById("jsonFilePath");
			hiddenBt.click();
		});

		var loaderPathNode=d3.select("#jsonFilePath");
		loaderPathNode.on("change",function(){
			selectedFiles = loaderPathNode.property("files");
			console.log("I have selected Files");
			if (selectedFiles.length===0)
				return;
			console.log("testFile"+selectedFiles);
			console.log("File "+selectedFiles[0].name);
			var le=document.getElementById("JSON_INPUT");
			le.value=selectedFiles[0].name;
			var bt=document.getElementById("uploadButton2");
			bt.disabled=false;

		});
		// connect upload button
		var upload=d3.select("#uploadButton2");
		upload.on("click",function(){
			var test=loaderPathNode.property("files");
			console.log("test "+test);
			allowExport=false;
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
			allowExport=true;
			d3.event.preventDefault();
			return false;
		});

	}

    metaInfo.title=function(t){
        if (!arguments.length) return title;
        title=t;
    };
    metaInfo.comment=function(c){
        if (!arguments.length) return comment;
        comment=c;
    };


    function writeJSON(){
    	if (allowExport===false) return;
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