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
				dest : 'dist/jquery-touch-gestures.js',
				src : [
			        'src/base.js',
			        'src/draggablex.js',
			        'src/sortabley.js',
				]
			},
		},
		uglify : {
			dist : {
				files : {
					'dist/jquery-touch-gestures.min.js' : [ 'dist/jquery-touch-gestures.js' ],
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	

	grunt.registerTask('default', ['concat', 'newer:uglify']);

};