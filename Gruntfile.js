module.exports = function(grunt) {

  var mapDotDotUrlToLib = function(req, res, next) {
    url_parts = req.url.split('/');
    if (url_parts.length > 2 && ['lib', 'test'].indexOf(url_parts[1]) == -1) {
      req.url = '/lib' + req.url;
    }
    return next();
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('bower.json'),

    copyrightSince: function(year) {
      now = new Date().getFullYear();
      return year + (now > year ? '-' + now : '');
    },

    clean: {
      build: ['build'],
      dist: ['build', '**/*.log', 'lib', 'node_modules']
    },

    copy: {
      options: {
        processContent: function (content, srcpath) {
          return grunt.template.process(content);
        }
      },
      license: {
        src: 'tmpl/license.tmpl',
        dest: 'LICENSE.txt'
      }
    },

    sass: {
      dist: {
        files: grunt.file.expandMapping(['src/*.scss'], 'build/', {
          rename: function(dest, src) {
            return dest + src.replace(/src\/(.+)\.scss$/, '$1.css');
          }
        }),
        expand: false
      }
    },

    coffeelint: {
      src: ['src/*.coffee']
    },

    coffee: {
      build: {
        cwd: 'src/',
        src: ['*.coffee'],
        dest: 'build/',
        ext: '.js',
        expand: true
      }
    },

    htmlbuild: {
      dist: {
        src: 'src/*.html',
        dest: './',
        options: {
          scripts: {
            dist: ['build/*.js']
          },
          styles: {
            dist: ['build/*.css']
          },
          data: {
            copyright: grunt.file.read('tmpl/copyright.tmpl')
          }
        }
      },
      options: {
        beautify: true
      }
    },

    connect: {
      server: {
        options: {
          port: 8080,
          base: '.',
          middleware: function(connect, options, middlewares) {
            middlewares.unshift(mapDotDotUrlToLib);
            return middlewares;
          }
        }
      }
    },

    watch: {
      stylesheets: {
        files: 'src/*.scss',
        tasks: ['sass', 'htmlbuild']
      },
      scripts: {
        files: 'src/*.coffee',
        tasks: ['coffee', 'htmlbuild']
      },
      html: {
        files: ['index.html', 'src/*.html'],
        tasks: ['htmlbuild']
      },
      tests: {
        files: 'test/*.html',
        tasks: []
      },
      options: {
        livereload: true,
      }
    },

    bumpversion: {
      options: {
        files: ['bower.json'],
        updateConfigs: ['pkg'],
        commit: true,
        commitFiles: ['-a'],
        commitMessage:'Bump version number to %VERSION%',
        createTag: true,
        tagName: '%VERSION%',
        tagMessage:'Version %VERSION%',
        push: false
      }
    },

    changelog: {
      options: {
      }
    }
  });

  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-conventional-changelog');
  grunt.loadNpmTasks('grunt-html-build');
  grunt.loadNpmTasks('grunt-sass');

  grunt.registerTask('build', 'Compile all assets and create the distribution files',
    ['sass', 'coffeelint', 'coffee', 'htmlbuild']);

  grunt.task.renameTask('bump', 'bumpversion');

  grunt.registerTask('bump', '', function(versionType) {
    versionType = versionType ? versionType : 'patch';
    grunt.task.run(['bumpversion:' + versionType + ':bump-only',
      'build', 'copy:license', 'changelog', 'bumpversion::commit-only']);
  });

  grunt.registerTask('default', 'Build the software, start a web server and watch for changes',
    ['build', 'connect', 'watch']
  );
};
