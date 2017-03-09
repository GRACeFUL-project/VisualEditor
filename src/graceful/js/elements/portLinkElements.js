module.exports = function () {
	var o = function (graph) {
			var that = this,
			// some flags
			LINK_COLOR = "#ffffff", // usually black
			LINK_SIZE = 5,
			pathElement,

			linkLayer,
			svgRoot;

			var portNodeA,portNodeB;

		this.setupPortConnection=function(elementA,elementB){
			portNodeA=elementA;
            portNodeB=elementB;

            portNodeA.addFriendPort(portNodeB);
            portNodeB.addFriendPort(portNodeA);
		};


		/** Setter and getter ----------------------------------------------------------------------------------------*/
		this.svgRoot = function (root) {
			if (!arguments.length) return svgRoot;
			svgRoot = root;
			return this;
		};

		this.linkColor = function (color) {
			if (!arguments.length)
				return LINK_COLOR;
			LINK_COLOR = color;
			return this;
		};

		/** -- Rendering Things -- **/
		this.drawLinkElements = function () {
			drawLink();

		};


		this.updateLinkElements = function () {
			updateLink();
		};

		function updateLink() {
			var parentA=portNodeA.getParentNodeElement();
            var parentB=portNodeB.getParentNodeElement();

            // if we have one to one connection :

			//update the portNodes;
		    var v_x = parentA.x  - parentB.x ;
        	var v_y = parentA.y  - parentB.y ;

        	var length=Math.sqrt(v_x*v_x+v_y*v_y);
        	var nX=v_x/length;
            var nY=v_y/length;




            pathElement .attr("x1", parentA.x+portNodeA.x)
                     		.attr("y1", parentA.y+portNodeA.y)
                     		.attr("x2", parentB.x+ portNodeB.x)
                     		.attr("y2", parentB.y+ portNodeB.y);

                // console.log(parentA.x+" "+parentA.y+" "+parentB.x+" "+parentB.y+" ");


        }





		function drawLink() {

			// coputing transformations; // linklayer is global;

			var parentA=portNodeA.getParentNodeElement();
            var parentB=portNodeB.getParentNodeElement();



			var v_x = parentA.x + portNodeA.x - parentB.x + portNodeB.x;
			var v_y = parentA.x + portNodeA.x - parentB.x + portNodeB.x;
			// if (v_x === 0 && v_y === 0) {

			// // normalize it
			// var len = Math.sqrt(v_x * v_x + v_y * v_y);
			// var normedX = v_x / len;
			// var normedY = v_y / len;
			// var radX = normedX * domain.radius();
			// var radY = normedY * domain.radius();
			// var friendX = v_x - normedX * range.radius();
			// var friendY = v_y - normedY * range.radius();
            //
			// // start and end positions
            console.log("want to draw port link on "+svgRoot );
            pathElement=svgRoot.append("line").attr("x1",parentA.x)
                .attr("y1", parentA.y)
                .attr("x2", parentB.x)
                .attr("y2", parentB.y)
                .attr('style', "stroke: " + "#f0f"+ ";stroke-width: " + 5+ ";");

		}

		function calculateRadian(angle) {
			angle = angle % 360;
			if (angle < 0) {
				angle = angle + 360;
			}
			return (Math.PI * angle) / 180;
		}

		function calculateAngle(radian) {
			return radian * (180 / Math.PI);
		}

		// end of OBJECT
	};
	o.prototype.constructor = o;
	return o;
}
;
