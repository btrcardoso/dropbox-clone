var express = require("express");
var router = express.Router();

var file_controller = require('../controllers/fileController');

router.get('/',file_controller.index);

router.post('/files',file_controller.list_files_post);

router.post('/file_upload',file_controller.file_upload_post);

router.post('/new_folder',file_controller.new_folder_post);

router.post('/delete',file_controller.delete_post);

router.post('/file_rename',file_controller.file_rename_post);

router.post('/folder_rename',file_controller.folder_rename_post);

router.get('/file',file_controller.file_get);

module.exports = router;