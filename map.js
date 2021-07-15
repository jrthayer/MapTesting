let scale = 1;
const el = document.querySelector('.map');
const ele = document.querySelector('html');
el.addEventListener('wheel', zoom, {passive:false});
ele.addEventListener('wheel', zoom, {passive:false});

let intViewportHeight = window.innerHeight;
let intViewportWidth = window.innerWidth;
let compStyles = window.getComputedStyle(el);

let maxHeight = compStyles.getPropertyValue('max-height');
maxHeight =  parseInt(maxHeight.slice(0, -2));


let container = document.querySelector('html');


function zoom(event) {
    event.preventDefault();
    
    if(event.deltaY > 0){
        scale = scale - .1;
        if(scale < 1){
            scale = 1;
        }

    }
    else if(event.deltaY < 0){
        scale = scale + .1;
        if(scale * intViewportHeight > maxHeight){
            scale = scale -.1;
        }

    }
   
    el.style.height = `${scale*100}vh`;
}



let pos = {startTime: 0, left: 0, top: 0, x: 0, y: 0, velX: 0, velY: 0};
ele.addEventListener('mousedown', (e) => mouseDownHandler(e));
el.addEventListener('mousedown', (e) => mouseDownHandler(e));

const mouseDownHandler = function(e) {
    ele.classList.add('grabbing');
    ele.style.userSelect = 'none';

    pos.left = ele.scrollLeft;
    pos.top = ele.scrollTop;
    pos.x = e.clientX;
    pos.y = e.clientY;
    pos.velX = 0;
    pos.velY = 0;
    pos.startTime = new Date();

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
    
    //end velocity movement on click.
    cancelMomentumTracking();
}

const mouseMoveHandler = function(e) {
    // How far the mouse has been moved
    const dx = e.clientX - pos.x;
    const dy = e.clientY - pos.y;

    // Scroll the element
    ele.scrollTop = pos.top - dy;
    ele.scrollLeft = pos.left - dx;

    //calculate velocity
    pos.velX = (ele.scrollLeft - pos.left)/ intViewportWidth * 100;
    pos.velY = (ele.scrollTop - pos.top) / intViewportHeight * 100;




    console.log(`scrollLeft: ${ele.scrollLeft}, posLeft: ${pos.left}`);
    console.log(`scrollTop: ${ele.scrollTop}, posTop: ${pos.top}`);
    console.log(`velX: ${pos.velX}, velY: ${pos.velY}`);
}

const mouseUpHandler = function() {
    ele.classList.remove('grabbing');
    ele.style.removeProperty('user-select');

    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);

    let durationHeld = (new Date() - pos.startTime)/1000.0;

    if(durationHeld < .3){
        //start momentum
        console.log("momentum!!");
        beginMomentumTracking();
    }
}

let momentumID;

function beginMomentumTracking(){
    cancelMomentumTracking();
    momentumID = requestAnimationFrame(momentumLoop);
}

function cancelMomentumTracking(){
    cancelAnimationFrame(momentumID);
}

function momentumLoop(){
    console.log(`RUNNING::: velX: ${pos.velX}, velY: ${pos.velY}`);
    ele.scrollLeft += pos.velX;
    ele.scrollTop += pos.velY;
    pos.velX *= .95;
    pos.velY *= .95;
    if(Math.abs(pos.velX) > 0.5 || Math.abs(pos.velY) > .5){
        momentumID = requestAnimationFrame(momentumLoop);
    }
}
