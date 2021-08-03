//data for map markers
let pointsData = [];

//map dimensions and moving variables
const mapInfo = {
    scale: 1,
    translate: {x: 0, y: 0},
    prevMouse: {x: 0, y: 0},
    edges: {top: 0, bottom: 0 , left: 0, right: 0},
    map: {baseHeight:0, baseWidth:0, height: 0, width: 0},
    larger: {height: false, width: false}
}

//html elements
const htmlElements = {
    map: document.querySelector('.map'),
    mapImage: document.querySelector('.map img'),
    container: document.querySelector('html'),
    settingsBar: document.querySelector('#settingsBar'),
    sidePanel: document.querySelector('#sidePanel'),
    panelInfo: document.querySelector("#panelInfo")
}

//variables for screen dimensions
let appHeight = window.innerHeight;
let appWidth = window.innerWidth;
console.log(`w: ${appWidth}, h: ${appHeight}`);
let navHeight = parseInt("50px");

let compStyles = window.getComputedStyle(htmlElements.map);
let maxHeight = parseInt(compStyles.getPropertyValue('max-height'));
let jsonFile = document.querySelector("#mapScript").getAttribute("mapJSON");

htmlElements.mapImage.onload = function(){
    //setMap Height and Width
    mapInfo.map.baseHeight = parseInt(compStyles.getPropertyValue('height'));
    mapInfo.map.baseWidth = parseInt(compStyles.getPropertyValue('width'));
    
    //center map
    htmlElements.map.style.left = `${appWidth/2 - mapInfo.map.baseWidth/2}px`;

    calcMapDimensions();
}

//using axios for getting files, included in html that includes this
window.addEventListener('load', async function(){
    //load info
    axios.get(jsonFile)
        .then(function (response) {
            htmlElements.mapImage.src = response.data.mapSrc;
            //handle success
            pointsData = response.data.points;
            for(let x = 0; x < pointsData.length; x++){
                //create point
                let newPoint = createPoint(pointsData[x]);
                
                newPoint.addEventListener('click', function(){
                    //attach toggle
                    htmlElements.sidePanel.classList.toggle('active');
                    
                    //populate sidepanel
                    let panelInfo = createPanel(pointsData[x]);
                    htmlElements.panelInfo.innerHTML = "";
                    htmlElements.panelInfo.appendChild(panelInfo);
                });

                htmlElements.map.appendChild(newPoint);
            }

            htmlElements.sidePanel.querySelector('button').addEventListener('click', function(){
                htmlElements.sidePanel.classList.remove('active');
            });
        })
        .catch(function (error) {
            //handle error
            return "error loading json";
        });
});

function createPoint(info){
    let point = document.createElement('div');
    point.classList.add('point');
    point.style.top = info.coordinates.top;
    point.style.left = info.coordinates.left;
    point.setAttribute("data-tooltip", info.name);
    return point;
}

function createPanel(info){
    let panel = document.createElement('div');

    let header = document.createElement('h2');
    header.textContent = info.name;
    panel.appendChild(header);

    let desc = document.createElement('p');
    desc.textContent = info.desc;
    panel.appendChild(desc);

    for(let x = 0; x < info.categories.length; x++){
        let category = document.createElement('div');
        category.classList.add('category');

        let categoryHeader = document.createElement('h3');
        categoryHeader.textContent = info.categories[x].title;
        category.appendChild(categoryHeader);

        let categoryBody = document.createElement('p');
        categoryBody.textContent = info.categories[x].info;
        category.appendChild(categoryBody);

        panel.appendChild(category);
    }

    return panel;
}

function calcMapDimensions(){
    //calculate img dimensions for moving boundries
    mapInfo.map.width = mapInfo.map.baseWidth * mapInfo.scale;
    mapInfo.map.height = mapInfo.map.baseHeight * mapInfo.scale;

    mapInfo.larger.width = mapInfo.map.width > appWidth;
    mapInfo.larger.height = mapInfo.map.height > appHeight - navHeight;
    
    //set edges
    mapInfo.edges.top = (appHeight - navHeight - mapInfo.map.height)/2 * -1;
    mapInfo.edges.bottom = (appHeight - navHeight - mapInfo.map.height)/2;
    mapInfo.edges.left = (appWidth - mapInfo.map.width)/2 * -1;
    mapInfo.edges.right = (appWidth - mapInfo.map.width)/2;
}


//================================
//Scale Map Size
//================================

//Event Listeners
htmlElements.container.addEventListener('wheel', function(event){
    if(event.deltaY > 0){
        zoom(-0.1);
    }
    else{
        zoom(0.1);
    }
}, {passive:false});

htmlElements.settingsBar.querySelector('button:nth-of-type(1)').addEventListener('click', function(){
    zoom(0.5);
});

htmlElements.settingsBar.querySelector('button:nth-of-type(2)').addEventListener('click', function(){
    zoom(-0.5);
});

//Scaling Function
function zoom(increment = 0){
    //increment scale
    mapInfo.scale += increment;

    //adjust scale edge cases
    if(mapInfo.scale < 1) mapInfo.scale = 1;
    if(mapInfo.scale * mapInfo.map.baseHeight > maxHeight) mapInfo.scale -= increment;

    //scale map img
    htmlElements.map.style.transform = `translate(${mapInfo.translate.x+"px"}, ${mapInfo.translate.y+"px"}) scale(${mapInfo.scale}) `;

    //update map dimensions
    calcMapDimensions();

    //check if out of bounds
    if(mapInfo.larger.height){
        if(mapInfo.translate.y > mapInfo.edges.top) mapInfo.translate.y = mapInfo.edges.top; 
        if(mapInfo.translate.y  < mapInfo.edges.bottom) mapInfo.translate.y = mapInfo.edges.bottom; 
    }
    else{
        if(mapInfo.translate.y < mapInfo.edges.top) mapInfo.translate.y = mapInfo.edges.top; 
        if(mapInfo.translate.y > mapInfo.edges.bottom) mapInfo.translate.y = mapInfo.edges.bottom; 
    }

    if(mapInfo.larger.width){
        if(mapInfo.translate.x > mapInfo.edges.left) mapInfo.translate.x = mapInfo.edges.left;
        if(mapInfo.translate.x < mapInfo.edges.right) mapInfo.translate.x = mapInfo.edges.right;
    }
    else{
        if(mapInfo.translate.x < mapInfo.edges.left) mapInfo.translate.x = mapInfo.edges.left;
        if(mapInfo.translate.x > mapInfo.edges.right) mapInfo.translate.x = mapInfo.edges.right;
    }

    htmlElements.map.style.transform = `translate(${mapInfo.translate.x+"px"}, ${mapInfo.translate.y+"px"}) scale(${mapInfo.scale}) `;

    console.log("===========");
    console.log(`Width: ${mapInfo.map.width}, Height: ${mapInfo.map.height}`);
    console.log(`Left: ${mapInfo.edges.left}, Top: ${mapInfo.edges.top}, Bottom: ${mapInfo.edges.bottom}`);
    console.log(`innerHeight: ${window.screen.availHeight}`);
}

//================================
//Drag and Move Map
//================================

//eventlisteners
htmlElements.container.addEventListener('pointerdown', (e) => mouseDownHandler(e));

//moving functions
const mouseDownHandler = function(e) {
    htmlElements.map.classList.add('grabbing');
    htmlElements.map.style.userSelect = 'none';

    //x and y of mouse on click
    mapInfo.prevMouse.x = e.clientX;
    mapInfo.prevMouse.y = e.clientY;

    document.addEventListener('pointermove', mouseMoveHandler);
    document.addEventListener('pointerup', mouseUpHandler);
}

const mouseMoveHandler = function(e){
    // How far the mouse has been moved
    const dx = e.clientX - mapInfo.prevMouse.x;
    const dy = e.clientY - mapInfo.prevMouse.y;

    const mapX = mapInfo.translate.x;
    const mapY = mapInfo.translate.y;

    //add mouse diff to current map offset
    if(mapInfo.larger.height){
        if(mapY + dy < mapInfo.edges.top && mapY + dy > mapInfo.edges.bottom) mapInfo.translate.y += dy;
    }
    else{
        if(mapY + dy > mapInfo.edges.top && mapY + dy < mapInfo.edges.bottom) mapInfo.translate.y += dy;
    }
    
    if(mapInfo.larger.width){
        if(mapX + dx < mapInfo.edges.left && mapX + dx > mapInfo.edges.right) mapInfo.translate.x += dx;
    }
    else{
        if(mapX + dx > mapInfo.edges.left && mapX + dx < mapInfo.edges.right) mapInfo.translate.x += dx;
    }
    
    //update transform with new value
    htmlElements.map.style.transform = `translate(${mapInfo.translate.x+"px"}, ${mapInfo.translate.y+"px"}) scale(${mapInfo.scale}) `;

    //update prevMouse to currentMouse
    mapInfo.prevMouse.x = e.clientX;
    mapInfo.prevMouse.y = e.clientY;
}

const mouseUpHandler = function() {
    htmlElements.map.classList.remove('grabbing');
    htmlElements.map.style.removeProperty('user-select');

    document.removeEventListener('pointermove', mouseMoveHandler);
    document.removeEventListener('pointerup', mouseUpHandler);
}

htmlElements.sidePanel.addEventListener('pointerdown', (e) => e.stopPropagation());
htmlElements.sidePanel.addEventListener('wheel', (e) => e.stopPropagation());