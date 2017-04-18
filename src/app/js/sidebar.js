/**
 * Contains the logic for the sidebar.
 * @param graph the graph that belongs to these controls
 * @returns {{}}
 */
module.exports = function (graph) {

	var sidebar = {},
		selectedNode;



	/**
	 * Setup the menu bar.
	 */
	sidebar.setup = function () {
		setupCollapsing();

	};


	function setupCollapsing() {
		// adapted version of this example: http://www.normansblog.de/simple-jquery-accordion/
		function collapseContainers(containers) {
			containers.classed("hidden", true);
		}

		function expandContainers(containers) {
			containers.classed("hidden", false);
		}

		var triggers = d3.selectAll(".accordion-trigger");

		// Collapse all inactive triggers on startup
		collapseContainers(d3.selectAll(".accordion-trigger:not(.accordion-trigger-active) + div"));

		triggers.on("click", function () {
			var selectedTrigger = d3.select(this);

			if (selectedTrigger.classed("accordion-trigger-active")) {
				collapseContainers(d3.select(selectedTrigger.node().nextElementSibling));
				selectedTrigger.classed("accordion-trigger-active", false);
			} else {

				expandContainers(d3.select(selectedTrigger.node().nextElementSibling));
				selectedTrigger.classed("accordion-trigger-active", true);
			}
		});
	}



	/** -----------------------------*/


	sidebar.updateEditInfo=function(node) {
        selectedNode=node;
        var editContainer = d3.select("#edit_DIV");
        clearEditInfo();
		if (selectedNode===undefined) return;
        // add name of the node

		// create table
        var table= document.createElement('table');
		// create table entry
        var nameEntry=document.createElement('tr');
        var nameEntryLeft=document.createElement('td');
        var nameEntryRight=document.createElement('td');


        nameEntryLeft.innerHTML = "Name ";
        nameEntryRight.innerHTML= node.nameValue(); // the given name in the library
		nameEntry.appendChild(nameEntryLeft);
        nameEntry.appendChild(nameEntryRight);
        table.appendChild(nameEntry);


        var LabelEdit = document.createElement('input');
        LabelEdit.type="text";
        LabelEdit.id="NODE_LABEL_EDIT";
        LabelEdit.placeholder="";
        LabelEdit.value=node.labelForCurrentLanguage();
        LabelEdit.setAttribute("class", "lineEdit");


// create table entry
        var labelEntry=document.createElement('tr');
        var labelEntryLeft=document.createElement('td');
        var labelEntryRight=document.createElement('td');
        labelEntryLeft.innerHTML = "Label "; // the Showing name in the graph.
        labelEntryRight.appendChild(LabelEdit);
        labelEntry.appendChild(labelEntryLeft);
        labelEntry.appendChild(labelEntryRight);

        table.appendChild(labelEntry);

        var hoverEdit = document.createElement('input');
        hoverEdit.type="text";
        hoverEdit.id="NODE_HOVER_EDIT";
        hoverEdit.placeholder="";
        hoverEdit.value=node.hoverText();
        hoverEdit.setAttribute("class", "lineEdit");

        var hoverEntry=document.createElement('tr');
        var hoverEntryLeft=document.createElement('td');
        var hoverEntryRight=document.createElement('td');
        hoverEntryLeft.innerHTML = "Hover Text"; // the Showing name in the graph.
        hoverEntryRight.appendChild(hoverEdit);
        hoverEntry.appendChild(hoverEntryLeft);
        hoverEntry.appendChild(hoverEntryRight);

        table.appendChild(hoverEntry);



        // get the parameters of the node;
		var params=node.getParamaters();
		for (var i=0;i<params.length;i++){
            var paramEntry=document.createElement('tr');
            var paramEntryLeft=document.createElement('td');
            var paramEntryRight=document.createElement('td');



            var paramEdit = document.createElement('input');
            paramEdit.type="text";
            paramEdit.id="paramId"+i;
            paramEdit.placeholder="";
            paramEdit.value=params[i].value;
            paramEdit.setAttribute("class", "lineEdit");

            paramEntryLeft.innerHTML = params[i].name+"<br>("+params[i].type+")"; // the Showing name in the graph.
            paramEntryRight.appendChild(paramEdit);
            paramEntry.appendChild(paramEntryLeft);
            paramEntry.appendChild(paramEntryRight);

            table.appendChild(paramEntry);

		}

        // add all update button;

        var updateAllButton=document.createElement('a');
        updateAllButton.innerHTML="Update All Entries";
        updateAllButton.id="updateAllButton";
        updateAllButton.setAttribute("class", "updateButtonDisabled");
        updateAllButton.onclick=function(){updateAllEntries()};

        var removeNodeButton=document.createElement('a');
        removeNodeButton.innerHTML="Remove";
        removeNodeButton.id="removeNodeButton";
        removeNodeButton.setAttribute("class", "removeButton");
        removeNodeButton.onclick=function(){removeNode()};

        editContainer.node().appendChild(table);
        editContainer.node().appendChild(document.createElement('br'));
        editContainer.node().appendChild(updateAllButton);
        editContainer.node().appendChild(removeNodeButton);

        //
        var trigger = d3.select("#edit_TRIGGER");
        trigger.classed("accordion-trigger-active", true);
        editContainer.classed("hidden", false);

        // adding the connections to the elements
        d3.select("#NODE_LABEL_EDIT").on("keydown", userInput);
        d3.select("#NODE_HOVER_EDIT").on("keydown", userInput);
        for ( i=0;i<params.length;i++) {
            var idString = "#paramId" + i;
            d3.select(idString).on("keydown", userInput);
        }

        createPortsInfo();
        var portsTrigger = d3.select("#port_TRIGGER");
        var portContainer = d3.select("#port_DIV");
        portsTrigger.classed("accordion-trigger-active", true);
        portContainer.classed("hidden", false);

    };
    function createPortsInfo(){
        var editContainer = d3.select("#port_DIV");
        var ports=selectedNode.getPortObjs();

        // create table entry

        var updateAllButton=document.createElement('a');
        updateAllButton.innerHTML="Update All Port Entries";
        updateAllButton.id="updateAllButton2";
        updateAllButton.setAttribute("class", "updateButtonDisabled");
        updateAllButton.onclick=function(){updateAllEntries()};
        editContainer.node().appendChild(updateAllButton);
        editContainer.node().appendChild(document.createElement('br'));
        editContainer.node().appendChild(document.createElement('br'));

        for (var i=0;i<ports.length;i++){
            var table= document.createElement('table');
            var nameEntry=document.createElement('tr');
            var nameEntryLeft=document.createElement('td');
            var nameEntryRight=document.createElement('td');

            nameEntryLeft.innerHTML = "Name ";
            nameEntryRight.innerHTML= ports[i].labelForCurrentLanguage(); // the given name in the library
            nameEntry.appendChild(nameEntryLeft);
            nameEntry.appendChild(nameEntryRight);
            table.appendChild(nameEntry);


            // try to add the ports value;
            var portVal=ports[i].getValue();
            if (portVal){
                var valueEntry=document.createElement('tr');
                var valueEntryLeft=document.createElement('td');
                var valueEntryRight=document.createElement('td');

                valueEntryLeft.innerHTML = "Value ";
                valueEntryRight.innerHTML= portVal; // the given name in the library
                valueEntry.appendChild(valueEntryLeft);
                valueEntry.appendChild(valueEntryRight);
                table.appendChild(valueEntry);
            }


            var imgEntry=document.createElement('tr');
            var imgEntryLeft=document.createElement('td');
            var imgEntryRight=document.createElement('td');
            var img=document.createElement('img');
            img.setAttribute('src', ports[i].imageURL());
            img.setAttribute('alt', 'na');
            img.setAttribute('height', '40px');
            img.setAttribute('width', '40px');
            img.setAttribute('style',"background-color:white"); // just for now;
            imgEntryLeft.innerHTML = "Image ";
            imgEntryRight.appendChild(img);
            imgEntry.appendChild(imgEntryLeft);
            imgEntry.appendChild(imgEntryRight);
            table.appendChild(imgEntry);


            var hoverEdit = document.createElement('input');
            hoverEdit.type="text";
            hoverEdit.id="PORT_HOVER_EDIT"+i;
            hoverEdit.placeholder="";
            hoverEdit.value=ports[i].hoverText();
            hoverEdit.setAttribute("class", "lineEdit");

            var hoverEntry=document.createElement('tr');
            var hoverEntryLeft=document.createElement('td');
            var hoverEntryRight=document.createElement('td');
            hoverEntryLeft.innerHTML = "Hover Text"; // the Showing name in the graph.
            hoverEntryRight.appendChild(hoverEdit);
            hoverEntry.appendChild(hoverEntryLeft);
            hoverEntry.appendChild(hoverEntryRight);

            table.appendChild(hoverEntry);
            if (ports[i].portUsed()) {

                var removeEntry = document.createElement('tr');
                var removeEntryLeft = document.createElement('td');
                var removeEntryRight = document.createElement('td');
                removeEntryLeft.innerHTML = "Connection";
                var removePortButton = document.createElement('a');
                removePortButton.innerHTML = "Remove";
                removePortButton.id = "portId " + i;
                removePortButton.setAttribute("class", "removePortButton");
                removePortButton.onclick = function () {
                    removePort(removePortButton);
                };
                removeEntryRight.appendChild(removePortButton);
                removeEntry.appendChild(removeEntryLeft);
                removeEntry.appendChild(removeEntryRight);
                table.appendChild(removeEntry);
            }





            editContainer.node().appendChild(table);
            editContainer.node().appendChild(document.createElement('br'));



        }


        for (i=0;i<ports.length;i++){
            var idString = "#PORT_HOVER_EDIT" + i;
            d3.select(idString).on("keydown", userInputPort);
        }
	}

	function removePort(sender){
        var senderId=sender.id;
        var temp=senderId.indexOf(" ");
        var id=senderId.substr(temp,senderId.length);

        var index=parseInt(id);
        var node=selectedNode;

        var port=node.getPortObjs()[index];
        var other=port.connectedPorts();
        graph.removeLinksBetweenPorts(other[0],port);

        sidebar.updateEditInfo(node);
        node.focused(false);
        node.toggleFocus();

        graph.removeLinkBetweenNodes(other[0].getParentNodeElement(),port.getParentNodeElement());

   }

    function clearEditInfo(){
        var editContainer=d3.select("#edit_DIV");
        var  htmlCollection = editContainer.node().children;
        var numEntries = htmlCollection.length;
        for (var i = 0; i < numEntries; i++)
            htmlCollection[0].remove();

        var portsContainer=d3.select("#port_DIV");
        var port_Trigger=d3.select("#port_TRIGGER");
        var portHtmlCollection=portsContainer.node().children;
        numEntries = portHtmlCollection.length;
        for (i = 0; i < numEntries; i++)
            portHtmlCollection[0].remove();

        var trigger=d3.select("#edit_TRIGGER");
        trigger.classed("accordion-trigger-active", false);
        port_Trigger.classed("accordion-trigger-active", false);

        editContainer.classed("hidden", true);
        portsContainer.classed("hidden", true);
    }

	function userInput(){
        var bt= d3.select("#updateAllButton").node();
        bt.setAttribute("class", "updateButton");
        if (d3.event.keyCode === 13) {
            updateAllEntries();
        }
	}

    function userInputPort(){
        var bt= d3.select("#updateAllButton2").node();
        bt.setAttribute("class", "updateButton");
        if (d3.event.keyCode === 13) {
            updateAllEntries();

        }
    }

	function removeNode(){
		graph.removeNode(selectedNode);

	}

	function updateAllEntries(){
        var newLabel= d3.select("#NODE_LABEL_EDIT").node().value;
        selectedNode.label(newLabel);

        var newHoverText=d3.select("#NODE_HOVER_EDIT").node().value;
        selectedNode.hoverText(newHoverText);

        // update the parameters;
        var params=selectedNode.getParamaters();
        for (var i=0;i<params.length;i++){
            var valueId="paramId"+i;
            var newValue= d3.select("#"+valueId).node().value;
            var valueType=params[i].type;
            if (valueType.toLowerCase()==="float"){
                newValue=parseFloat(newValue);
			}
			if (valueType.toLowerCase()==="int" ||valueType.toLowerCase()==="integer"){
                newValue=parseInt(newValue);
			}

            params[i].value=newValue;
        }
        var ports=selectedNode.getPortObjs();
        for (i=0;i<ports.length;i++) {
            var portId = "PORT_HOVER_EDIT" + i;
            var portHoverTxt = d3.select("#" + portId).node().value;
            ports[i].hoverText(portHoverTxt);
        }

        graph.update();
        selectedNode.setFocusedHighlight();
        var bt= d3.select("#updateAllButton").node();
        bt.setAttribute("class", "updateButtonDisabled");
        var bt2= d3.select("#updateAllButton2").node();
        bt2.setAttribute("class", "updateButtonDisabled");

	}


    return sidebar;
};
