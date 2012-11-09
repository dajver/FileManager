// запускаем функции при входе в программу
window.addEventListener('load', function () {
    document.addEventListener('deviceready', onDeviceReady, false);
}, false);

/** Переменная файловой системы*/
var root = null; 
/** Текущая директория*/
var currentDir = null;
/** Прилегающая к текущей директории папки*/
var parentDir = null;
/** Куда кликнули*/
var activeItem = null;
/** Тип, файл или папка*/
var activeItemType = null;
 
/** фонгеп запущен и мы можем его использовать*/
function onDeviceReady(){
    $('#backBtn').hide();
    
    getFileSystem();
    clickItemAction();
}


/** Открываем нужную нам директорию*/
function getFileSystem(){
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
        function(fileSystem){ // если все хорошо
            root = fileSystem.root;
            listDir(root);
        }, function(evt){ // если ошибка
            console.log("File System Error: "+evt.target.error.code);
        }
    );
}


/** Выводим все что получили из директории*/
function listDir(directoryEntry){
    if( !directoryEntry.isDirectory ) 
        console.log('listDir incorrect type');
    $.mobile.showPageLoadingMsg(); // показываем окно загрузки
    
    currentDir = directoryEntry; // задаем текущую директрию
    directoryEntry.getParent(function(par){ // получаем прилегающие директории
        parentDir = par;
        if( (parentDir.name == 'sdcard' && currentDir.name != 'sdcard') || parentDir.name != 'sdcard' ) $('#backBtn').show();
    }, function(error) {
        console.log('Get parent error: '+error.code);
    });
    
    var directoryReader = directoryEntry.createReader();
    directoryReader.readEntries(function(entries) {
        var dirContent = $('#dirContent');
        dirContent.empty();
        
        var dirArr = new Array();
        var fileArr = new Array();
        for(var i=0; i<entries.length; ++i){ 
            var entry = entries[i];
            if( entry.isDirectory && entry.name[0] != '.' ) dirArr.push(entry);
            else if( entry.isFile && entry.name[0] != '.' ) fileArr.push(entry);
        }
        
        var sortedArr = dirArr.concat(fileArr);
        var uiBlock = ['a','b','c','d'];
        
        for(var i=0; i<sortedArr.length; ++i) { 
            var entry = sortedArr[i];
            if( entry.isDirectory )
                dirContent.append('<li id="folder" style="background: url(img/folder.png) no-repeat;"><a href="#" style="margin-left: 30px;">'+entry.name+'</a></li>').listview('refresh');
            else if( entry.isFile )
                dirContent.append('<li id="file" style="background: url(img/file.png) no-repeat;"><a href="#" style="margin-left: 30px;">'+entry.name+'</a></li>').listview('refresh');
        }
        $.mobile.hidePageLoadingMsg(); 
    }, function(error) {
        console.log('listDir readEntries error: '+error.code);
    });
}

/** Читаем файлы, получаем ссылку на файлы*/
function readFile(fileEntry) {
    if( !fileEntry.isFile ) console.log('readFile incorrect type');
    $.mobile.showPageLoadingMsg();
    
    fileEntry.file(function(file){
        var reader = new FileReader();
        reader.onloadend = function(evt) {
            console.log("Read as data URL");
            console.log(evt.target.result); 
        };
        reader.readAsDataURL(file);
        
        $.mobile.hidePageLoadingMsg(); 
        
       console.log(file.fullPath);
    }, function(error){
        console.log(evt.target.error.code);
    });
}

/** Открываем файл или директорию*/
function openItem(type) {
    if( type == 'd' ) {
        listDir(activeItem);
    } else if(type == 'f') {
        readFile(activeItem);
    }
}

/** Получаем текущую активную папку или файл*/
function getActiveItem(name, type){
    if( type == 'd' && currentDir != null ) {
        currentDir.getDirectory(name, {create:false},
            function(dir) { 
                activeItem = dir;
                activeItemType = type;
                openItem(type);
            }, 
            function(error) {
                console.log('Unable to find directory: '+error.code);
            });
    } else if(type == 'f' && currentDir != null) {
        currentDir.getFile(name, {create:false},
            function(file) {
                activeItem = file;
                activeItemType = type;
                openItem(type);
            },
            function(error) {
                console.log('Unable to find file: '+error.code);
            });
    }
}

/** Обрабатываем клики по айтемам*/
function clickItemAction() {
    var folders = $('#folder');
    var files = $('#file');
    var backBtn = $('#backBtn');
    var homeBtn = $('#homeBtn');
    /* menu buttons */
    var menuDialog = $('#menuOptions');
    var openBtn = $('#openBtn');
    var closeBtn = $('#closeBtn');
   
    
    folders.live('click', function() {
        var name = $(this).text();
        getActiveItem(name, 'd');
        $("#fileName").html("You realy want open folder " + name + " ?");
        $('#openBtn').trigger('click');
    });
    
    files.live('click', function() { 
        var name = $(this).text();
        getActiveItem(name, 'f');
        $("#fileName").html("You realy want open file " + name + " ?");
        $('#menu').trigger('click');
    });
    
    backBtn.click(function() {  
        if( parentDir != null ) 
            listDir(parentDir);
    });
    
    homeBtn.click(function() {
        if( root != null ) 
            listDir(root);
    });
    
    openBtn.click(function() {
        console.log(activeItemType);
        openItem(activeItemType);
        //menuDialog.dialog('close');
    });
    
    closeBtn.click(function() {
        menuDialog.dialog('close');
    });
}
