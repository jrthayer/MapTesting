//------------//------------//------------//------------//------------
//      TABLE OF CONTENTS
//------------//------------//------------//------------//------------
//      1. Initialization
//          1.1 Global Data Structures
//          1.2 Intialize Components
//      2. Features
//          2.1 Map Scale
//          2.2 Map Drag & Move
//          2.3 Side Panel
//          2.4 Resize Container
//      3. Helper Functions
//------------//------------//------------//------------//------------



//------------//------------//------------//------------
//      1. Initialization
//------------//------------//------------//------------


//------------//------------//------------ 
//  1.1 Global Data Structures 
//------------//------------//------------

//retrieve json file directory from html script
let jsonFile = document.querySelector("#mapScript").getAttribute("mapJSON");

//map dimensions and moving variables
const mapInfo = {
    scale: 1,
    translate: {x: 0, y: 0},
    prevMouse: {x: 0, y: 0},
    edges: {top: 0, bottom: 0 , left: 0, right: 0},
    map: {baseHeight:0, baseWidth:0, height: 0, width: 0, maxHeight:0},
    larger: {height: false, width: false},
    container: {height: 0, width: 0}
}

//html elements
const htmlElements = {
    map: document.querySelector('.map'),
    mapImage: document.querySelector('.map img'),
    container: document.querySelector('.mapContainer'),
    settingsBar: document.querySelector('#settingsBar'),
    sidePanel: document.querySelector('#sidePanel'),
    sidePanelBtn: document.querySelector('#sidePanelBtn'),
    bottomBtn: document.querySelector('#bottomBtn'),
    panelInfo: document.querySelector("#panelInfo"),
    pointsContainer: ""
}
 

//------------//------------//------------
//  1.2 Intialize Components
//------------//------------//------------

//after html page is loaded retrieve json file and generate page
//------------
//+used axios for get request
//+generates map on success
//+console error on failure
window.addEventListener('load', async function(){
    //load info
    axios.get(jsonFile)
        .then(function (response) {
            //load map image triggering onload function below
            htmlElements.mapImage.src = response.data.mapSrc;
            htmlElements.mapImage.classList.add('transition');
            //generate map points
            let pointsContainer = document.createElement('div');
            pointsContainer.id = 'pointsContainer';
            pointsContainer.classList.add('transition');
            let pointsData = response.data.points;
            let pointTypes = response.data.pointTypes;
            for(let x = 0; x < pointsData.length; x++){
                //create point
                let newPoint = createPoint(pointsData[x], pointTypes);
                
                newPoint.addEventListener('click', function(){
                    //attach toggle
                    
                    htmlElements.sidePanel.classList.add('active');
                    htmlElements.sidePanel.style.setProperty("--color700", newPoint.style.getPropertyValue("--color700"));
                    htmlElements.sidePanel.style.setProperty("--color400", newPoint.style.getPropertyValue("--color400"));

                    //populate sidepanel
                    htmlElements.panelInfo.scrollTo(0,0);
                    let panelInfo = createPanel(pointsData[x]);
                    htmlElements.panelInfo.innerHTML = "";
                    htmlElements.panelInfo.appendChild(panelInfo);
                });
                pointsContainer.appendChild(newPoint);
                
            }
            htmlElements.pointsContainer = pointsContainer;
            htmlElements.map.appendChild(pointsContainer);
        })
        .catch(function (error) {
            console.log(error);
        });
});

//set necessary variables after map img has loaded
//------------
htmlElements.mapImage.onload = function(){
    initialMapDimensions();
    calcMapDimensions();
}

//assemble map point and returns it
//------------
// info: 
function createPoint(info, types){
    let point = document.createElement('div');
    point.classList.add('point');
    point.style.top = info.coordinates.top;
    point.style.left = info.coordinates.left;

    let tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    tooltip.textContent = info.name;
    point.appendChild(tooltip);
    point.setAttribute("data-tooltip", info.name);

    //does not error check, each point needs to have proper type
    let color700 = types[info.type].color700;
    let color400 = types[info.type].color400;
    
    point.style.setProperty("--color700", color700);
    point.style.setProperty("--color400", color400);

    return point;
}

//assemble side panel innner content and returns it
//------------
// info:
function createPanel(info){
    let panel = document.createElement('div');
    let topCategory = document.createElement('div');
    topCategory.classList.add('category');

    let header = document.createElement('h2');
    header.textContent = info.name;
    topCategory.appendChild(header);

    let desc = document.createElement('p');
    desc.textContent = info.desc;
    topCategory.appendChild(desc);
    panel.appendChild(topCategory);

    for(let x = 0; x < info.categories.length; x++){
        let divider = document.createElement('div');
        divider.classList.add('divider');
        let left = document.createElement('div');
        let right = document.createElement('div');
        let middle = document.createElement('div');
        divider.append(left, right, middle);


        let category = document.createElement('div');
        category.classList.add('category');

        let categoryHeader = document.createElement('h3');
        categoryHeader.textContent = info.categories[x].title;
        category.appendChild(categoryHeader);

        let categoryBody = document.createElement('p');
        categoryBody.textContent = info.categories[x].info;
        category.appendChild(categoryBody);

        panel.appendChild(divider);
        panel.appendChild(category);
    }

    return panel;
}



//------------//------------//------------//------------
//      2. Features
//------------//------------//------------//------------


//------------//------------//------------
//  2.1 Map Scale
//------------//------------//------------

//functions
//------------//------------

//scales map
//------------
//+updates scale
//+checks for max and min map height
//+scales img and updates map variables
//+checks if image is out of bounds
function zoom(increment = 0){
    //increment scale
    mapInfo.scale += increment;

    //check for max and min height
    if(mapInfo.scale * mapInfo.map.baseHeight < mapInfo.container.height) mapInfo.scale = 1;
    if(mapInfo.scale * mapInfo.map.baseHeight > mapInfo.map.maxHeight) mapInfo.scale -= increment;

    //scale map img
    // htmlElements.map.style.transform = `translate(${mapInfo.translate.x+"px"}, ${mapInfo.translate.y+"px"}) scale(${mapInfo.scale}) `;
    htmlElements.mapImage.style.transform = `scale(${mapInfo.scale})`;
    htmlElements.pointsContainer.style.transform = `scale(${mapInfo.scale})`;
    //update map dimensions
    calcMapDimensions();
    // htmlElements.map.style.width = mapInfo.map.width+"px";
    // htmlElements.map.style.height = mapInfo.map.height+"px";

    let outOfBounds = false;

    //check if out of bounds
    checkBoundries();

    // Testing console log block
    // console.log("===========");
    // console.log(`Width: ${mapInfo.map.width}, Height: ${mapInfo.map.height}`);
    // console.log(`Left: ${mapInfo.edges.left}, Top: ${mapInfo.edges.top}, Bottom: ${mapInfo.edges.bottom}`);
    // console.log(`innerHeight: ${window.screen.availHeight}`);
}

//eventListeners
//------------//------------
htmlElements.container.addEventListener('wheel', function(event){
    if(event.deltaY > 0){
        zoom(-0.1);
    }
    else{
        zoom(0.1);
    }
});

htmlElements.settingsBar.querySelector('button:nth-of-type(1)').addEventListener('click', function(){
    zoom(0.5);
});

htmlElements.settingsBar.querySelector('button:nth-of-type(2)').addEventListener('click', function(){
    zoom(-0.5);
});


//------------//------------//------------
//  2.2 Map Drag & Move 
//------------//------------//------------

// functions
//------------//------------
const mouseDownHandler = function(e) {
    // change cursor when dragging map
    htmlElements.map.classList.add('grabbing');
    htmlElements.map.style.userSelect = 'none';

    //x and y of mouse on click
    mapInfo.prevMouse.x = e.clientX;
    mapInfo.prevMouse.y = e.clientY;

    // add move and up listeners
    document.addEventListener('pointermove', mouseMoveHandler);
    document.addEventListener('pointerup', mouseUpHandler);
}

const mouseMoveHandler = function(e){
    // How far the mouse has been moved
    const dx = e.clientX - mapInfo.prevMouse.x;
    const dy = e.clientY - mapInfo.prevMouse.y;

    //local variables for maps current x/y translation points to reduce line size
    const mapX = mapInfo.translate.x;
    const mapY = mapInfo.translate.y;

    //check bounds of map
    //------------ 
    //Two different behaviors depending on if the the map is larger or smaller than the container
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
    
    //update transform with new values
    // htmlElements.map.style.transform = `translate(${mapInfo.translate.x+"px"}, ${mapInfo.translate.y+"px"}) scale(${mapInfo.scale}) `;
    htmlElements.map.style.transform = `translate(${mapInfo.translate.x+"px"}, ${mapInfo.translate.y+"px"})`;
    
    

    //update prevMouse to currentMouse
    mapInfo.prevMouse.x = e.clientX;
    mapInfo.prevMouse.y = e.clientY;
}

const mouseUpHandler = function() {
    // cursor is no longer grabbing
    htmlElements.map.classList.remove('grabbing');
    htmlElements.map.style.removeProperty('user-select');

    // remove moving and mouse up listeners
    document.removeEventListener('pointermove', mouseMoveHandler);
    document.removeEventListener('pointerup', mouseUpHandler);
}

// eventListeners
//------------//------------
htmlElements.map.addEventListener('pointerdown', (e) => mouseDownHandler(e));


//------------//------------//------------
//  2.3 Side Panel
//------------//------------//------------

// eventListeners
//------------//------------
//close side panel with button 
htmlElements.sidePanelBtn.addEventListener('click', ()=> htmlElements.sidePanel.classList.toggle('active'));
htmlElements.bottomBtn.addEventListener('click', ()=> htmlElements.sidePanel.classList.remove('active'));

htmlElements.sidePanel.addEventListener('pointerdown', (e) => e.stopPropagation());
htmlElements.sidePanel.addEventListener('wheel', (e) => e.stopPropagation());


//------------//------------//------------
//  2.4 Resize Container
//------------//------------//------------

//intialize and adjust map variables when screen is resized 
window.addEventListener('resize', function(){
    initialMapDimensions();
    calcMapDimensions();
    checkBoundries();
});


// ======================================
//     3. Helper Functions
// ======================================

//update mapInfo values, presumably after width, height, or scale has changed
function calcMapDimensions(){
    //calculate img dimensions for moving boundries
    mapInfo.map.width = mapInfo.map.baseWidth * mapInfo.scale;
    mapInfo.map.height = mapInfo.map.baseHeight * mapInfo.scale;

    //determine if map is currently larger than it's container
    mapInfo.larger.width = mapInfo.container.width < mapInfo.map.width;
    mapInfo.larger.height = mapInfo.container.height < mapInfo.map.height;
    
    //set edges
    mapInfo.edges.top = (mapInfo.container.height - mapInfo.map.height)/2 * -1;
    mapInfo.edges.bottom = (mapInfo.container.height - mapInfo.map.height)/2;
    mapInfo.edges.left = (mapInfo.container.width - mapInfo.map.width)/2 * -1;
    mapInfo.edges.right = (mapInfo.container.width - mapInfo.map.width)/2;
}

function initialMapDimensions(){
    //set map container height and width
    let mapContainer = window.getComputedStyle(htmlElements.container);
    mapInfo.container.height = parseInt(mapContainer.getPropertyValue('height'));
    mapInfo.container.width = parseInt(mapContainer.getPropertyValue('width'));
    
    //set map height and width
    let compStyles = window.getComputedStyle(htmlElements.map);
    mapInfo.map.maxHeight = parseInt(compStyles.getPropertyValue('max-height'));
    mapInfo.map.baseHeight = parseInt(compStyles.getPropertyValue('height'));
    mapInfo.map.baseWidth = parseInt(compStyles.getPropertyValue('width'));

    //center map + set origin to center
    htmlElements.map.style.left = `${mapInfo.container.width/2 - mapInfo.map.baseWidth/2}px`;
    htmlElements.map.style.top = '0px';
}

function checkBoundries(){
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

    
    
    htmlElements.map.classList.add('transition');
    //move map to be in bounds, moves it to the same spot if not changed
    htmlElements.map.style.transform = `translate(${mapInfo.translate.x+"px"}, ${mapInfo.translate.y+"px"})`;
    setTimeout(function(){
        htmlElements.map.classList.remove('transition');
    }, 600);
}