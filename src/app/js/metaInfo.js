module.exports = function (graph) {




    var metaInfo={};
    var infoContainer;
    var selectedFiles;
    var selectedSolutionFiles;
    // search for better way , scope things into objects or smth
    var title;
    var comment;
	var allowExport=false;
    var loadedFileName;


    function createLinkSlider(container){
            // default init
        console.log("craeting slider");
        var min,max,val,step;
            if (min===undefined) min=50;
            if (max===undefined) max=500;
            if (val===undefined) val=100;
            if (step===undefined) step=50;

            var sliderContainer,
                sliderValueLabel;

            // create the slider


        console.log("craeting 2slider");
            var sliderC=document.createElement('div');
            sliderC.class="slideOption";
            sliderC.id="sliderID";
            container.appendChild(sliderC);




            var sliderX=d3.select('#sliderID');
            sliderX.append("div")
                .classed("distanceSliderContainer", true);
        console.log("craeti3ng slider");
            var slider = sliderX.append("input")
                .attr("id", identifier + "DistanceSlider")
                .attr("type", "range")
                .attr("min", min)
                .attr("max", max)
                .attr("value", val)
                .attr("step", step);

        sliderX.append("label")
                .classed("description", true)
                .attr("for", identifier + "DistanceSlider")
                .text(text);

            sliderValueLabel = sliderX.append("label")
                .classed("value", true)
                .attr("for", identifier + "DistanceSlider")
                .text(slider.attr("value"));

            // Store slider for easier resetting
            // sliderTexts.push(sliderValueLabel)
            // slider.on("input", function () {
            //     var val= slider.property("value");
            //     console.log("Slider value chaged: "+val);
            //     sliderValueLabel.text(val);
            //     onChangeFunc(val);
            //
            //     if (updateLevel===1) {
            //         graph.updateStyle();
            //     }
            //     if (updateLevel===2){
            //         graph.redraw();
            //     }
            //
            //     if (updateLevel===3 ){
            //         graph.update();
            //         graph.updateStyle();
            //     }


            // });

        //     // add wheel event to the slider
        //     slider.on("wheel",function(){
        //         var wheelEvent=d3.event;
        //         var offset;
        //         if (wheelEvent.deltaY<0) offset=1;
        //         if (wheelEvent.deltaY>0) offset=-1;
        //         var oldVal=parseInt(slider.property("value"));
        //         var newSliderValue=oldVal+offset*step;
        //         if (newSliderValue!==oldVal){
        //             slider.property("value",newSliderValue);
        //             slider.on("input")(); // << set text and update the graphStyles
        //         }
        //     });
        //     sliders.push(slider)
        // }
    }

    metaInfo.setup=function(){
		var inputOutput=d3.select("#inputOutput");
        infoContainer=d3.select("#metaInfoObject");
        var tools=document.createElement('div');


        var pauseBt=document.createElement('a');
        pauseBt.type="submit";
        pauseBt.href="#";
        pauseBt.download="";
        pauseBt.innerHTML="Pause";
        pauseBt.id="PauseButton";
        pauseBt.setAttribute("class", "exportButtonDisabled");


        var sliderC=document.createElement('div');
        sliderC.class="slideOption";
        sliderC.innerHTML="";
        sliderC.id="sliderID";
        tools.appendChild(sliderC);
        tools.appendChild(document.createElement('br'));
        tools.appendChild(pauseBt);
        tools.appendChild(document.createElement('br'));
        tools.appendChild(document.createElement('br'));



        //  createLinkSlider(inputOutput);

        var testLBt=document.createElement('button');
        testLBt.type="submit";
        testLBt.id="testLib";
        testLBt.innerHTML="Get Library";
        testLBt.setAttribute("class", "inputUpLoader");
        testLBt.disabled=true;






        tools.appendChild(testLBt);
        testLBt.onclick=function(){
            console.log("library sumit was pressed");
            var libName="http://localhost:8081/library/crud";
            // var xhr = new XMLHttpRequest();
            // xhr.overrideMimeType("application/json");
            // xhr.setRequestHeader("Access-Control-Allow-Methods", "GET");
            // xhr.open("GET", libName, true);
            // xhr.send();

             d3.xhr(libName, "application/json",function (error, request) {
                 if (request)

                     graph.setLibraryText(request.responseText);

            });
        };

        // create send model button
        var sendMBt=document.createElement('button');
        sendMBt.type="submit";
        sendMBt.id="testLib";
        sendMBt.innerHTML="Send Model";
        sendMBt.setAttribute("class", "inputUpLoader");
        sendMBt.disabled=true;
        tools.appendChild(sendMBt);

        sendMBt.onclick=function(){
            console.log("model  submit was pressed");
            // get the model
            var modelObj=  graph.getOutputJSON();
            var modelText = JSON.stringify(modelObj, null, '  ');
            var libName="http://localhost:8081/submit";
            //
            // d3.text(libName)
            //      .header("Content-Type", "application/json")
            //      .post(modelText, function(error, text) { console.log(text); });

            var xhr = new XMLHttpRequest();
            xhr.onload = function () {

                if (xhr.status === 200) {
                    console.log("Okay ---------------------------------------------------------");
                    console.log(xhr.responseText);

                }

            };


            xhr.open("POST", libName, true);
            xhr.setRequestHeader('Content-type', 'application/json');
            //
             xhr.send(modelText);


            // d3.xhr(libName, "application/json",function (error, request) {
            //     if (request)
            //         console.log(request.responseText);
            // });
        };





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


        // request solution
        var solution_uploadForm=document.createElement('form');
        solution_uploadForm.id="library_uploadJson-Form";
        var solution_uploadInput=document.createElement('input');
        solution_uploadInput.type="text";
        solution_uploadInput.id="SOLUTION_JSON_INPUT";
        solution_uploadInput.placeholder="Select Solution  JSON";
        solution_uploadInput.setAttribute("class", "inputPath");

        var hidden_solutionInput=document.createElement('input');
        hidden_solutionInput.id="HIDDEN_SOLUTION_JSON_INPUT";
        hidden_solutionInput.type="file";
        hidden_solutionInput.style.display="none";
        hidden_solutionInput.autocomplete="off";
        hidden_solutionInput.placeholder="load a json File";
        hidden_solutionInput.setAttribute("class", "inputPath");
        hidden_solutionInput.style.display="none";

        var requestSolutionButton=document.createElement('button');
        requestSolutionButton.type="submit";
        requestSolutionButton.id="requestSolutionButton";
        requestSolutionButton.innerHTML="Get Solution";
        requestSolutionButton.setAttribute("class", "inputUpLoader");
        requestSolutionButton.disabled=true;
        // set the parent hierarchy;
        solution_uploadForm.appendChild(solution_uploadInput);
        solution_uploadForm.appendChild(requestSolutionButton);
        solution_uploadForm.appendChild(hidden_solutionInput);
        tools.appendChild(document.createElement('br'));
        tools.appendChild(solution_uploadForm);




        // Meta info
		var inputHeader= document.createElement('h2');
		inputHeader.id="inputHeader";
		inputHeader.innerHTML="Input Output";

		inputOutput.node().appendChild(inputHeader);
		inputOutput.node().appendChild(tools);


		// element connections
        var loaderPathNode=d3.select("#HIDDEN_LIBRARY_JSON_INPUT");
        loaderPathNode.on("input",function(){
            selectedFiles = loaderPathNode.property("files");
        });

        var loaderSolutionPathNode=d3.select("#HIDDEN_SOLUTION_JSON_INPUT");
        loaderSolutionPathNode.on("input",function(){
            selectedSolutionFiles = loaderSolutionPathNode.property("files");
        });


        var sendModelButton2=d3.select("#sendModelButton");
        sendModelButton2.on("click",writeJSON);


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


        var sliderX=d3.select("#sliderID");
        console.log("sliderX"+sliderX);
        sliderX.append("div")
            .classed("distanceSliderContainer", true);
        console.log("craeti3ng slider");
        var slider = sliderX.append("input")
            .attr("id", "DistanceSlider")
            .attr("type", "range")
            .attr("min", 100)
            .attr("max", 1000)
            .attr("value", 400)
            .attr("step", 100);

        sliderX.append("label")
            .classed("description", true)
            .attr("for", "DistanceSlider")
            .text("Distance: ");

        var sliderValueLabel = sliderX.append("label")
            .classed("value", true)
            .attr("for", "DistanceSlider")
            .text(slider.attr("value"));


        slider.on("input", function () {
            var val = slider.property("value");
            sliderValueLabel.text(val);
            graph.updateLinkDistance(val);
        });



        var pBt=d3.select("#PauseButton");

        pBt.on('click',function(){
            var val=graph.paused();
            if (val===true) {
                pauseBt.innerHTML = "Pause";
                graph.updatePauseValue(!graph.paused());
            }else {
                pauseBt.innerHTML = "Play";
                graph.updatePauseValue(!graph.paused());
                }
            });

        // setup button connections;
        setupRequestLibraryButtons();
        setupRequestSolutionButton();
    };



    function setupRequestSolutionButton(){

        var le=d3.select("#SOLUTION_JSON_INPUT");
        le.on("click",function(){
            console.log("le clicked");
            var hiddenBt=document.getElementById("HIDDEN_SOLUTION_JSON_INPUT");
            hiddenBt.click();
        });

        var solutionLoaderPathNode=d3.select("#HIDDEN_SOLUTION_JSON_INPUT");
        solutionLoaderPathNode.on("change",function(){
            selectedSolutionFiles= solutionLoaderPathNode.property("files");
            if (selectedSolutionFiles.length===0)
                return;
            var le=document.getElementById("SOLUTION_JSON_INPUT");
            le.value=selectedSolutionFiles[0].name;
            var bt=document.getElementById("requestSolutionButton");
            bt.disabled=false;
        });
        // connect upload button
        var upload=d3.select("#requestSolutionButton");
        upload.on("click",function(){
            selectedSolutionFiles = solutionLoaderPathNode.property("files");
            if (selectedFiles.length===0)
                return;
            var file=selectedSolutionFiles[0];
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function () {
                graph.setJSON_SOLUTION_Text(reader.result);
            };
            d3.event.preventDefault();
            return false;
        });


    }

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