class listFilesController {
    constructor(){
        this.currentFolder = ["Home"];
        this.onselectionchange = new Event('selectionchange');
        this.listFilesEl = document.querySelector(".list-group");
        this.btnSendFilesEl = document.querySelector("#btn-send-files");
        this.btnNewFolder = document.querySelector("#btn-new-folder");
        this.btnDelete = document.querySelector("#btn-delete");
        this.btnRename = document.querySelector("#btn-rename");
        this.inputFilesEl = document.querySelector("#input-files");
        this.olBreadCrumb = document.querySelector(".breadcrumb");
        this.toastProgressEl = document.querySelector("#toast-progress");
        this.inputName = document.querySelector("#input-new-name");
        this.btnSubmitNewName = document.querySelector("#btn-submit-new-name");
        this.btnCloseModal = document.querySelector("#btn-close-modal");
        this.eventNewFolder;
        this.lastASelected;
        this.lastIndex;
        this.numberOfFiles=0;
        this.initEvents(); 
        this.openFolder(this.currentFolder.join("/"));
    }

    getElementsSelected(){
        return this.listFilesEl.querySelectorAll("a.list-group-item.selected");
    }

    styleButtons(){
        switch(this.getElementsSelected().length){
            case 0:
                this.btnDelete.style.display = 'none';
                this.btnRename.style.display = 'none';
                break;
            case 1:
                this.btnDelete.style.display = 'block';
                this.btnRename.style.display = 'block';
                break;
            default:
                this.btnDelete.style.display = 'block';
                this.btnRename.style.display = 'none';
        }
    }

    //problem
    validateName(name,a=false,restriction = ["/",".", "#", "$", "[","]"]){
        if(name!=null){
            let condition = true;
            let errMsg = "";
            restriction.forEach(item=>{
                if(name.indexOf(item)>=0) condition = false;
                errMsg+=item+" ";
            });
            if(condition){
                this.ajaxPromise("POST","/files").then(response=>{
                    let repeatName = 0;
                    response.data.forEach(file=>{
                        if(name==file.key || name==file.items.name) {
                            repeatName+=1;
                        }
                    });
                    if(repeatName==0) {
                        if(a){
                            this.rename(a,name);
                        } else {
                           this.createNewFolder(name);
                        }
                    } else {
                        alert("You cannot use this name.");
                    }
                });
            } else {
                alert("Do not use "+errMsg+"in name.");
            }
        }
    }

    createNewFolder(name){
        this.showToastProgress();
        this.addChanges(name,"/new_folder");
    }

    rename(a,newName){
        this.showToastProgress();
        let key = JSON.parse(a.dataset.key);
        let file = JSON.parse(a.dataset.file);
        let type = file.type;
        let content;
        let url;
        let oldName = file.name;
        file.name = newName;
        if(type=="folder"){
            content = JSON.stringify({key, file, oldName, newName});
            url = `/folder_rename`;
        } else {
            content = JSON.stringify({key, file});
            url = `/file_rename`;
        }
        this.addChanges(content,url,this.currentFolder.join("/"));    
    }

    addContentOnInputName(content=""){
        this.inputName.value = content;
    }

    initEvents(){
        this.listFilesEl.addEventListener('selectionchange',e=>{
            this.styleButtons();
        });

        this.btnSendFilesEl.addEventListener('click',()=>{
            this.inputFilesEl.click();
        });  

        this.inputFilesEl.addEventListener('change',event=>{
            let folder = this.currentFolder.join('/');
            this.numberOfFiles += [...event.target.files].length;
            let promises = [];
            [...event.target.files].forEach(file=>{
                let formData = new FormData();
                formData.append('content',file);
                promises.push(this.ajaxPromise("POST","/file_upload",formData,folder,(event)=>{
                    this.uploadProgress(event, file);
                }).then(response=>{
                    if(!response.err) {
                        this.renderList();
                    } else {
                        console.error(response.err);
                        this.changeContenOfToastProgressBody("Didn't is possible to do the changes");
                    }
                }));
            });
            Promise.all(promises).then(responses=>{
                this.showToastProgress(false);
            });
        });

        this.btnNewFolder.addEventListener('click',event=>{
            this.addContentOnInputName();
            this.eventNewFolder = true;
        });

        this.btnSubmitNewName.addEventListener('click',event=>{
            let newName = this.inputName.value;
            if(this.eventNewFolder){
                if(newName=="") newName = "New folder";
                this.validateName(newName);
            } else {
                let a = this.getElementsSelected()[0];
                let file = JSON.parse(a.dataset.file)
                let oldName = file.name;
                if(newName=="" || newName==oldName) newName=null;
                if(file.type == "folder"){
                    this.validateName(newName,a);
                } else {
                    this.validateName(newName,a,["/"]);
                }
            }
            this.btnCloseModal.click();
        });

        this.btnDelete.addEventListener('click',event=>{
            this.showToastProgress();
            let content;
            let key;
            let file;
            this.getElementsSelected().forEach(a=>{
                key = JSON.parse(a.dataset.key);
                file = JSON.parse(a.dataset.file);
                content=JSON.stringify({key, file});
                this.addChanges(content,'/delete',this.currentFolder.join('/'));
            });
        });


        /*

        this.btnDelete.addEventListener('click',event=>{
            this.showToastProgress();
            let contentArray = [];
            let key;
            let file;
            this.getElementsSelected().forEach(a=>{
                key = JSON.parse(a.dataset.key);
                file = JSON.parse(a.dataset.file);
                contentArray.push(JSON.stringify({key, file}));
            });
            this.addChanges(contentArray,'/delete',this.currentFolder.join('/'),'content[]');
        });


        */

        document.addEventListener('keydown',e=>{
            if(e.key=='Delete'){
                this.btnDelete.click();
            }
        });

        this.btnRename.addEventListener('click',event=>{
            let a = this.getElementsSelected()[0];
            let oldName = JSON.parse(a.dataset.file).name;
            this.addContentOnInputName(oldName);
            this.eventNewFolder = false;
        });
    }

    addChanges(content,url,folder=this.currentFolder.join("/"),contentName='content'){
        this.disabledButtons();
        let formData = new FormData();
        formData.append(contentName,content);
        this.ajaxPromise("POST",url,formData,folder).then(response=>{
            if(!response.err) {
                this.renderList();
                this.showToastProgress(false);
                this.disabledButtons(false);
            } else {
                console.error(response.err);
                this.changeContenOfToastProgressBody("Didn't is possible to do the changes");
            }
        });
    }

    showToastProgress(bool = true){
        if (bool){
            this.toastProgressEl.classList.remove('hide');
            this.toastProgressEl.classList.add('show');
        } else {
            this.toastProgressEl.classList.remove('show');
            this.toastProgressEl.classList.add('hide');
        }
        this.changeContenOfToastProgressBody();
        this.changeContenOfToastProgressHeader();
    }

    changeContenOfToastProgressBody(body=`Working...`){
        this.toastProgressEl.querySelector(".toast-body").innerHTML = body;
    }

    changeContenOfToastProgressHeader(header=`Loading`){
        this.toastProgressEl.querySelector(".toast-header").innerHTML = `<strong class="me-auto">${header}</strong>`;
    }

    showNumberOfFilesOnToastProgressHeader(){
        let s = (this.numberOfFiles==1)?``:`s`;
        this.changeContenOfToastProgressHeader(`Sending ${this.numberOfFiles} file`+s);
    }

    uploadProgress(event,file){
        this.showToastProgress();
        let percent = (event.loaded*100)/event.total;
        this.showNumberOfFilesOnToastProgressHeader();
        this.changeContenOfToastProgressBody(`Loading ${file.name} <strong>${parseInt(percent)}%</strong>`);
    }

    ajaxPromise(method="GET",url="",formData=new FormData(),folder=this.currentFolder.join("/"),onprogress=function(){},onloadstart=function(){}){
        return new Promise ((resolve,reject)=>{
            formData.append('folder',folder);
            let xhr = new XMLHttpRequest();
            xhr.open(method,"/library"+url);
            xhr.upload.onloadstart = onloadstart;
            xhr.upload.onprogress = onprogress; 
            xhr.send(formData);
            xhr.onload = event=>{
                try{
                    resolve(JSON.parse(xhr.responseText));
                } catch (e) {
                    reject(e);
                }
            };
        });
    }


    getIcon(type){
        switch(type){
            case 'folder':
                return 'folder';
                break;
            case 'image/jpeg':
            case 'image/png':
            case 'image/jpg':
            case 'image/gif':
                return 'image';
                break;
            case 'audio/mp3':
            case 'audio/ogg':
                return 'file-music';
                break;
            case 'video/mp4':
                return 'film';
                break;
            default:
                return 'file-earmark-check';
                break;
        }
    }

    disabledButtons(bool = true){
        this.btnNewFolder.disabled = bool;
        this.btnSendFilesEl.disabled = bool;
        this.btnDelete.disabled = bool;
        this.btnRename.disabled = bool;
    }

    renderList(){
        this.disabledButtons();
        this.ajaxPromise("POST","/files").then(response=>{
            this.listFilesEl.innerHTML="";
            response.data.forEach(file=>{
                // the second if is to the case of a folder to have type in its name.
                if (file.items.type && typeof file.items.type!="object"){
                    let a = document.createElement("a");
                    a.classList.add("list-group-item","list-group-item-action","a-item");
                    a.dataset.file = JSON.stringify(file.items);
                    a.dataset.key = JSON.stringify(file.key);
                    let limit = 60;
                    let name = file.items.name.substr(0,limit);
                    if(file.items.name.length>limit) name +="...";
                    a.innerHTML = `
                    <div class="container">
                        <div class="row align-items-start">
                            <div class="col">
                                <svg class="bi" width="23" height="23" fill="currentColor">
                                <use xlink:href="bootstrap-icons/bootstrap-icons.svg#${this.getIcon(file.items.type)}"/>
                                </svg> 
                                ${name}
                            </div>
                        </div>
                    </div>`;
                    this.listFilesEl.appendChild(a);
                }
            });

            if(response.data.length==0) this.listFilesEl.innerHTML="There are no files.";
            window.switch.changeListTheme();
            this.initEventsItem();
            this.disabledButtons(false);
            this.lastASelected = undefined;

            if(this.numberOfFiles>0){
                this.numberOfFiles=this.numberOfFiles -1;
                this.showNumberOfFilesOnToastProgressHeader();
            }

            this.styleButtons();
        });
    }

    openFolder(folder){
        this.olBreadCrumb.innerHTML = "";
        let folders = [];
        for(let i = 0; i<this.currentFolder.length; i++){
            let li = document.createElement('li');
            li.classList.add('breadcrumb-item');
            li.innerHTML = (i != this.currentFolder.length - 1) ? `<a href="#">${this.currentFolder[i]}</a>` : `${this.currentFolder[i]}` ;
            folders.push(this.currentFolder[i]);
            li.dataset.path = folders.join('/');
            this.olBreadCrumb.appendChild(li);
            if(i != this.currentFolder.length - 1){
                li.addEventListener('click',()=>{
                    this.currentFolder = li.dataset.path.split('/');
                    this.openFolder();
                });
            }
        }
        this.listFilesEl.innerHTML="Loading...";
        this.renderList();
    }

    listFilesArray(){
        return this.listFilesEl.querySelectorAll("a.list-group-item");
    }

    initEventsItem(){
        this.listFilesArray().forEach((a,indexA)=>{
            a.addEventListener('dblclick',e=>{
                let data = JSON.parse(a.dataset.file);
                switch(data.type){
                    case 'folder':
                        this.currentFolder.push(data.name);
                        this.openFolder(data.name);
                        break;
                    default:
                        window.open('/library/file?path='+data.path)
                }
            });
            a.addEventListener('click',e=>{
                if(e.shiftKey && this.lastASelected){
                    let indexStart;
                    let indexEnd;
                    let keyAtualA = JSON.parse(a.dataset.key);
                    for(let i = 0; i < this.listFilesArray().length/*-1*/;i++){
                        let keyItemList = JSON.parse(this.listFilesArray()[i].dataset.key);
                        indexStart = i;
                        if(keyItemList===this.lastASelected.key){
                            indexEnd = indexA;
                            break;
                        }
                        if(keyItemList===keyAtualA){
                            indexEnd = this.lastASelected.index;
                            break;
                        }
                    }
                    if(this.lastIndex){
                        for(let i = this.lastIndex.indexStart; i<=this.lastIndex.indexEnd; i++){
                            this.listFilesArray()[i].classList.remove('selected');
                        }
                    }
                    for(let i = indexStart; i<=indexEnd; i++){
                        this.listFilesArray()[i].classList.add('selected');
                    }
                    this.lastIndex = {indexStart,indexEnd};    
                } else {
                    if(!e.ctrlKey){
                        this.listFilesEl.querySelectorAll('a.list-group-item.selected').forEach(el=>{
                            el.classList.remove('selected');
                        });
                    }
                    a.classList.toggle("selected");
                    this.lastASelected = {index:indexA,key:JSON.parse(a.dataset.key)};
                    this.lastIndex = undefined;
                }
                this.listFilesEl.dispatchEvent(this.onselectionchange);
           });
        });
    }

}