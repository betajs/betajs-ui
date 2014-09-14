module.exports = function(grunt) {
	
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		concat : {
			options : {
				banner : '/*!\n'
						+ '  <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n'
						+ '  Copyright (c) Oliver Friedmann\n'
						+ '  MIT Software License.\n' + '*/\n'
			},
			dist : {
				dest : 'dist/beta-ui.js',
				src : [
			        'src/elements/*.js',
			        'src/events/events_support.js',
			        'src/events/*.js',
			        'src/interactions/interactions.js',
			        'src/interactions/*.js',
			        'src/gestures/*.js',
				]
			},
		},
		uglify : {
			dist : {
				files : {
					'dist/beta-ui.min.js' : [ 'dist/beta-ui.js' ],
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	

	grunt.registerTask('default', ['concat', 'newer:uglify']);

};