#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var util = require('util');
var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://google.com";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertURLExists = function(url) {
    return url.toString();
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

// pg, experimenting

var build = function(data) {
  return data.toString();
}

var write_to_console = function(x){
  console.log(x.toString());
}

var cheerioURL = function(url){
  rest.get(url).on('complete', build);
  return cheerio.load(x);
}

var getResp1 = function(url) {
  rest.get(url).on('complete', write_to_console); 
}

function getResp(url){
  rest.get(url).on('complete', function(response){
    processResponse(response);
  });
};

function processResponse(data) {
  // converting Buffers to strings is expensive, so I prefer
  // to do it explicitely when required
  var str = data.toString();
  console.log(str);
};

// end of experimentations

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};


// first version, not controlling errors

var checkURL = function(url, checksfile) {
    rest.get(url).on('complete', function(response){
    processURL(response, checksfile);
    });
};

var processURL = function(data, checksfile) {
    var str = data.toString();
//     console.log(str);
    $ = cheerio.load(str);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
//         console.log(ii + $(checks[ii]));
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    var outJson = JSON.stringify(out, null, 4);
    console.log(outJson); 
    console.log("------");
};

// second version, better.
var buildfn = function(checksfile) {
  var responseFunction = function(result) {
    if (result instanceof Error) {
      console.error('Error: ' + util.format(result.message));
    } else {
    var str = result.toString();
//     console.log(str);
    $ = cheerio.load(str);
    
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {   
//         console.log(ii + $(checks[ii]));
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    var outJson = JSON.stringify(out, null, 4);
    console.log(outJson); 
    }
  };
  return responseFunction;
}

var checkURLnew = function(url, checksfile) {
    var responseFunction = buildfn(checksfile);
    rest.get(url).on('complete', responseFunction)
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
//         .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
//         .option('-u, --url <url>', 'URL', clone(assertURLExists), URL_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), null)
        .option('-u, --url <url>', 'URL', clone(assertURLExists), null)
        .parse(process.argv);  
// These members .file, .checks, .url are created from the .option thing.
// using the commander module.
//     console.log(program.file);
//     console.log(program.url);
    if (program.file) {
      var checkJson = checkHtmlFile(program.file, program.checks);
      var outJson = JSON.stringify(checkJson, null, 4);
      console.log(outJson);
      }
    if (program.url)
//       checkURL(program.url, program.checks);
      checkURLnew(program.url, program.checks);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}

// getResp('http://google.com/');
// getResp('http://gentle-journey-7368.herokuapp.com/');
