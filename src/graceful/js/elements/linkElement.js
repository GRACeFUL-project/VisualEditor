module.exports = function () {
	var o = function (graph) {
		var text = "None",
			that = this,
			// some flags
			opt=graph.options(),
			LINK_COLOR = "#ffffff", // usually black
			LINK_COLOR_HIGHLIGH = "#ff0000",
			LINK_SIZE = 2,
			ARROW_SIZE=2,
			pathElement,

			STROKE_TYPE_SOLID=0,
			STROKE_TYPE_DOTTED=3,
			STROKE_TYPE_DASHED=8,
			// arrow heads
			force_link,

			linkLayer,
			domain,
			range,
			svgRoot;

		this.linkDistType = function () {
			// LOOP, CLASS_CLASS, DATA_CLASS

			if (that.linkType() === "LOOP")
				return "LOOP";
			if (that.linkType() === "NODE_LINK")
				return "NODE_LINK";
			else {
				if (domain.renderType() === "RECTANGULAR" ||
					range.renderType() === "RECTANGULAR") {
					return "DATA_CLASS";
				} else {
					return "CLASS_CLASS";
				}
			}

		};

		/** Setter and getter ----------------------------------------------------------------------------------------*/
		this.svgRoot = function (root) {
			if (!arguments.length) return svgRoot;
			svgRoot = root;
			linkLayer = svgRoot.append('g');
			return this;
		};
		this.domain = function (node) {
			if (!arguments.length) return domain;
			domain = node;
			return this;
		};
		this.range = function (node) {
			if (!arguments.length) return range;
			range = node;
			return this;
		};

		this.linkColor = function (color) {
			if (!arguments.length)
				return LINK_COLOR;
			LINK_COLOR = color;
			return this;
		};

		this.getLinkForceLinks = function () {
			force_link=[];
			 var linkObj = {
			 "source": that.domain(),
			 "target": that.range(),
			 "linkDistType": that.linkDistType
			 };
			force_link.push(linkObj);
			return force_link;
		};


		/** -- Rendering Things -- **/
		this.drawLinkElements = function () {
			drawLink();
		};

		function drawNodeLink() {
			pathElement = linkLayer.append("path")
				.attr("d", lineFunction(calculateLinkPath))
				.attr('style', "stroke: " + LINK_COLOR + ";stroke-width: " + LINK_SIZE + ";stroke-dasharray:"+STROKE_TYPE+";");
		}


		this.updateLinkElements = function () {
			updateLink();
		};

		function updateLink() {
			var v_x = range.x - domain.x;
			var v_y = range.y - domain.y;

			var len = Math.sqrt(v_x * v_x + v_y * v_y);

			var normedX = v_x / len;
			var normedY = v_y / len;
			var radX = normedX * domain.radius();
			var radY = normedY * domain.radius();
			var friendX = v_x - normedX * range.radius();
			var friendY = v_y - normedY * range.radius();

			// start and end positions
			var startX = radX;
			var startY = radY;

			//	console.log("---------------updating link"+[startX,startY,friendX,friendY]);
			pathElement.attr("x1", domain.x + startX);
			pathElement.attr("y1", domain.y + startY);
			pathElement.attr("x2", domain.x + friendX);
			pathElement.attr("y2", domain.y + friendY);


		}


		function drawLink() {
			//console.log("domain " + domain);
			//console.log("range " + range);
			var v_x = range.x - domain.x;
			var v_y = range.y - domain.y;
			if (v_x === 0 && v_y === 0) {
				if (range !== domain) {
					range.x = Math.random() * 5;
					range.y = Math.random() * 10;
					v_x = range.x - domain.x;
					v_y = range.y - domain.y;
				}
			}
			// normalize it
			var len = Math.sqrt(v_x * v_x + v_y * v_y);
			var normedX = v_x / len;
			var normedY = v_y / len;
			var radX = normedX * domain.radius();
			var radY = normedY * domain.radius();
			var friendX = v_x - normedX * range.radius();
			var friendY = v_y - normedY * range.radius();

			// start and end positions
			pathElement = linkLayer.append("line")
				.attr("x1", domain.x + radX)
				.attr("y1", domain.x + radY)
				.attr("x2", range.x + friendX)
				.attr("y2", range.x + friendY)
				.attr('style', "stroke: " + LINK_COLOR + ";stroke-width: " + LINK_SIZE + ";stroke-dasharray: "+STROKE_TYPE+";");
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
