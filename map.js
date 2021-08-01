let mapInfo = {
    translate: {x: 0, y: 0},
    prevMouse: {x: 0, y: 0},
    scale: 1,
    edges: {top: 0, bottom: 0 , left: 0, right: 0},
    map: {height: 0, width: 0},
    larger: {height: false, width: false}
}

let intViewportHeight = window.innerHeight;
let intViewportWidth = window.innerWidth;
let navHeight = parseInt("50px");

let pos = {left: 0, top: 0, x: 0, y: 0};
const el = document.querySelector('.map');
const mapImage = document.querySelector('.map img');
const ele = document.querySelector('html');
const container = document.querySelector('html');
const mapInfoBar = document.querySelector('#mapWidth');
const settingsBar = document.querySelector('#settingsBar');
const points = document.querySelectorAll('.point');

let compStyles = window.getComputedStyle(el);



let maxHeight = compStyles.getPropertyValue('max-height');
maxHeight =  parseInt(maxHeight.slice(0, -2));

window.addEventListener('load', function(){
    pos.top = parseInt(compStyles.getPropertyValue('top'));
    el.style.top = pos.top+"px";

    pos.left = parseInt(compStyles.getPropertyValue('left'));
    el.style.left = pos.left+"px";
    mapImage.style.transform = `scale(${mapInfo.scale})`;
    el.style.transform += `translate3d(0, 0, 0)`;
    zoom(0);
});

ele.addEventListener('wheel', function(event){
    event.preventDefault();

    if(event.deltaY > 0){
        zoom(-0.1);
    }
    else{
        zoom(0.1);
    }
}, {passive:false});

settingsBar.querySelector('button:nth-of-type(1)').addEventListener('click', function(){
    zoom(0.5);
});

settingsBar.querySelector('button:nth-of-type(2)').addEventListener('click', function(){
    zoom(-0.5);
});

function zoom(increment = 0){
    //increment scale
    mapInfo.scale += increment;

    //adjust scale edge cases
    if(mapInfo.scale < 1) mapInfo.scale = 1;
    if(mapInfo.scale * intViewportHeight > maxHeight) mapInfo.scale -= increment;

    //scale map img
    mapImage.style.transform = `scale(${mapInfo.scale})`;
    //scale points
    for(point of points){
        point.style.transform = `scale(${mapInfo.scale})`;
    }

    //calculate img dimensions for moving boundries
    mapInfo.map.width = parseInt(window.getComputedStyle(mapImage).getPropertyValue('width')) * mapInfo.scale;
    mapInfo.map.height = parseInt(window.getComputedStyle(mapImage).getPropertyValue('height')) * mapInfo.scale;

    mapInfo.larger.width = mapInfo.map.width > innerWidth;
    mapInfo.larger.height = mapInfo.map.height > innerHeight;
    
    //set edges
    mapInfo.edges.top = (innerHeight - navHeight - mapInfo.map.height)/2 * -1;
    mapInfo.edges.bottom = (innerHeight - navHeight - mapInfo.map.height)/2;
    mapInfo.edges.left = (innerWidth - mapInfo.map.width)/2 * -1;
    mapInfo.edges.right = (innerWidth - mapInfo.map.width)/2;

    //check if out of bounds
    if(mapInfo.larger.height){
        if(mapInfo.translate.y > mapInfo.edges.top) 
        {
            mapInfo.translate.y = mapInfo.edges.top; 
        }

        if(mapInfo.translate.y < mapInfo.edges.bottom){
            mapInfo.translate.y = mapInfo.edges.bottom; 
        }
    }
    else{
        if(mapInfo.translate.y < mapInfo.edges.top) 
        {
            mapInfo.translate.y = mapInfo.edges.top; 
        }

        if(mapInfo.translate.y > mapInfo.edges.bottom){
            mapInfo.translate.y = mapInfo.edges.bottom; 
        }
    }

    if(mapInfo.larger.width){
        if(mapInfo.translate.x > mapInfo.edges.left){
            mapInfo.translate.x = mapInfo.edges.left;
        }

        if(mapInfo.translate.x < mapInfo.edges.right){
            mapInfo.translate.x = mapInfo.edges.right;
        }
    }
    else{
        if(mapInfo.translate.x < mapInfo.edges.left){
            mapInfo.translate.x = mapInfo.edges.left;
        }

        if(mapInfo.translate.x > mapInfo.edges.right){
            mapInfo.translate.x = mapInfo.edges.right;
        }
    }


    el.style.transform = `translate3d(${mapInfo.translate.x+"px"}, ${mapInfo.translate.y+"px"}, 0)`;
}

ele.addEventListener('mousedown', (e) => mouseDownHandler(e));

const mouseDownHandler = function(e) {
    ele.classList.add('grabbing');
    ele.style.userSelect = 'none';

    //x and y of mouse on click
    mapInfo.prevMouse.x = e.clientX;
    mapInfo.prevMouse.y = e.clientY;

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
}

const mouseMoveHandler = function(e){
    // How far the mouse has been moved
    const dx = e.clientX - mapInfo.prevMouse.x;
    const dy = e.clientY - mapInfo.prevMouse.y;

    const mapX = mapInfo.translate.x;
    const mapY = mapInfo.translate.y;

    //add mouse diff to current map offset
    if(mapInfo.larger.height){
        if(mapY + dy < mapInfo.edges.top && mapY + dy > mapInfo.edges.bottom){
            mapInfo.translate.y += dy;
        }
    }
    else{
        if(mapY + dy > mapInfo.edges.top && mapY + dy < mapInfo.edges.bottom){
            mapInfo.translate.y += dy;
        }
    }
    
    if(mapInfo.larger.width){
        
        if(mapX + dx < mapInfo.edges.left && mapX + dx > mapInfo.edges.right){
            mapInfo.translate.x += dx;
        }
    }
    else{
        if(mapX + dx > mapInfo.edges.left && mapX + dx < mapInfo.edges.right){
            mapInfo.translate.x += dx;
        }
    }
    
    //update transform with new value
    el.style.transform = `translate3d(${mapInfo.translate.x+"px"}, ${mapInfo.translate.y+"px"}, 0)`;

    //update prevMouse to currentMouse
    mapInfo.prevMouse.x = e.clientX;
    mapInfo.prevMouse.y = e.clientY;
}

const mouseUpHandler = function() {
    ele.classList.remove('grabbing');
    ele.style.removeProperty('user-select');

    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
}
