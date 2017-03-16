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



        // Request Library
        var library_uploadForm=document.createElement('form');
        library_uploadForm.id="library_uploadJson-Form";
        var library_uploadInput=document.createElement('input');
        library_uploadInput.type="text";
        library_uploadInput.id="LIBRARY_JSON_INPUT";
        library_uploadInput.placeholder="Select   JSON";
        library_uploadInput.setAttribute("class", "inputPath");

        var hidden_libraryInput=document.createElement('input');
        hidden_libraryInput.id="HIDDEN_LIBRARY_JSON_INPUT";
        hidden_libraryInput.type="file";
        hidden_libraryInput.style.display="none";
        hidden_libraryInput.autocomplete="off";
        hidden_libraryInput.placeholder="load a json File";
        hidden_libraryInput.setAttribute("class", "inputPath");
        hidden_libraryInput.style.display="none";

        var requestLibraryButton=document.createElement('button');
        requestLibraryButton.type="submit";
        requestLibraryButton.id="requestLibraryButton";
        requestLibraryButton.innerHTML="Get Library";
        requestLibraryButton.setAttribute("class", "inputUpLoader");
        requestLibraryButton.disabled=true;
        // set the parent hierarchy;
        library_uploadForm.appendChild(library_uploadInput);
        library_uploadForm.appendChild(requestLibraryButton);
        library_uploadForm.appendChild(hidden_libraryInput);
        tools.appendChild(library_uploadForm);


        // Send model to the system
        // exportButton=document.createElement('a');
        // exportButton.href="#";
        // exportButton.download="";
        // exportButton.innerHTML="Send Model";
        // exportButton.id="exportButton";
        // exportButton.setAttribute("class", "exportButton");
        var sendModelButtonContainer=document.createElement('div');
            sendModelButtonContainer.appendChild(document.createElement('br'));
        var sendModelButton=document.createElement('a');
        sendModelButton.type="submit";
        sendModelButton.href="#";
        sendModelButton.download="";
        sendModelButton.innerHTML="Send Model";
        sendModelButton.id="sendModelButton";
        sendModelButton.setAttribute("class", "exportButtonDisabled");
        sendModelButtonContainer.appendChild(sendModelButton);
        tools.appendChild(sendModelButtonContainer);


        //
        // var loaderPathContainer=document.createElement('div'),
        //     exportButtonContainer=document.createElement('div');
        //
        // loaderPath=document.createElement('input');
        // loaderPath.id="jsonFilePath";
        // loaderPath.type="file";
        // loaderPath.style.display="none";
        // loaderPath.autocomplete="off";
        // loaderPath.placeholder="load a json File";
        // loaderPath.setAttribute("class", "inputPath");
        //
        //
        // var followPath=document.createElement('input');
        // followPath.id="followFilePath";
        // followPath.type="file";
        // followPath.style.display="none";
        // followPath.autocomplete="off";
        // followPath.placeholder="load a json File";
        // followPath.setAttribute("class", "inputPath");
        // var uploadFollow=document.createElement('button');
        // uploadFollow.type="submit";
        // uploadFollow.id="uploadFollow";
        // uploadFollow.innerHTML="Get Follow";
        // // set the parent hierarchy;
        // // uploadForm.appendChild(uploadInput);
        // // uploadForm.appendChild(uploadButton2);
        // // uploadButton2.setAttribute("class", "inputUpLoader");
        // // uploadButton2.disabled=true;
        //
        //
        //
        // exportButton=document.createElement('a');
        // exportButton.href="#";
        // exportButton.download="";
        // exportButton.innerHTML="Send Model";
        // exportButton.id="exportButton";
        // exportButton.setAttribute("class", "exportButton");
        //
        // loaderPathContainer.appendChild(loaderPath);
        // exportButtonContainer.appendChild(document.createElement('br'));
        // exportButtonContainer.appendChild(exportButton);
        //

        // tools.appendChild(loaderPathContainer);
        // tools.appendChild(exportButtonContainer);


		var inputHeader= document.createElement('h2');
		inputHeader.id="inputHeader";
		inputHeader.innerHTML="Input Output";

		inputOutput.node().appendChild(inputHeader);
		inputOutput.node().appendChild(tools);


        var loaderPathNode=d3.select("#HIDDEN_LIBRARY_JSON_INPUT");
        loaderPathNode.on("input",function(){
            selectedFiles = loaderPathNode.property("files");
        });

        var sendModelButton=d3.select("#sendModelButton");
        sendModelButton.on("click",writeJSON);


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
        setupRequestLibraryButtons();
    };

	function setupRequestLibraryButtons(){
		console.log("Setting up");
		var le=d3.select("#LIBRARY_JSON_INPUT");
		var fileSelect=d3.select("#HIDDEN_LIBRARY_JSON_INPUT");

		console.log("le "+le);
		console.log("fs "+fileSelect);

		le.on("click",function(){
			console.log("le clicked");
			var hiddenBt=document.getElementById("HIDDEN_LIBRARY_JSON_INPUT");
			hiddenBt.click();
		});

		var loaderPathNode=d3.select("#HIDDEN_LIBRARY_JSON_INPUT");
		loaderPathNode.on("change",function(){
			selectedFiles = loaderPathNode.property("files");
			console.log("I have selected Files");
			if (selectedFiles.length===0)
				return;
			console.log("testFile"+selectedFiles);
			console.log("File "+selectedFiles[0].name);
			var le=document.getElementById("LIBRARY_JSON_INPUT");
			le.value=selectedFiles[0].name;
			var bt=document.getElementById("requestLibraryButton");
			bt.disabled=false;


		});
		// connect upload button
		var upload=d3.select("#requestLibraryButton");
		upload.on("click",function(){
			var test=loaderPathNode.property("files");
			console.log("test "+test);
			selectedFiles = loaderPathNode.property("files");
			if (selectedFiles.length===0)
				return;
			console.log("testFile"+selectedFiles);
			console.log("File "+selectedFiles[0].name);
			var file=selectedFiles[0];
			loadedFileName=file.name;
            var sendModelButton=document.getElementById("sendModelButton");
            sendModelButton.setAttribute("class", "exportButton");
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
        var sendModelButton=d3.select("#sendModelButton");
        var jOBJ= graph.getOutputJSON();
        var exportText = JSON.stringify(jOBJ, null, '  ');
        var dataURI = "data:text/json;charset=utf-8," + encodeURIComponent(exportText);
        sendModelButton.attr("href", dataURI)
            .attr("download", "Model"+loadedFileName );

    }


    return metaInfo;

};