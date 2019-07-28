var path = require('path');
var fs = require('fs');
//var async = require('async');


var getTree = function (dir, tree){
    
    tree = tree || [];
    var files = fs.readdirSync(dir);

    for (var i in files){
        
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
          tree.push({"text":files[i],"selectable":false,"nodes":[]});
            getTree(name, tree[tree.length-1].nodes);
        } else {
            tree.push({"text":files[i]});
        }
    }
    return tree;
};

module.exports.getTree = getTree;