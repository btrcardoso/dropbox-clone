class SwitchController {
    constructor(themeLight) {
        this.themeDark =themeLight;
        this.btnSwitchThemeEl = document.querySelector("#switch-theme");
        this.navEl = document.querySelector(".navbar");
        this.listFilesEl = document.querySelector(".list-group");
        this.toastEl = document.querySelector(".toast-progress");
        this.toastHeaderEl = document.querySelector(".toast-header");
        this.modalEl = document.querySelector(".modal-content");
        this.initEvents();
        this.changeTheme();
    }
    
    initEvents(){
        this.btnSwitchThemeEl.addEventListener('click', ()=>{
            this.changeTheme();
        });
    }

    changeListTheme(){
        this.listFilesEl.querySelectorAll("a.list-group-item").forEach(item=>{
            item.classList.toggle("dark-theme",this.themeDark);
         });
    }

    changeTheme(){
        this.themeDark = !this.themeDark;
        document.body.classList.toggle("dark-theme",this.themeDark);

        this.navEl.classList.toggle("dark-theme",this.themeDark);
        this.navEl.classList.toggle("navbar-dark",this.themeDark);

        document.querySelectorAll(".btn").forEach(btn=>{
            btn.classList.toggle("dark-theme",this.themeDark);
            btn.classList.toggle("btn-dark",this.themeDark);
        });
        
        this.toastHeaderEl.classList.toggle("dark-theme",this.themeDark);
        this.toastEl.classList.toggle("dark-theme",this.themeDark);
        this.modalEl.classList.toggle("dark-theme",this.themeDark);

        this.changeListTheme();
    }
}