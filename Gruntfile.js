"use strict";

module.exports = function (grunt) {

	require("load-grunt-tasks")(grunt);
	var webpack = require("webpack");
	var webpackConfig = require("./webpack.config.js");

	var deployPath = "deploy/";

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		clean: {
			deploy: deployPath
		},
		copy: {
			dependencies: {
				files: [
					{expand: true, cwd: "node_modules/d3", src: ["d3.min.js"], dest: deployPath + "/js/"}
				]
			},
			static: {
				files: [
					{expand: true, cwd: "src/", src: ["favicon.ico"], dest: deployPath},
					{expand: true, src: ["license.txt"], dest: deployPath}
				]
			}
		},
		htmlbuild: {
			options: {
				beautify: true,
				relative: true,
				data: {
					// Data to pass to templates
					version: "<%= pkg.version %>"
				}
			},
			dev: {
				src: "src/index.html",
				dest: deployPath
			},
			release: {
				// required for removing the benchmark ontology from the selection menu
				src: "src/index.html",
				dest: deployPath
			}
		},
		jshint: {
			options: {
				jshintrc: true
			},
			source: ["src/**/*.js"],
		},
		karma: {
			options: {
			},
			dev: {},
			continuous: {
				singleRun: true
			}
		},
		replace: {
			options: {
				patterns: [
					{
						match: "GRACEFULL_VERSION",
						replacement: "<%= pkg.version %>"
					}
				]
			},
			dist: {
				files: [
					{expand: true, cwd: "deploy/js/", src: "graceful*.js", dest: "deploy/js/"}
				]
			}
		},
		webpack: {
			options: webpackConfig,
			build: {
				plugins: webpackConfig.plugins.concat(
					new webpack.optimize.DedupePlugin(),
					new webpack.optimize.UglifyJsPlugin()
				)
			},
			"build-dev": {
				devtool: "sourcemap",
				debug: true
			}
		},
		watch: {
			configs: {
				files: ["Gruntfile.js"],
				options: {
					reload: true
				}
			},
			js: {
				files: ["src/app/**/*", "src/graceful/**/*"],
				tasks: ["webpack:build-dev", "post-js"],
				options: {
					livereload: true,
					spawn: false
				}
			},
			html: {
				files: ["src/**/*.html"],
				tasks: ["htmlbuild:dev"],
				options: {
					livereload: true,
					spawn: false
				}
			}
		}
	});


	grunt.registerTask("default", ["release"]);
	grunt.registerTask("pre-js", ["clean:deploy",  "copy"]);
	grunt.registerTask("post-js", ["replace"]);
	grunt.registerTask("package", ["pre-js", "webpack:build-dev", "post-js", "htmlbuild:dev"]);
	grunt.registerTask("release", ["pre-js", "webpack:build", "post-js", "htmlbuild:release"]);
	grunt.registerTask("webserver", ["package", "connect:devserver", "watch"]);
};
