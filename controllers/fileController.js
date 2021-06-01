var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://dropbox-clone-7749c-default-rtdb.firebaseio.com'
});

var defaultDatabase = admin.database();

var formidable = require('formidable');
var fs= require('fs');

exports.index = (req,res) => {
    res.render('index',{title:'dropbox clone'});
};

exports.list_files_post = (req,res) => {
    const form = formidable();
    form.parse(req, (response, fields, files)=>{
        let data=[];
        defaultDatabase.ref(fields.folder).once('value', snapshot=>{
            snapshot.forEach(snapshotItem => {
                let key = snapshotItem.key;
                let items = snapshotItem.val();
                data.push({
                    key: key,
                    items: items
                });
            });
            res.json({data});
        });
    });
};

exports.file_upload_post = (req,res) => {
    let form = new formidable.IncomingForm({
        uploadDir: './upload',
        keepExtensions: true
      });
    form.parse(req, (err, fields, files) => {
        if(files.content){
            defaultDatabase.ref(fields.folder).push().set({
                name: files.content.name,
                size: files.content.size,
                type: files.content.type,
                path: files.content.path
            },error => {
                res.json({err:error});
            });
        }         
    });
};

exports.new_folder_post = (req,res) => {
    const form = formidable();
    form.parse(req, (err, fields, files) => {
        defaultDatabase.ref(fields.folder).push().set({
            name: fields.content,
            path: fields.folder,
            type: "folder"
        }, error => {
            res.json({err:error});
        });
    });
};

function deleteFile(path){
    if(fs.existsSync(path)){
      fs.unlink(path, err => {});
    }
}

function deleteFilesFromFolder(obj){
    Object.keys(obj).forEach(key=>{
        let item = obj[key];
        if(item.type){ //isn't folder
            deleteFile(item.path)
        } else { // is folder
            deleteFilesFromFolder(item);
        }
    });
}

exports.delete_post = (req,res) => {
    let form = new formidable.IncomingForm({
        multiples: true,
        uploadDir: './upload',
        keepExtensions: true
    });
    form.parse(req,(err,fields,files)=>{
    let content = JSON.parse(fields['content']);
    let name = content.file.name;
    let path = content.file.path;
    let type = content.file.type;
        if(type=='folder'){
            defaultDatabase.ref(path+'/'+name).once('value',snapshot=>{
                if(snapshot.val()) deleteFilesFromFolder(snapshot.val());
            }).then(function(){
                defaultDatabase.ref(fields.folder+"/"+name).remove().then(function(){
                    defaultDatabase.ref(fields.folder).child(content.key).remove().then(function() {
                        res.json({err:false});
                      })
                      .catch(function(error) {
                        res.json({err:error});
                      });
                }).catch(function(error){
                    res.json({err:error});
                });
            }).catch(function(error) {
                res.json({err:error});
            });
        } else {
            deleteFile(path);
            defaultDatabase.ref(fields.folder).child(content.key).remove().then(function() {
                res.json({err:false});
              })
              .catch(function(error) {
                res.json({err:error});
              });
        }
    });
};

exports.file_rename_post = (req,res)=>{
    const form = formidable();
    form.parse(req,(err,fields,files)=>{
        content= JSON.parse(fields.content);
        defaultDatabase.ref(fields.folder).child(content.key).set(content.file,
            error => {
            res.json({err:error});
        });
    });
};

function addFilesAndFolders(obj,folder,newName){
    Object.keys(obj).forEach(key=>{
        let item = obj[key];
        if(item.type){ //isn't folder
            if(item.type=='folder') item.path=folder+"/"+newName;
            defaultDatabase.ref(folder+"/"+newName).push().set(item);
        } else { // is folder
            addFilesAndFolders(item,folder, newName+"/"+key);
        }
    });
}

exports.folder_rename_post = (req,res)=>{
    const form = formidable();
    form.parse(req,(err,fields,files)=>{
        let content = JSON.parse(fields.content);
        defaultDatabase.ref(fields.folder).child(content.key).set(content.file,
            error => {
                if(error){
                    res.json({err:error});
                } else {
                    defaultDatabase.ref(fields.folder+"/"+content.oldName).once('value', snapshot=>{
                        if(snapshot.val()) addFilesAndFolders(snapshot.val(),fields.folder,content.newName);
                    }).then(function() {
                        defaultDatabase.ref(fields.folder+"/"+content.oldName).remove()
                          .then(function() {
                            res.json({err:false});
                          })
                          .catch(function(err) {
                            res.json({err});
                          });
                      })
                      .catch(function(err) {
                        res.json({err});
                      });
                }
            }
        );
    });
};

exports.file_get = (req,res)=>{
    let path = './'+req.query.path;
    if(fs.existsSync(path)){
        fs.readFile(path,(err,data)=>{
            if(err){
                console.error(err);
                res.status(400).json({error:err});
            } else{
                res.status(200).end(data);
            }
        });
    } else {
        res.status(404).json({error:'File not found'});
    }
}