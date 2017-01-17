module.exports = function ( grunt ) {
	"use strict";
	// load all grunt tasks
	require( "matchdep" )
		.filterDev( "grunt-*" )
		.forEach( grunt.loadNpmTasks );

	// var bowerPath = "bower_components/",
	// jQueryUiTheme = bowerPath + "jquery-ui/themes/base/";

	grunt.initConfig( {
		meta: {
			package: grunt.file.readJSON( "package.json" ),
		},

		sass: {
			dist: {
				options: {
					style: "nested"
				},
				files: {
					"css/cpt.css": "_scss/cpt.scss"
				}
			}
		},

		cssmin: {
			options: {
				keepSpecialComments: 0,
			},
			dist: {
				files: [ {
					expand: true,
					cwd: "css",
					src: [ "*.css", "!*.min.css" ],
					dest: "css",
					ext: ".min.css"
				} ]
			}
		},

		// watch for changes and trigger tasks
		watch: {
			scss: {
				files: [ "_scss/*.scss" ],
				tasks: [ "sass" ],
			},
			cssmin: {
				files: [ "css/*.css", "*.min.css" ],
				tasks: [ "cssmin:dist" ],
				options: {
					spawn: false,
					livereload: 35729
				},
			},
		},
	} );

	// register task
	grunt.registerTask( "default", [ "sass", "cssmin" ] );
	grunt.registerTask( "css", [ "sass", "cssmin:dist" ] );

};
